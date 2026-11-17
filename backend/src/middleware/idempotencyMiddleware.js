const pool = require("../db/db");
const crypto = require("crypto");
const checkIdempotency = async (req, res, next) => {
  const key = req.get("Idempotency-Key");
  if (!key || key.length > 100) {
    return res
      .status(400)
      .json({ message: "Idempotency-Key header is required." });
  }
  const userId = req.user.clerkId;
  const hash = crypto
    .createHash('sha256')
    .update(req.originUrl+JSON.stringify(req.body))
    .digest('hex')

  const claimed = await pool.query(
    `INSERT INTO idempotency_keys (key_value,user_id,request_path,request_hash,state)
    VALUES($1,$2,$3,$4,'IN_PROGRESS')
    ON CONFLICT (user_id,key_value) DO NOTHING
    RETURNING id
    `,
    [key, userId, req.originalUrl, hash],
  );
  if (claimed.rowCount === 0) {
    const {
      rows: [old],
    } = await pool.query(
      `SELECT request_hash,state,response_status,response_body
      FROM idempotency_keys 
      WHERE user_id =$1 AND key_value=$2 `,
      [userId, key],
    );
    if (!old) return res.status(409).json({ message: "Please try again." });
    if (old.request_hash !== hash)
      return res
        .status(422)
        .json({ message: "This key was already used for a different request" });
    if (old.state == "IN_PROGRESS")
      return res
        .status(409)
        .json({ message: "This request is still being processed" });
    return res.status(old.response_status).json(old.response_body);
  }
  const send = res.json.bind(res);
  res.json = async (body) => {
    try {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await pool.query(
          `UPDATE idempotency_keys SET state = 'DONE', response_status = $1, response_body = $2
            WHERE user_id = $3 AND key_value = $4`,
          [res.statusCode, body, userId, key],
        );
      } else {
        await pool.query(
          `DELETE FROM idempotency_keys WHERE user_id = $1 AND key_value = $2`,
          [userId, key],
        );
      }
    } catch (err) {
      console.error("[Idempotency] Could not save the result:", err.message);
    }
    return send(body);
  };
  next();
};
module.exports = checkIdempotency;

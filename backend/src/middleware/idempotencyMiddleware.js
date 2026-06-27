const pool = require("../db/db");

const checkIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers["idempotency-key"];
  const clerk_user_id = req.auth.userId;

  if (!clerk_user_id) {
    return res.status(401).json({ message: "Unauthorized: No user id found" });
  }
  if (!idempotencyKey) {
    return next();
  }
  try {
    const checkQuery = await pool.query(
      `SELECT * from idempotency_keys WHERE key_value =$1 AND user_id =$2`,
      [idempotencyKey, clerk_user_id],
    );
    if (checkQuery.rows.length > 0) {
      console.log(
        `[Idempotency] Duplicate request blocked for key: ${idempotencyKey}`,
      );
      const savedReceipt = checkQuery.rows[0];

      return res
        .status(savedReceipt.response_status)
        .json(savedReceipt.response_body);
    }
    const originalJson = res.json;
    res.json = function (body) {
      const status = res.statusCode;
      const path = req.originalUrl;
      if (status >= 200 && status < 300) {
        pool.query(`
        INSERT INTO idempotency_keys(key_value,user_id,request_path,response_body,response_status)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (key_value) DO NOTHING`,[idempotencyKey,clerk_user_id,path,body,status])
        .catch(err => console.error("Failed to save receipt",err.message))
      }
      return originalJson.call(this,body);
    };
    next()
  } catch (error) {
    console.error("[Idempotency] Middleware Error:", error.message);
    next();
  }
};
module.exports = checkIdempotency;

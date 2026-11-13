const { Webhook } = require("svix");
const pool = require("../db/db");

const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET in .env");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // 1. Grab the security headers sent by Clerk
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  // 2. Verify the signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(400).json({ error: "Verification failed" });
  }

  // 3. Process the new user event
  const eventType = evt.type;
  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, primary_email_address_id, username } =
        evt.data;
      const primary =
        email_addresses.find((e) => e.id === primary_email_address_id) ||
        email_addresses[0];
      const finalUsername = username || `user_${id.slice(-8)}`;
      await pool.query(
        `INSERT INTO users (clerk_user_id,email,username) VALUES ($1,$2,$3)
        ON CONFLICT (clerk_user_id)
        DO UPDATE SET email = EXCLUDED.email,username=EXCLUDED.username`,
        [id, primary.email_address, finalUsername],
      );
    }
    if (eventType === "user.deleted") {
      await pool.query(`DELETE FROM users WHERE clerk_user_id = $1`, [
        evt.data.id,
      ]);
    }
  } catch (error) {
    console.error("Database error during webhook: ", eventType, error.message);
    return res.status(500).json({error:"Database error"});
  };
return res.status(200).json({ success: true });
}

module.exports = { clerkWebhook };

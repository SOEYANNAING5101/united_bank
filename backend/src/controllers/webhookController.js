const { Webhook } = require('svix');
const pool = require('../db/db'); 

const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET in .env");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 1. Grab the security headers sent by Clerk
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
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
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }

  // 3. Process the new user event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, username } = evt.data;
    const primaryEmail = email_addresses[0].email_address;
    
    // Fallback if they didn't provide a username
    const finalUsername = username || `user_${id.substring(0, 5)}`; 

    try {
      // Save the user to your database using the clerk ID
      const result = await pool.query(
        `INSERT INTO users (clerk_user_id, email, username) VALUES ($1, $2, $3) RETURNING *`,
        [id, primaryEmail, finalUsername]
      );
      console.log(" New user inserted into database:", result.rows[0]);
    } catch (error) {
      console.error(" Database error during webhook:", error.message);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  return res.status(200).json({ success: true });
};

module.exports = { clerkWebhook };
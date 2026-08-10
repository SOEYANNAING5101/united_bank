const pool = require("../db/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const depositMoney = async (req, res) => {
//   const { account_id, amount, counterparty, description } = req.body;
//   const clerk_user_id = req.auth.userId;

//   const user_check = await pool.query(
//     `SELECT user_id FROM users WHERE clerk_user_id =$1`,
//     [clerk_user_id],
//   );
//   if (user_check.rows.length === 0) {
//     return res.status(404).json({ message: "User not found" });
//   }
//   const user_id = user_check.rows[0].user_id;

//   if (!account_id || !amount || amount <= 0 || !counterparty) {
//     return res.status(400).json({
//       message: "Valid account ID and positive amount are required.",
//     });
//   }
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const accountCheck = await client.query(
//       `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
//       [account_id, user_id],
//     );
//     if (accountCheck.rows.length === 0) {
//       const error = new Error(
//         "Access denied: Account not found or unauthorized",
//       );
//       error.statusCode = 400;
//       throw error;
//     }
//     const updateAccount = await client.query(
//       `UPDATE accounts SET balance = balance + $1
//             WHERE account_id =$2
//             RETURNING account_id,user_id,account_type,balance
//             `,
//       [amount, account_id],
//     );

//     const transaction_type = "EXTERNAL_DEPOSIT";
//     const category = "DEPOSIT";
//     const status = "PENDING";

//     const newTransaction = await client.query(
//       `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
//             VALUES($1,$2,$3,$4,$5,$6,$7)
//             RETURNING *;
//             `,
//       [
//         account_id,
//         amount,
//         counterparty,
//         description || `Deposit from ${counterparty}`,
//         transaction_type,
//         category,
//         status,
//       ],
//     );
//     await client.query("COMMIT");
//     return res.status(200).json({
//       message: "Deposit Successful",
//       newBalance: updateAccount.rows[0].balance,
//       transaction: newTransaction.rows[0],
//     });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Deposit Error", error.message);
//     const status = error.statusCode || 500;
//     res
//       .status(status)
//       .json({ message: error.message || "Internal Server error" });
//   } finally {
//     client.release();
//   }
// };
const withdrawMoney = async (req, res) => {
  const { account_id, amount, description } = req.body;
  const clerk_user_id = req.auth.userId;

  if (!account_id || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Valid account ID and positive amount are required.",
    });
  }
  const client = await pool.connect();
  try {
    const accountCheck = await client.query(
      `SELECT 
        u.user_id,
        u.stripe_connect_id,
        a.balance,
        a.txn_limit_per_transfer,
        a.daily_transfer_limit,
        a.monthly_transfer_limit
      FROM users u
      JOIN accounts a ON u.user_id = a.user_id
      WHERE u.clerk_user_id=$1 AND a.account_id =$2`,
      [clerk_user_id, account_id],
    );
    if (accountCheck.rows.length === 0) {
      const error = new Error("Account or user not found");
      error.statusCode = 400;
      throw error;
    }

    const {
      user_id,
      stripe_connect_id,
      balance,
      txn_limit_per_transfer,
      daily_transfer_limit,
      monthly_transfer_limit,
      username: sender_username,
    } = accountCheck.rows[0];
    if (!stripe_connect_id) {
      const error = new Error(
        "Please link your account before withdrawing funds",
      );
      error.statusCode = 400;
      throw error;
    }
    
    if (Number(balance) < amount) {
      const error = new Error("Insufficient funds for this transfer");
      error.statusCode = 400;
      throw error;
    }
    if (
      txn_limit_per_transfer &&
      Number(amount) > Number(txn_limit_per_transfer)
    ) {
      const error = new Error(
        `Transfer amount exceeds limit of ${txn_limit_per_transfer}`,
      );
      error.statusCode = 400;
      throw error;
    }
    // Checking daily transfer limit
    const dailySumLimit = await client.query(
      `SELECT COALESCE(SUM(ABS(amount)),0) as total_today
      FROM transactions 
      WHERE account_id =$1 
        AND category IN ('TRANSFER_OUT','WITHDRAWAL') 
        AND status='COMPLETED' 
        AND created_at>=DATE_TRUNC('day',NOW())
       `,
      [account_id],
    );
    const total_today = Number(dailySumLimit.rows[0].total_today);
    if (
      daily_transfer_limit &&
      total_today + Number(amount) > Number(daily_transfer_limit)
    ) {
      const remainingDaily = Number(daily_transfer_limit) - total_today;
      const error = new Error(
        `Transfer exceeds daily limit. You have $${Math.max(0, remainingDaily).toLocaleString()} remaining for today`,
      );
      error.statusCode = 400;
      throw error;
    }
    // Checking month transfer limit
    const monthlySumLimit = await client.query(
      `SELECT COALESCE(SUM(ABS(amount)),0) as total_this_month
      FROM transactions
      WHERE account_id =$1 
        AND category IN ('TRANSFER_OUT','WITHDRAWAL') 
        AND status='COMPLETED' 
        AND created_at>=DATE_TRUNC('month',NOW())`,
      [account_id],
    );
    const total_this_month = Number(monthlySumLimit.rows[0].total_this_month);
    if (
      monthly_transfer_limit &&
      total_this_month + Number(amount) > Number(monthly_transfer_limit)
    ) {
      const remaininMonthly = Number(monthly_transfer_limit) - total_this_month;
      const error = new Error(
        `Transfer exceeds monthly limit. You have $${Math.max(0, remaininMonthly).toLocaleString()} remaining for this month`,
      );
      error.statusCode = 400;
      throw error;
    }
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: "sgd",
      destination: stripe_connect_id,
      description: description || "Bank Account withdrawal",
    });
    await client.query("BEGIN");
    const updateAccount = await client.query(
      `UPDATE accounts SET balance = balance - $1
            WHERE account_id =$2
            RETURNING account_id,user_id,account_type,balance
            `,
      [amount, account_id],
    );

    const newTransaction = await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING *;
            `,
      [
        account_id,
        -amount,
        "Linked Bank Account",
        description || `Withdrawal via Stripe ${transfer.id.slice(-8)}`,
        "EXTERNAL_WITHDRAWAL",
        "WITHDRAWAL",
        "COMPLETED",
      ],
    );
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Withdrawal Successful",
      newBalance: updateAccount.rows[0].balance,
      transaction: newTransaction.rows[0],
      transferId: transfer.id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Withdrawal Error", error.message);
    const status = error.statusCode || 500;
    res
      .status(status)
      .json({ message: error.message || "Internal Server error" });
  } finally {
    client.release();
  }
};
// Peer-to-peer (User's account to another user's account)
const transferPeer = async (req, res) => {
  const { sender_account_id, receiver_account_number, amount, description } =
    req.body;
  const clerk_user_id = req.auth.userId;

  const user_check = await pool.query(
    `SELECT user_id FROM users WHERE clerk_user_id =$1`,
    [clerk_user_id],
  );
  if (user_check.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const user_id = user_check.rows[0].user_id;

  if (!sender_account_id || !receiver_account_number || amount < 0) {
    return res.status(400).json({ message: "Invalid accounts or amount" });
  }

  const client = await pool.connect();
  try {
    //BEGIN
    await client.query("BEGIN");

    //Checking sender account
    const senderCheck = await client.query(
      `SELECT a.balance, a.txn_limit_per_transfer, a.daily_transfer_limit, a.monthly_transfer_limit, u.username
      FROM accounts a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.account_id =$1 AND a.user_id =$2`,
      [sender_account_id, user_id],
    );

    if (senderCheck.rows.length === 0) {
      const error = new Error("Sender account not found");
      error.statusCode = 400;
      throw error;
    }
    if (Number(senderCheck.rows[0].balance) < amount) {
      const error = new Error("Insufficient funds for this transfer");
      error.statusCode = 400;
      throw error;
    }
    if (Number(amount) > Number(senderCheck.rows[0].txn_limit_per_transfer)) {
      const error = new Error(
        `Transfer amount exceeds limit of ${senderCheck.rows[0].txn_limit_per_transfer}`,
      );
      error.statusCode = 400;
      throw error;
    }
    const {
      balance,
      txn_limit_per_transfer,
      daily_transfer_limit,
      monthly_transfer_limit,
      username: sender_username,
    } = senderCheck.rows[0];

    // Checking daily transfer limit
    const dailySumLimit = await client.query(
      `SELECT COALESCE(SUM(ABS(amount)),0) as total_today
      FROM transactions 
      WHERE account_id =$1 AND category IN ('TRANSFER_OUT','WITHDRAWAL') AND status='COMPLETED' AND created_at>=DATE_TRUNC('day',NOW())
       `,
      [sender_account_id],
    );
    const total_today = Number(dailySumLimit.rows[0].total_today);
    if (
      daily_transfer_limit &&
      total_today + Number(amount) > Number(daily_transfer_limit)
    ) {
      const remainingDaily = Number(daily_transfer_limit) - total_today;
      const error = new Error(
        `Transfer exceeds daily limit. You have $${Math.max(0, remainingDaily).toLocaleString()} remaining for today`,
      );
      error.statusCode = 400;
      throw error;
    }
    // Checking month transfer limit
    const monthlySumLimit = await client.query(
      `SELECT COALESCE(SUM(ABS(amount)),0) as total_this_month
      FROM transactions
      WHERE account_id =$1 AND category IN ('TRANSFER_OUT','WITHDRAWAL') AND status='COMPLETED' AND created_at>=DATE_TRUNC('month',NOW())`,
      [sender_account_id],
    );
    const total_this_month = Number(monthlySumLimit.rows[0].total_this_month);
    if (
      monthly_transfer_limit &&
      total_this_month + Number(amount) > Number(monthly_transfer_limit)
    ) {
      const remaininMonthly = Number(monthly_transfer_limit) - total_this_month;
      const error = new Error(
        `Transfer exceeds monthly limit. You have $${Math.max(0, remaininMonthly).toLocaleString()} remaining for this month`,
      );
      error.statusCode = 400;
      throw error;
    }
    // Check receiver account
    const receiverCheck = await client.query(
      `SELECT a.account_id, u.username 
      FROM accounts a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.account_number = $1 `,
      [receiver_account_number],
    );
    if (receiverCheck.rows.length === 0) {
      const error = new Error("Receiver account not found");
      error.statusCode = 400;
      throw error;
    }
    const receiver_account_id = receiverCheck.rows[0].account_id;
    const receiver_username = receiverCheck.rows[0].username;

    if (sender_account_id == receiver_account_id) {
      const error = new Error("Cannot tranfer money to same account");
      error.statusCode = 400;
      throw error;
    }
    //Deduct money from sender account(balance)
    await client.query(
      `UPDATE accounts SET balance = balance - $1 WHERE account_id = $2`,
      [amount, sender_account_id],
    );
    //Add money to receiver account(balance)
    await client.query(
      `UPDATE accounts SET balance = balance + $1 WHERE account_id = $2`,
      [amount, receiver_account_id],
    );

    //Register transaction for the sender
    const senderTransaction = await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
      [
        sender_account_id,
        -amount,
        receiver_account_id,
        description || `Transfer to ${receiver_username}`,
        "PEER_TRANSFER",
        "TRANSFER_OUT",
        "COMPLETED",
      ],
    );
    //Register transaction for the receiver
    await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        receiver_account_id,
        amount,
        sender_account_id,
        description || `Transfer from ${sender_username}`,
        "PEER_TRANSFER",
        "TRANSFER_IN",
        "COMPLETED",
      ],
    );

    //COMMIT
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Transfer completed",
      transaction: senderTransaction.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed, rolling back:", error.message);
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: error.message || "Internal server error" });
  } finally {
    client.release();
  }
};

const internalTransfer = async (req, res) => {
  const { sender_account_id, receiver_account_id, amount, description } =
    req.body;
  const clerk_user_id = req.auth.userId;
  const user_check = await pool.query(
    `SELECT user_id FROM users WHERE clerk_user_id =$1`,
    [clerk_user_id],
  );
  if (user_check.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const user_id = user_check.rows[0].user_id;

  if (!sender_account_id || !receiver_account_id || amount < 0) {
    return res.status(400).json({ message: "Invalid accounts or amount" });
  }

  const client = await pool.connect();
  try {
    //BEGIN
    await client.query("BEGIN");

    // Sender account check
    const senderCheck = await client.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [sender_account_id, user_id],
    );

    if (senderCheck.rows.length === 0) {
      const error = new Error("Sender account not found");
      error.statusCode = 400;
      throw error;
    }
    if (Number(senderCheck.rows[0].balance) < amount) {
      const error = new Error("Insufficient funds for this withdrawal");
      error.statusCode = 400;
      throw error;
    }
    const sender_account_number = senderCheck.rows[0].account_number;

    // Receiver account check
    const receiverCheck = await client.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [receiver_account_id, user_id],
    );
    if (receiverCheck.rows.length === 0) {
      const error = new Error("Receiver account not found");
      error.statusCode = 400;
      throw error;
    }

    if (sender_account_id === receiver_account_id) {
      const error = new Error("Cannot transfer to the same account");
      error.statusCode = 400;
      throw error;
    }
    const receiver_account_number = receiverCheck.rows[0].account_number;
    //Deduct money from sender account(balance)
    await client.query(
      `UPDATE accounts SET balance = balance - $1 WHERE account_id = $2`,
      [amount, sender_account_id],
    );
    //Add money to receiver account(balance)
    await client.query(
      `UPDATE accounts SET balance = balance + $1 WHERE account_id = $2`,
      [amount, receiver_account_id],
    );

    //Register transaction for the sender
    const senderTransaction = await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
      [
        sender_account_id,
        -amount,
        receiver_account_id,
        description || `Transfer to ${receiver_account_number}`,
        "INTERNAL_TRANSFER",
        "IGNORED",
        "COMPLETED",
      ],
    );
    //Register transaction for the receiver
    await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        receiver_account_id,
        amount,
        sender_account_id,
        description || `Transfer from ${sender_account_number}`,
        "INTERNAL_TRANSFER",
        "IGNORED",
        "COMPLETED",
      ],
    );

    //COMMIT
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Transfer completed",
      transaction: senderTransaction.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed, rolling back:", error.message);
    const status = error.statusCode || 500;
    return res
      .status(status)
      .json({ message: error.message || "Internal server error" });
  } finally {
    client.release();
  }
};
const createDepositIntent = async (req, res) => {
  try {
    const { amount, account_id } = req.body;
    const clerk_user_id = req.auth.userId;

    // 1. Basic validation
    if (!amount || amount <= 0 || !account_id) {
      return res
        .status(400)
        .json({ message: "Valid amount and account ID are required" });
    }

    // 2. Verify user exists
    const userCheck = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id = $1`,
      [clerk_user_id],
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = userCheck.rows[0].user_id;

    // 3. Verify the destination account belongs to the user
    const accountCheck = await pool.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [account_id, user_id],
    );
    if (accountCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Access denied: Account not found" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "sgd",
      payment_method_types: ["card"],
      metadata: {
        user_id: user_id,
        account_id: account_id,
        transaction_type: "EXTERNAL_DEPOSIT",
      },
    });
 
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Intent Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error creating deposit intent" });
  }
};
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log("Signature verified! Event type:", event.type);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const { user_id, account_id, transaction_type } = paymentIntent.metadata;

    const amountInDollars = paymentIntent.amount / 100;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        `UPDATE accounts SET balance = balance + $1 WHERE account_id = $2`,
        [amountInDollars, account_id],
      );

      const txnResult = await client.query(
        `INSERT INTO transactions (account_id, amount, counterparty, description, transaction_type, category, status)
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [
          account_id,
          amountInDollars,
          "New Debit/ Credit Card",
          `Card Deposit (${paymentIntent.id.slice(-8)})`,
          transaction_type,
          "DEPOSIT",
          "COMPLETED",
        ],
      );


      await client.query("COMMIT");

    } catch (error) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: "Database update failed" });
    } finally {
      client.release();
    }
  }

  res.status(200).json({ received: true });
};
const createConnectAccount = async (req, res) => {
  const clerk_user_id = req.auth.userId;
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `SELECT user_id,email,stripe_connect_id FROM users WHERE clerk_user_id = $1`,
      [clerk_user_id],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult.rows[0];
    let accountId = user.stripe_connect_id;
    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
        contact_email: user.email,
        dashboard: "none",
        identity: {
          country: "SG",
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: {
                stripe_transfers: { requested: true },
              },
            },
          },
        },
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        include: ["configuration.recipient", "identity"],
      });
      accountId = account.id;
      await client.query(
        `UPDATE users SET stripe_connect_id =$1 WHERE user_id = $2`,
        [accountId, user.user_id],
      );
    }
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });
    return res
      .status(200)
      .json({ client_secret: accountSession.client_secret });
  } catch (error) {
    console.error("Stripe connection error", error.message);
    return res.status(500).json({ message: "Failed to generate connect link" });
  } finally {
    client.release();
  }
};
module.exports = {
  withdrawMoney,
  transferPeer,
  internalTransfer,
  createDepositIntent,
  handleStripeWebhook,
  createConnectAccount,
};

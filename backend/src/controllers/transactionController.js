const pool = require("../db/db");

const depositMoney = async (req, res) => {
  const { account_id, amount, counterparty, description } = req.body;
  const clerk_user_id = req.auth.userId;

  const user_check = await pool.query(
    `SELECT user_id FROM users WHERE clerk_user_id =$1`,
    [clerk_user_id],
  );
  if (user_check.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const user_id = user_check.rows[0].user_id;

  if (!account_id || !amount || amount <= 0 || !counterparty) {
    return res.status(400).json({
      message: "Valid account ID and positive amount are required.",
    });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const accountCheck = await client.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [account_id, user_id],
    );
    if (accountCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Access denied: Account not found or unauthorized" });
    }
    const updateAccount = await client.query(
      `UPDATE accounts SET balance = balance + $1
            WHERE account_id =$2
            RETURNING account_id,user_id,account_type,balance
            `,
      [amount, account_id],
    );

    const transaction_type = "EXTERNAL_DEPOSIT";
    const category = "DEPOSIT";
    const status = "PENDING";

    const newTransaction = await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description,transaction_type,category,status)
            VALUES($1,$2,$3,$4,$5,$6,$7)
            RETURNING *;
            `,
      [
        account_id,
        amount,
        counterparty,
        description || `Deposite from ${counterparty}`,
        transaction_type,
        category,
        status,
      ],
    );
    await client.query("COMMIT");
    return res.status(200).json({
      message: "Deposite Successful",
      newBalance: updateAccount.rows[0].balance,
      transaction: newTransaction.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Deposit Error", error.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
const withdrawMoney = async (req, res) => {
  const { account_id, amount, counterparty, description } = req.body;
  const clerk_user_id = req.auth.userId;

  const user_check = await pool.query(
    `SELECT user_id FROM users WHERE clerk_user_id =$1`,
    [clerk_user_id],
  );
  if (user_check.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const user_id = user_check.rows[0].user_id;

  if (!account_id || !amount || amount <= 0 || !counterparty) {
    return res.status(400).json({
      message: "Valid account ID and positive amount are required.",
    });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const accountCheck = await client.query(
      `SELECT balance,
      txn_limit_per_transfer,
      daily_transfer_limit,
      monthly_transfer_limit FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [account_id, user_id],
    );
    if (accountCheck.rows.length === 0) {
      throw new Error("Sender account not found");
    }

    const {
      balance,
      txn_limit_per_transfer,
      daily_transfer_limit,
      monthly_transfer_limit,
      username: sender_username,
    } = accountCheck.rows[0];
    if (Number(balance) < amount) {
      throw new Error("Insufficient funds for this transfer");
    }
    if (
      txn_limit_per_transfer &&
      Number(amount) > Number(txn_limit_per_transfer)
    ) {
      throw new Error(
        `Transfer amount exceeds limit of ${txn_limit_per_transfer}`,
      );
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
      throw new Error(
        `Transfer exceeds daily limit. You have $${Math.max(0, remainingDaily).toLocaleString()} remaining for today`,
      );
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
      throw new Error(
        `Transfer exceeds monthly limit. You have $${Math.max(0, remaininMonthly).toLocaleString()} remaining for this month`,
      );
    }

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
        counterparty,
        description || `Withdrawal to ${counterparty}`,
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
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Withdrawal Error", error.message);
    res.status(500).json({ message:  error.message});
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
    res.status(400).json({ message: "Invalid accounts or amount" });
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
      throw new Error("Sender account not found");
    }
    if (Number(senderCheck.rows[0].balance) < amount) {
      throw new Error("Insufficient funds for this transfer");
    }
    if (Number(amount) > Number(senderCheck.rows[0].txn_limit_per_transfer)) {
      throw new Error(
        `Transfer amount exceeds limit of ${senderCheck.rows[0].txn_limit_per_transfer}`,
      );
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
      throw new Error(
        `Transfer exceeds daily limit. You have $${Math.max(0, remainingDaily).toLocaleString()} remaining for today`,
      );
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
      throw new Error(
        `Transfer exceeds monthly limit. You have $${Math.max(0, remaininMonthly).toLocaleString()} remaining for this month`,
      );
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
      throw new Error("Receiver account not found");
    }
    const receiver_account_id = receiverCheck.rows[0].account_id;
    const receiver_username = receiverCheck.rows[0].username;

    if (sender_account_id == receiver_account_id) {
      throw new Error("Cannot tranfer money to same account");
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
    return res.status(400).json({ message: error.message });
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
    throw new Error("User not found");
  }
  const user_id = user_check.rows[0].user_id;

  if (!sender_account_id || !receiver_account_id || amount < 0) {
    res.status(400).json({ message: "Invalid accounts or amount" });
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
    if (Number(senderCheck.rows[0].balance) < amount) {
      throw new Error("Insufficient funds for this withdrawal");
    }
    if (senderCheck.rows.length === 0) {
      throw new Error("Sender account not found");
    }
    const sender_account_number = senderCheck.rows[0].account_number;

    // Receiver account check
    const receiverCheck = await client.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [receiver_account_id, user_id],
    );
    if (receiverCheck.rows.length === 0) {
      throw new Error("Receiver account not found");
    }

    if (sender_account_id === receiver_account_id) {
      throw new Error("Cannot transfer to the same account");
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
    return res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};
module.exports = {
  depositMoney,
  withdrawMoney,
  transferPeer,
  internalTransfer,
};

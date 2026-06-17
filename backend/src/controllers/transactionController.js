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

  if (!account_id || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Valid account ID and positive amount are required.",
    });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const accountCheck = await pool.query(
      `SELECT * FROM accounts WHERE account_id = $1 AND user_id = $2`,
      [account_id, user_id],
    );
    if (accountCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Access denied: Account not found or unauthorized" });
    }
    const updateAccount = await pool.query(
      `UPDATE accounts SET balance = balance + $1
            WHERE account_id =$2
            RETURNING account_id,user_id,account_type,balance
            `,
      [amount, account_id],
    );

    const newTransaction = await pool.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description)
            VALUES($1,$2,$3,$4)
            RETURNING *;
            `,
      [account_id, amount, counterparty, description || "External Deposit"],
    );
    return res.status(200).json({
      message: "Deposite Successful",
      newBalance: updateAccount.rows[0].balance,
      transaction: newTransaction.rows[0],
    });
  } catch (error) {
    console.error("Deposit Error", error.message);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

const transferMoney = async (req, res) => {
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
      `SELECT balance FROM accounts WHERE account_id =$1 AND user_id =$2`,
      [sender_account_id, user_id],
    );
    if (senderCheck.rows.length === 0) {
      throw new Error("Sender account not found");
    }
    if (Number(senderCheck.rows[0].balance) < amount) {
      throw new Error("Insufficient funds for this transfer");
    }

    const receiverCheck = await client.query(
      `SELECT * FROM accounts WHERE account_number=$1`,
      [receiver_account_number],
    );
    const receiver_account_id = receiverCheck.rows[0].account_id;

    if (receiverCheck.rows.length === 0) {
      throw new Error("Receiver account not found");
    }
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
    await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description)
            VALUES ($1,$2,$3,$4)`,
      [
        sender_account_id,
        -amount,
        receiver_account_id,
        description || Onlinetransfer,
      ],
    );
    //Register transaction for the receiver
    await client.query(
      `INSERT INTO transactions (account_id,amount,counterparty,description)
            VALUES ($1,$2,$3,$4)`,
      [
        receiver_account_id,
        amount,
        sender_account_id,
        description || "Onlinetransfer",
      ],
    );

    //COMMIT
    await client.query("COMMIT");
    return res.status(200).json({ message: "Transfer completed" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transfer failed, rolling back:", error.message);
    return res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
};
module.exports = { depositMoney, transferMoney };

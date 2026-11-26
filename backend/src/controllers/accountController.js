const pool = require("../db/db");
const crypto = require("crypto");
//Open new account with valid token
const createAccount = async (req, res) => {
  try {
    const ALLOWED_TYPES = ["checking", "saving"];

    const { account_type } = req.body;
    if (!account_type) {
      return res.status(400).json({ message: "Account type is required" });
    } else if (!ALLOWED_TYPES.includes(account_type)) {
      return res.status(400).json({ message: "Invalid account type." });
    }
    const user_id = req.user.id;

    const existingAccount = await pool.query(
      `SELECT * FROM accounts WHERE user_id =$1 AND account_type=$2`,
      [user_id, account_type],
    );
    if (existingAccount.rows.length > 0) {
      return res.status(400).json({
        message: `You already have an active ${account_type} account`,
      });
    }
    let newAccount;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        newAccount = await pool.query(
          `INSERT INTO accounts (user_id,account_number,account_type,balance)
                    VALUES($1,$2,$3,0.0)
                    RETURNING account_id,user_id,account_number,account_type,balance,created_at`,
          [user_id, generateAccountNumber(), account_type],
        );
        break;
      } catch (err) {
        const numberTaken =
          err.code === "23505" && err.constraint === "account_number_unique";
        if (!numberTaken || attempt === 5) throw err;
      }
    }
    return res.status(200).json({
      message: "New account is created",
      account: newAccount.rows[0],
    });
  } catch (error) {
    console.error("Create account error: ",error.message)
    return res.status(500).json({ message: "Could not create the account. Please try again." });
  }
};

const generateAccountNumber = () => {
  let num = "";
  for (let i = 0; i < 10; i++) num += crypto.randomInt(0, 10);
  return num;
};

//Get Account Owner
const getAccountOwner = async (req, res) => {
  try {
    const { account_number } = req.params;
    const userCheck = await pool.query(
      `SELECT u.username
            FROM accounts a 
            JOIN users u ON a.user_id = u.user_id
            WHERE a.account_number = $1 and a.account_type<>'escrow'`,
      [account_number],
    );
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "Account not found" });
    }
    const name = userCheck.rows[0].username;
    const maskedName =
      name.length <= 2
        ? `${name[0]}***`
        : `${name[0]}***${name[name.length - 1]}`;

    return res.status(200).json({
      message: "Account found",
      maskedName,
    });
  } catch (error) {
    console.error("Lookup Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error during account lookup" });
  }
};

// get account data based on the account_id
const getAccountDetails = async (req, res) => {
  try {
    const { account_id } = req.params;
    const user_id = req.user.id;
    const query = `
    SELECT 
    a.*,
    COALESCE(
    (SELECT SUM(ABS(amount))
    FROM transactions
    WHERE account_id = $1
      AND status IN ('COMPLETED','PENDING')
      AND direction = 'OUT' AND transaction_type IN ('PEER_TRANSFER','EXTERNAL_WITHDRAWAL','DEAL_HOLD')
      AND created_at >= DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'
     ),0
     )AS spent_today,
    COALESCE(
      (SELECT SUM(ABS(amount))
        FROM transactions
        WHERE account_id = $1
        AND status IN ('COMPLETED','PENDING')
        AND direction = 'OUT' AND transaction_type IN ('PEER_TRANSFER','EXTERNAL_WITHDRAWAL','DEAL_HOLD')
        AND created_at >= DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore'
      ),0
      )AS spent_this_month
    FROM accounts a
    WHERE a.account_id =$1 AND a.user_id =$2      
     `;
    const { rows } = await pool.query(query, [account_id, user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({
      message: "Account details retrieved successfully.",
      data: rows[0],
    });
  } catch (err) {
    console.error("Error fetching account details.", err.message);
    return res
      .status(404)
      .json({ message: "Server error fetching acccount details." });
  }
};

// Get Transaction history for a specific month)
const getTransactionHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { account_id } = req.params;
    const { month, page = 1, filter = "all" } = req.query;
    const limit = 10;
    const offset = (Number(page) - 1) * 10;
    let queryStr = `
    SELECT
      t.transaction_id,
      COALESCE(u.username, t.counterparty) AS counterparty,
      t.amount,
      t.description,
      t.status,
      t.transaction_type,
      t.created_at
    FROM transactions t
    JOIN accounts a ON t.account_id = a.account_id
    LEFT JOIN accounts ca ON t.counterparty = ca.account_id::varchar
    LEFT JOIN users u ON ca.user_id =u.user_id`;
    let queryParams = [];
    let paramCount = 1;
    if (account_id === "all") {
      queryStr += ` WHERE a.user_id= $${paramCount++} AND TO_CHAR(t.created_at, 'YYYY-MM') = $${paramCount++}`;
      queryParams.push(user_id, month);
    } else {
      const accCheck = await pool.query(
        `SELECT account_id FROM accounts WHERE user_id = $1 and account_id = $2`,
        [user_id, account_id],
      );
      if (accCheck.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Account not found or access denied" });
      }
      queryStr += ` WHERE t.account_id= $${paramCount++} AND TO_CHAR(t.created_at, 'YYYY-MM') = $${paramCount++}`;
      queryParams.push(account_id, month);
    }
    if (filter == "money_in") {
      queryStr += ` AND t.amount > 0 `;
    } else if (filter == "money_out") {
      queryStr += ` AND t.amount<0`;
    }
    queryStr += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);

    const result = await pool.query(queryStr, queryParams);
    return res.status(200).json({
      message: "History fetched successfully!",
      transactions: result.rows,
      nextPage: result.rows.length === limit ? Number(page) + 1 : null,
    });
  } catch (error) {
    console.error("History error", error.message);
    return res.status(500).json({ message: "Server error fetching history" });
  }
};

const updateAccountDetails = async (req, res) => {
  const { account_id } = req.params;
  const user_id = req.user.id;

  const { txn_limit_per_transfer, daily_transfer_limit, monthly_transfer_limit } = req.body;
  const perTxn = Number(txn_limit_per_transfer);
  const daily = Number(daily_transfer_limit);
  const monthly = Number(monthly_transfer_limit);
  if (perTxn <= 0 || daily <= 0 || monthly <= 0) {
    return res
      .status(400)
      .json({ message: "Limits must be greater than $0.00." });
  }
  if (perTxn > daily) {
    return res
      .status(400)
      .json({ message: "Per-transfer limit cannot exceed the Daily Limit" });
  }
  if (daily > monthly) {
    return res
      .status(400)
      .json({ message: "Daily limit cannot exceed the Monthly Limit" });
  }
  try {
    const updateAccounts = await pool.query(
      `UPDATE accounts
    SET 
      txn_limit_per_transfer =$1,
      daily_transfer_limit = $2,
      monthly_transfer_limit = $3
    WHERE account_id = $4 AND user_id = $5
    RETURNING *
    `,
      [perTxn, daily, monthly, account_id, user_id],
    );
    if (updateAccounts.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Error updating account details" });
    }
    res.status(200).json({
      message: "Transfer limits updated successfully.",
      data: updateAccounts.rows[0],
    });
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Error updating account details", error });
  }
};

module.exports = {
  createAccount,
  getAccountOwner,
  getTransactionHistory,
  getAccountDetails,
  updateAccountDetails,
};

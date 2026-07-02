const pool = require("../db/db");

//Open new account with valid token
const createAccount = async (req, res) => {
  try {
    const { account_type } = req.body;
    if (!account_type) {
      return res.status(400).json({ message: "Account type is required" });
    }
    const clerk_id = req.auth.userId;

    const userResult = await pool.query(
      `SELECT user_id from users WHERE clerk_user_id = $1`,
      [clerk_id],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found in database" });
    }
    const user_id = userResult.rows[0].user_id;
    console.log("User_id: ", user_id);
    const existingAccount = await pool.query(
      `SELECT * FROM accounts WHERE user_id =$1 AND account_type=$2`,
      [user_id, account_type],
    );
    if (existingAccount.rows.length > 0) {
      return res.status(400).json({
        message: `You already have an active ${account_type} account`,
      });
    }
    const accountNumber = await generateAccountNumber(pool);

    const newAccount = await pool.query(
      `INSERT INTO accounts (user_id,account_number,account_type,balance)
            VALUES($1,$2,$3,0.0)
            RETURNING account_id,user_id,account_number,account_type,balance,created_at`,
      [user_id, accountNumber, account_type],
    );
    return res.status(200).json({
      message: "New account is created",
      account: newAccount.rows[0],
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const generateAccountNumber = async (pool) => {
  let accountNum = "";
  let isUnique = false;

  while (!isUnique) {
    for (let i = 0; i < 10; i++) {
      accountNum += Math.floor(Math.random() * 10);
      const checkAccountNumber = await pool.query(
        `SELECT account_number from accounts WHERE account_number = $1`,
        [accountNum],
      );
      if (checkAccountNumber.rows.length === 0) {
        isUnique = true;
      }
    }
  }

  return accountNum;
};

//Get Account Owner
const getAccountOwner = async (req, res) => {
  try {
    const { account_number } = req.params;
    const userCheck = await pool.query(
      `SELECT u.username
            FROM accounts a 
            JOIN users u ON a.user_id = u.user_id
            WHERE a.account_number = $1`,
      [account_number],
    );
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "Account not found" });
    }

    const rawUserName = userCheck.rows[0].username;
    let hiddenUserName = "";
    if (rawUserName.length > 2) {
      const firstChar = rawUserName[0];
      const lastChar = rawUserName[rawUserName.length - 1];
      const stars = "*".repeat(rawUserName.length - 2);
      hiddenUserName = `${firstChar}${stars}${lastChar}`;
    }
    return res.status(200).json({
      message: "Account found",
      hiddenName: hiddenUserName,
      fullName: rawUserName,
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
    const clerk_user_id = req.auth.userId;
    const user_check = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id =$1`,
      [clerk_user_id],
    );
    if (user_check.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = user_check.rows[0].user_id;
    const query = `
    SELECT 
    a.*,
    COALESCE(
    (SELECT SUM(ABS(amount))
    FROM transactions
    WHERE account_id = $1
      AND category IN ('TRANSFER_OUT','WITHDRAWAL')
      AND status='COMPLETED' 
      AND created_at>=DATE_TRUNC('day',NOW())
     ),0
     )AS spent_today,
    COALESCE(
      (SELECT SUM(ABS(amount))
        FROM transactions
        WHERE account_id = $1
        AND category IN ('TRANSFER_OUT','WITHDRAWAL')
      AND status='COMPLETED' 
      AND created_at>=DATE_TRUNC('month',NOW())
      ),0
      )AS spent_this_month
    FROM accounts a
    WHERE a.account_id =$1       
     `;
    const { rows } = await pool.query(query, [account_id]);
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
    const clerk_user_id = req.auth.userId;

    const user_check = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id =$1`,
      [clerk_user_id],
    );
    if (user_check.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    // user_id
    const user_id = user_check.rows[0].user_id;

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
      t.category,
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
      queryStr += `WHERE a.user_id= $${paramCount++} AND TO_CHAR(t.created_at, 'YYYY-MM') = $${paramCount++}`;
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
  const clerk_user_id = req.auth.userId;
  const user_check = await pool.query(
    `SELECT user_id FROM users WHERE clerk_user_id =$1`,
    [clerk_user_id],
  );
  if (user_check.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }
  const user_id = user_check.rows[0].user_id;
  // const account_check = await pool.query(
  //   `SELECT * FROM accounts WHERE account_id =$1 AND user_id = $2`,[account_id,user_id]
  // )
  const { txn_limit_per_transfer, dailyLimit, monthlyLimit } = req.body;
  const perTxn = Number(txn_limit_per_transfer);
  const daily = Number(dailyLimit);
  const monthly = Number(monthlyLimit);
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
    `,[perTxn,daily,monthly,account_id,user_id]
  );
  if (updateAccounts.rows.length === 0){
    return res.status(404).json({message:"Error updating account details"})
  }
  res.status(200).json({
    message:"Transfer limits updated successfully.",
    data:updateAccounts.rows[0]
  })
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

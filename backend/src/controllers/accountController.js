const pool = require("../db/db");

//Open new account with valid token
const openAccount = async (req, res) => {
  try {
    const { account_type } = req.body;
    if (!account_type) {
      return res.status(400).json({ message: "Account type is required" });
    }
    const user_id = req.user_id;
    console.log("user_id", user_id);

    const existingAccount = await pool.query(
      `SELECT * FROM accounts WHERE user_id =$1 AND account_type=$2`,
      [user_id, account_type],
    );
    if (existingAccount.rows.length > 0) {
      return res
        .status(400)
        .json({
          message: `You already have an active ${account_type} account`,
        });
    }
    const accountNumber = await generateAccountNumber(pool)
    const newAccount = await pool.query(
      `INSERT INTO accounts (user_id,account_number,account_type,balance)
            VALUES($1,$2,$3,0.0)
            RETURNING account_id,user_id,account_number,account_type,balance,created_at`,
      [user_id, accountNumber,account_type],
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
    console.log("Account_number", account_number);
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
      fullName:rawUserName
    });
  } catch (error) {
    console.error("Lookup Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error during account lookup" });
  }
};
module.exports = {
  openAccount,
  getAccountOwner,
};

const pool = require("../db/db");

const getDashboardData = async (req, res) => {
  try {
    const clerk_user_id = req.auth.userId;

    const user_check = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id =$1`,
      [clerk_user_id],
    );
    if (user_check.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = user_check.rows[0].user_id;
    const accountDetails = await pool.query(
      `SELECT * FROM accounts WHERE user_id = $1`,
      [user_id],
    );
    const accounts = accountDetails.rows;
    //1) Total Balance
    let totalBalance = 0.0;
    for (let x of accounts) {
      totalBalance += Number(x.balance);
    }

    //2)Previous transaction list
    const transactionResult = await pool.query(
      `SELECT 
                t.transaction_id,
                COALESCE(u.username, t.counterparty) AS counterparty,
                t.amount, 
                t.created_at 
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            LEFT JOIN accounts ca ON t.counterparty = ca.account_id::varchar
            LEFT JOIN users u ON ca.user_id = u.user_id
            WHERE a.user_id = $1
            ORDER BY t.created_at DESC
            LIMIT 10`,
      [user_id],
    );
    const recentTransactions = transactionResult.rows;

    const trendsResult = await pool.query(
      `WITH current_month AS(
        SELECT
            SUM(CASE WHEN t.amount >0 THEN t.amount ELSE 0 END) as current_income,
            SUM(CASE WHEN t.amount <0 THEN ABS(t.amount) ElSE 0 END) as current_spending
        FROM transactions t
        JOIN accounts a ON t.account_id =a.account_id
        WHERE a.user_id = $1
        AND DATE_TRUNC('month',t.created_at) = DATE_TRUNC('month',CURRENT_DATE)
        ),
    last_month AS(
        SELECT
            SUM(CASE WHEN t.amount >0 THEN t.amount ELSE 0 END) as previous_income,
            SUM(CASE WHEN t.amount <0 THEN ABS(t.amount) ELSE 0 END) as previous_spending
        FROM transactions t
        JOIN accounts a ON t.account_id = a.account_id
        WHERE a.user_id =$1
        AND DATE_TRUNC('month',t.created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')
        )
        SELECT 
            COALESCE(c.current_income, 0) as current_income,
            COALESCE(c.current_spending, 0) as current_spending,
            COALESCE(l.previous_income, 0) as previous_income,
            COALESCE(l.previous_spending, 0) as previous_spending
        FROM current_month c
        FULL OUTER JOIN last_month l ON TRUE;
        `,
      [user_id],
    );
    const stats = trendsResult.rows[0] || {
      current_income: 0,
      current_spending: 0,
      previous_income: 0,
      previous_spending: 0,
    };

    const calculateTrend = (current, previous) => {
      if (Number(previous) === 0) return current > 0 ? 100 : 0;
      return (
        ((Number(current) - Number(previous)) / Number(previous)) *
        100
      ).toFixed(1);
    };

    const incomeTrend = calculateTrend(
      stats.current_income,
      stats.previous_income,
    );
    const spendingTrend = calculateTrend(
      stats.current_spending,
      stats.previous_spending,
    );
    return res.status(200).json({
      message: "Dashboard Data",
      data: {
        totalBalance: totalBalance,
        accounts: accounts,
        transactions: recentTransactions,
        totalIncome: Number(stats.current_income),
        totalSpending: Number(stats.current_spending),
        incomeTrend: Number(incomeTrend),
        spendingTrend: Number(spendingTrend),
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error fetching dashboard data" });
  }
};

module.exports = { getDashboardData };

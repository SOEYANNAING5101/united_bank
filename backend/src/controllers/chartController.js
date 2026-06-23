const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const getChartData = async (req, res) => {
  try {
    const clerk_user_id = req.auth.userId;
    const { account_id, startDate, endDate, timeFrame } = req.query;

    const user_check = await pool.query(
      `SELECT user_id FROM users WHERE clerk_user_id =$1`,
      [clerk_user_id],
    );
    if (user_check.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = user_check.rows[0].user_id;

    if (!startDate || !endDate) {
      res.status(400).json({ message: "Missing startDate or endDate" });
    }


    let currentBalance = 0;
    let accountQuery = "";
    let accountParams = [];

    if (account_id === "all") {
      const balanceResult = await pool.query(
        `SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = $1`,
        [user_id],
      );
      currentBalance = Number(balanceResult.rows[0].total_balance) || 0;
      accountQuery = ` IN (SELECT account_id FROM accounts WHERE user_id = $1)`;
      accountParams = [user_id, startDate, endDate];
    } else {
      const balanceResult = await pool.query(
        `SELECT balance FROM accounts WHERE user_id = $1 AND account_id = $2 `,
        [user_id, account_id],
      );

      currentBalance = Number(balanceResult.rows[0].balance) || 0;
      accountQuery = `= $1`;
      accountParams = [account_id, startDate, endDate];
    }
    const transactionResult = await pool.query(
      `SELECT amount,created_at
        FROM transactions
        WHERE account_id ${accountQuery}
        AND created_at >= $2::date
        AND created_at <= $3::date + interval '1day'
        ORDER BY created_at DESC`,
      accountParams,
    );
    const transactions = transactionResult.rows;
  

    let tempBalance = currentBalance;
    let chartData = [];
    if (timeFrame == "1Y") {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTransactionGroups = {};
      transactions.forEach((t) => {
        const m = new Date(t.created_at).getMonth();

        monthlyTransactionGroups[m] =
          (monthlyTransactionGroups[m] || 0) + Number(t.amount);
      });

      for (let m = 11; m >= 0; m--) {
        const monthString = `${currentYear}-${String(m + 1).padStart(2, 0)}`;

        if (m > currentMonth) {
          chartData.unshift({ date: monthString, balance: null });
        } else {
          chartData.unshift({ date: monthString, balance: tempBalance });
          if (monthlyTransactionGroups[m]) {
            tempBalance -= monthlyTransactionGroups[m];
          }
        }
      }
    } else {
      const transactionGroups = {};
      transactions.forEach((t) => {
        const dateKey = new Date(t.created_at).toISOString().split("T")[0];
        if (!transactionGroups[dateKey]) {
          transactionGroups[dateKey] = [];
        }
        transactionGroups[dateKey].push(Number(t.amount));
      });
      const dateTimeLine = [];
      let currentDate = new Date(startDate);
      const finalDate = new Date(endDate);

      while (currentDate <= finalDate) {
        dateTimeLine.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = dateTimeLine.length - 1; i >= 0; i--) {
        const date = dateTimeLine[i];
        chartData.unshift({
          date: date,
          balance: tempBalance,
        });
        if (transactionGroups[date]) {
          transactionGroups[date].forEach((amount) => {
            tempBalance = tempBalance - amount;
          });
        }
      }
    }

    // 4. Placeholder response until we write the SQL math
    return res.status(200).json({
      message: "Chart Data compiled successfully.",
      data: chartData,
    });
  } catch (error) {
    console.error("Chart Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error fetching chart data" });
  }
};
module.exports = { getChartData };

const pool = require("../db/db")

const getDashboardData = async (req,res) =>{
    try{
        const clerk_user_id = req.auth.userId;

        const user_check = await pool.query(
            `SELECT user_id FROM users WHERE clerk_user_id =$1`,
            [clerk_user_id]
        )
        if (user_check.rows.length === 0){
            return res.status(404).json({message:"User not found"})
        }
        const user_id = user_check.rows[0].user_id
        const accountDetails = await pool.query(
            `SELECT * FROM accounts WHERE user_id = $1`,
            [user_id]
        )
        const accounts = accountDetails.rows;
        //1) Total Balance
        let totalBalance = 0.0
        for (let x of accounts){
            totalBalance += Number(x.balance)
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
            -- Safely link the counterparty ID to the accounts table
            LEFT JOIN accounts ca ON t.counterparty = ca.account_id::varchar
            -- Link that account to the users table to get the name
            LEFT JOIN users u ON ca.user_id = u.user_id
            WHERE a.user_id = $1
            ORDER BY t.created_at DESC
            LIMIT 10`,
            [user_id]
        );
        const recentTransactions = transactionResult.rows;

        //3)Total Income & Total Spending
        let totalIncome = 0
        let totalSpending = 0
        for (let x of recentTransactions){
            if(x.amount > 0){
                totalIncome += Number(x.amount)
            }else{
                totalSpending += Math.abs(x.amount)
            }
        }     
        return res.status(200).json({ 
            message:"Dashboard Data",
            data:{
                totalBalance : totalBalance,
                accounts :accounts,
                totalIncome : totalIncome,
                totalSpending : totalSpending,
                transactions : recentTransactions
            }
        });
    }catch(error){
        console.error("Dashboard Error:", error.message);
        return res.status(500).json({ message: "Server error fetching dashboard data" });
    }
}

module.exports = {getDashboardData}
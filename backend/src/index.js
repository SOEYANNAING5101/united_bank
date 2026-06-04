//import express and cors
const express = require('express')
const cors = require('cors')
require('dotenv').config
const pool = require('./db/db')

//Initialize the express app
const app = express();

const userRouter = require('./routes/userRouter')
const accountRouter = require('./routes/accountRouter')
const transactionRouter = require('./routes/transactionRouter')
const dashboardRouter = require('./routes/dashboardRouter')

//Middlewares
app.use(cors());
app.use("/api/webhooks",userRouter);
app.use(express.json());

app.use('/api/accounts',accountRouter);
app.use('/api/transactions',transactionRouter);
app.use('/api/dashboard',dashboardRouter);

// // //Get all the users
// app.get('/api/users',async (req,res) =>{
//     try{
//         const allUsers = await pool.query(
//             `SELECT user_id,username,email,created_at FROM users`
//         )
//         res.status(200).json(allUsers.rows)
//     }catch(error){
//         console.error(error.message)
//         res.status(500).json({error:"Error getting user details"})
//     }
// })


//Assign port
const PORT = process.env.PORT ||5000
//Start the server
app.listen(PORT,()=>{
    console.log(`Server is running on https://localhost:${PORT}`)
})
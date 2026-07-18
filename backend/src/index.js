//import express and cors
const express = require('express')
const cors = require('cors')
require('dotenv').config();
const pool = require('./db/db')

//Initialize the express app
const app = express();

const userRouter = require('./routes/userRouter')
const accountRouter = require('./routes/accountRouter')
const transactionRouter = require('./routes/transactionRouter')
const dashboardRouter = require('./routes/dashboardRouter')
const chartRouter = require('./routes/chartRouter')
const profileRouter = require('./routes/profileRouter')

//Middlewares
app.use(cors());
app.use("/api/webhooks",userRouter);
app.use(express.json());

app.use('/api/accounts',accountRouter);
app.use('/api/transactions',transactionRouter);
app.use('/api/dashboard',dashboardRouter);
app.use('/api/dashboard/chart',chartRouter)
app.use('/api/profile',profileRouter)


const PORT = process.env.PORT ||5000
//Start the server
app.listen(PORT,()=>{
    console.log(`Server is running on https://localhost:${PORT}`)
})
//import express and cors
const express = require('express')
const cors = require('cors')
require('dotenv').config();
const pool = require('./db/db')

//Initialize the express app
const app = express();

// Route Imports
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

// Routes
app.use('/api/accounts',accountRouter);
app.use('/api/transactions',transactionRouter);
app.use('/api/dashboard',dashboardRouter);
app.use('/api/dashboard/chart',chartRouter)
app.use('/api/profile',profileRouter)

// Simple test
app.get('/api/health',(req,res)=>{
    res.status(200).json({status:"OK"});
});

module.exports = app;


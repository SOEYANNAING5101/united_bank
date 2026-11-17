//import express and cors
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db/db");
const { handleStripeWebhook } = require('./controllers/transactionController')

//Initialize the express app
const app = express();

// Ratelimit import
const { globalLimiter } = require("./middleware/rateLimiter");

const {clerkMiddleware} = require('@clerk/express');

// Route Imports
const userRouter = require("./routes/userRouter");
const accountRouter = require("./routes/accountRouter");
const transactionRouter = require("./routes/transactionRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const chartRouter = require("./routes/chartRouter");
const profileRouter = require("./routes/profileRouter");
const dealRouter = require('./routes/dealRouter')
const helmet = require('helmet')

app.set("trust proxy",1)
app.use(helmet())
app.use(
  cors({
    origin:(process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(","),
    exposedHeaders: [
      "Retry-After",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
    ],
  }),
);

app.post(
  '/api/webhooks/stripe', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);
app.use("/api/webhooks", userRouter);

app.use(express.json({limit:"10kb"}));

app.use(clerkMiddleware());
app.use("/api", globalLimiter);

// Routes
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/dashboard/chart", chartRouter);
app.use("/api/profile", profileRouter);
app.use("/api/deals", dealRouter);

app.use((err,req,res,next)=>{
  const status = err.status || err.statusCode ||500;
  if (status>=500){
    console.error({path:req.path,user:req.user?.id,err});
  }
  res.status(status).json({
    message:status>=500 ?"Something went wrong. Please try again." :err.message,
    code:err.code
  })
})
module.exports = app;

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

const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");

// Route Imports
const userRouter = require("./routes/userRouter");
const accountRouter = require("./routes/accountRouter");
const transactionRouter = require("./routes/transactionRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const chartRouter = require("./routes/chartRouter");
const profileRouter = require("./routes/profileRouter");

app.use(
  cors({
    exposedHeaders: [
      "Retry-After",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
    ],
  }),
);
app.use("/api/webhooks", userRouter);
app.post(
  '/api/webhook', 
  express.raw({ type: 'application/json' }), 
  handleStripeWebhook
);


app.use(express.json());

app.use("/api", ClerkExpressWithAuth());
app.use("/api", globalLimiter);

// Routes
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/dashboard/chart", chartRouter);
app.use("/api/profile", profileRouter);

module.exports = app;

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const getKey = (req) => {
  if (req.auth && req.auth.userId) {
    return req.auth.userId;
  }
  return ipKeyGenerator(req.ip);
};
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 100, //100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this account, please try again later",
  },
  skip: (req, res) => {
    return req.originalUrl.startsWith("/api/webhooks");
  },
  keyGenerator: getKey,
});
// Transfer Limit
const transferLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 10, //10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Transfer limit exceeded.Please wait a minute before trying again",
  },
  keyGenerator: getKey,
});
// For account creation
const accountActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 10 , //10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many account modification.Please try again after 15 minutes.",
  },
  keyGenerator: getKey,
});
// For verification for receiver account number
const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, //10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many account lookups. Please try again later.",
  },
  keyGenerator: getKey,
});
// Profile action limiter
const profileActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, //10 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many profile update attempts. Please try again later.",
  },
  keyGenerator: getKey,
});
module.exports = { globalLimiter, transferLimiter, accountActionLimiter, lookupLimiter, profileActionLimiter };

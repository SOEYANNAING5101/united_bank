const router = require("express").Router();
const {createAccount,getAccountOwner,getTransactionHistory,getAccountDetails,updateAccountDetails} = require('../controllers/accountController')
const { requireKyc } = require ('../middleware/kycMiddleware')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const {accountActionLimiter,lookupLimiter} = require('../middleware/rateLimiter')

router.post('/create',ClerkExpressRequireAuth(),accountActionLimiter,requireKyc,createAccount)
router.get('/:account_id',ClerkExpressRequireAuth(),requireKyc,getAccountDetails)
router.put('/:account_id/limit',ClerkExpressRequireAuth(),accountActionLimiter,requireKyc,updateAccountDetails)
router.get('/lookup/:account_number',ClerkExpressRequireAuth(),lookupLimiter,requireKyc,getAccountOwner)
router.get('/history/:account_id',ClerkExpressRequireAuth(),requireKyc,getTransactionHistory)

module.exports = router;
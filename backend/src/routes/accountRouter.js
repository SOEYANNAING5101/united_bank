const router = require("express").Router();
const {createAccount,getAccountOwner,getTransactionHistory} = require('../controllers/accountController')
const verifyToken = require ('../middleware/authMiddleware')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.post('/create',ClerkExpressRequireAuth(),createAccount)
router.get('/lookup/:account_number',ClerkExpressRequireAuth(),getAccountOwner)
router.get('/history/:account_id',ClerkExpressRequireAuth(),getTransactionHistory)

module.exports = router;
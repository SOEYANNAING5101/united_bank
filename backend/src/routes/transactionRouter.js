const {depositMoney,transferMoney} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.post('/deposit',ClerkExpressRequireAuth(),depositMoney);
router.post('/transfer',ClerkExpressRequireAuth(),transferMoney);

module.exports = router;
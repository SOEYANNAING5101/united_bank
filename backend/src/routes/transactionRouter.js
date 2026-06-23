const {depositMoney,withdrawMoney,transferMoney} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.post('/deposit',ClerkExpressRequireAuth(),depositMoney);
router.post('/withdraw',ClerkExpressRequireAuth(),withdrawMoney);
router.post('/transfer',ClerkExpressRequireAuth(),transferMoney);

module.exports = router;
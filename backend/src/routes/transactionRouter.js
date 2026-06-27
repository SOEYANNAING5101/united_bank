const {depositMoney,withdrawMoney,transferMoney} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')
const checkIdempotency = require("../middleware/idempotencyMiddleware")

router.post('/deposit',ClerkExpressRequireAuth(),checkIdempotency,depositMoney);
router.post('/withdraw',ClerkExpressRequireAuth(),checkIdempotency,withdrawMoney);
router.post('/transfer',ClerkExpressRequireAuth(),checkIdempotency,transferMoney);

module.exports = router;
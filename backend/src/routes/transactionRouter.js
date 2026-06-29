const {depositMoney,withdrawMoney,transferPeer,internalTransfer} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')
const checkIdempotency = require("../middleware/idempotencyMiddleware")

router.post('/deposit',ClerkExpressRequireAuth(),checkIdempotency,depositMoney);
router.post('/withdraw',ClerkExpressRequireAuth(),checkIdempotency,withdrawMoney);
router.post('/peer-transfer',ClerkExpressRequireAuth(),checkIdempotency,transferPeer);
router.post('/internal-transfer',ClerkExpressRequireAuth(),checkIdempotency,internalTransfer);

module.exports = router;
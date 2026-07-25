const {depositMoney,withdrawMoney,transferPeer,internalTransfer} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')
const checkIdempotency = require("../middleware/idempotencyMiddleware")
const { requireKyc } = require ('../middleware/kycMiddleware')
const {transferLimiter} = require('../middleware/rateLimiter')


router.post('/deposit',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,depositMoney);
router.post('/withdraw',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,withdrawMoney);
router.post('/peer-transfer',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,transferPeer);
router.post('/internal-transfer',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,internalTransfer);

module.exports = router;
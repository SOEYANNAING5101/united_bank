const {withdrawMoney,transferPeer,internalTransfer,createDepositIntent,createConnectAccount} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')
const checkIdempotency = require("../middleware/idempotencyMiddleware")
const { requireKyc } = require ('../middleware/kycMiddleware')
const {transferLimiter} = require('../middleware/rateLimiter')

router.post('/withdraw',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,withdrawMoney);
router.post('/peer-transfer',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,transferPeer);
router.post('/internal-transfer',ClerkExpressRequireAuth(),transferLimiter,requireKyc,checkIdempotency,internalTransfer);
router.post('/create-deposit-intent',ClerkExpressRequireAuth(),requireKyc,createDepositIntent);
router.post('/connect-bank',createConnectAccount); //stripe account

module.exports = router;

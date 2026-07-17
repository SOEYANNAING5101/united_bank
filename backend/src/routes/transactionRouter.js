const {depositMoney,withdrawMoney,transferPeer,internalTransfer} = require('../controllers/transactionController');
const router = require('express').Router();
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')
const checkIdempotency = require("../middleware/idempotencyMiddleware")
const { requireKyc } = require ('../middleware/kycMiddleware')

router.post('/deposit',ClerkExpressRequireAuth(),requireKyc,checkIdempotency,depositMoney);
router.post('/withdraw',ClerkExpressRequireAuth(),requireKyc,checkIdempotency,withdrawMoney);
router.post('/peer-transfer',ClerkExpressRequireAuth(),requireKyc,checkIdempotency,transferPeer);
router.post('/internal-transfer',ClerkExpressRequireAuth(),requireKyc,checkIdempotency,internalTransfer);

module.exports = router;
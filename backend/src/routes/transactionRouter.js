const {withdrawMoney,transferPeer,internalTransfer,createDepositIntent,createConnectAccount} = require('../controllers/transactionController');
const checkIdempotency = require("../middleware/idempotencyMiddleware");
const {loadUser,requireProfile} = require("../middleware/loadUser");
const {transferLimiter} = require('../middleware/rateLimiter');
const router = require('express').Router();
const { withdrawBody, transferPeerBody, internalTransferBody,createDepositBody } = require('../schemas/transactionSchemas')
const validate = require('../middleware/validate')

router.post('/withdraw',loadUser,transferLimiter,requireProfile,validate({body:withdrawBody}),checkIdempotency,withdrawMoney);
router.post('/peer-transfer',loadUser,transferLimiter,requireProfile,validate({body:transferPeerBody}),checkIdempotency,transferPeer);
router.post('/internal-transfer',loadUser,transferLimiter,requireProfile,validate({body:internalTransferBody}),checkIdempotency,internalTransfer);
router.post('/create-deposit-intent',loadUser,requireProfile,validate({body:createDepositBody}),createDepositIntent);
router.post('/connect-bank',loadUser,requireProfile,createConnectAccount); 

module.exports = router;
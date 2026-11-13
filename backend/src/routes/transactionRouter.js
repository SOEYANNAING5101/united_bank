const {withdrawMoney,transferPeer,internalTransfer,createDepositIntent,createConnectAccount} = require('../controllers/transactionController');
const checkIdempotency = require("../middleware/idempotencyMiddleware");
const {loadUser,requireProfile} = require("../middleware/loadUser");
const {transferLimiter} = require('../middleware/rateLimiter');
const router = require('express').Router();

router.post('/withdraw',loadUser,transferLimiter,requireProfile,checkIdempotency,withdrawMoney);
router.post('/peer-transfer',loadUser,transferLimiter,requireProfile,checkIdempotency,transferPeer);
router.post('/internal-transfer',loadUser,transferLimiter,requireProfile,checkIdempotency,internalTransfer);
router.post('/create-deposit-intent',loadUser,requireProfile,createDepositIntent);
router.post('/connect-bank',loadUser,requireProfile,createConnectAccount); //stripe account

module.exports = router;

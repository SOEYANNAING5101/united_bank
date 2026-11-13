const router = require("express").Router();
const {createAccount,getAccountOwner,getTransactionHistory,getAccountDetails,updateAccountDetails} = require('../controllers/accountController')
const {loadUser,requireProfile} = require("../middleware/loadUser")
const {accountActionLimiter,lookupLimiter} = require('../middleware/rateLimiter')

router.post('/create',loadUser,accountActionLimiter,requireProfile,createAccount)
router.get('/:account_id',loadUser,requireProfile,getAccountDetails)
router.put('/:account_id/limit',loadUser,accountActionLimiter,requireProfile,updateAccountDetails)
router.get('/lookup/:account_number',loadUser,lookupLimiter,requireProfile,getAccountOwner)
router.get('/history/:account_id',loadUser,requireProfile,getTransactionHistory)

module.exports = router;
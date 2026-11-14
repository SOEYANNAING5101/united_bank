const router = require("express").Router();
const {createAccount,getAccountOwner,getTransactionHistory,getAccountDetails,updateAccountDetails} = require('../controllers/accountController')
const {loadUser,requireProfile} = require("../middleware/loadUser")
const {accountActionLimiter,lookupLimiter} = require('../middleware/rateLimiter')
const validate =require('../middleware/validate')
const s =require('../schemas/accountSchemas')

router.post('/create',loadUser,accountActionLimiter,requireProfile,validate({body:s.createAccountBody}),createAccount)
router.get('/:account_id',loadUser,requireProfile,validate({params:s.accountIdParams}),getAccountDetails)
router.put('/:account_id/limit',loadUser,accountActionLimiter,requireProfile,validate({params:s.accountIdParams,body:s.limitBody}),updateAccountDetails)
router.get('/lookup/:account_number',loadUser,lookupLimiter,requireProfile,validate({params:s.lookupParams}),getAccountOwner)
router.get('/history/:account_id',loadUser,requireProfile,validate({params:s.historyParams,query:s.historyQuery}),getTransactionHistory)

module.exports = router;
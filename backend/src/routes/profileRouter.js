const router = require("express").Router();
const {submitProfile,checkProfileStatus,getProfileData,updateContact,updateFinancial} = require('../controllers/profileController')
const {loadUser,requireProfile} = require("../middleware/loadUser")
const {profileActionLimiter} = require('../middleware/rateLimiter')

router.get('/status',loadUser,checkProfileStatus)
router.get('/',loadUser,getProfileData)
router.post('/submit',loadUser,profileActionLimiter,submitProfile)
router.put('/financial',loadUser,requireProfile,profileActionLimiter,updateFinancial)
router.put('/contact',loadUser,requireProfile,profileActionLimiter,updateContact)


module.exports = router;
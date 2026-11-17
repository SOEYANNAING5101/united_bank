const router = require("express").Router();
const {submitProfile,checkProfileStatus,getProfileData,updateContact,updateFinancial} = require('../controllers/profileController')
const {loadUser,requireProfile} = require("../middleware/loadUser")
const {profileActionLimiter} = require('../middleware/rateLimiter')
const  { submitProfileBody,financialBody,contactBody } = require('../schemas/profileSchemas')
const validate = require('../middleware/validate')

router.get('/status',loadUser,checkProfileStatus)
router.get('/',loadUser,getProfileData)
router.post('/submit',loadUser,profileActionLimiter,validate({body:submitProfileBody}),submitProfile)
router.put('/financial',loadUser,requireProfile,profileActionLimiter,validate({body:financialBody}),updateFinancial)
router.put('/contact',loadUser,requireProfile,profileActionLimiter,validate({body:contactBody}),updateContact)


module.exports = router;
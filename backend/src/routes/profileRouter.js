const router = require("express").Router();
const {submitProfile,checkProfileStatus,getProfileData,updateContact,updateFinancial} = require('../controllers/profileController')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const {profileActionLimiter} = require('../middleware/rateLimiter')

router.get('/status',ClerkExpressRequireAuth(),checkProfileStatus)
router.get('/',ClerkExpressRequireAuth(),getProfileData)
router.post('/submit',ClerkExpressRequireAuth(),profileActionLimiter,submitProfile)
router.put('/financial',ClerkExpressRequireAuth(),profileActionLimiter,updateFinancial)
router.put('/contact',ClerkExpressRequireAuth(),profileActionLimiter,updateContact)


module.exports = router;
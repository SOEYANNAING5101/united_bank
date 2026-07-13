const router = require("express").Router();
const {submitProfile,checkProfileStatus,getProfileData,updateContact,updateFinancial} = require('../controllers/profileController')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.post('/submit',ClerkExpressRequireAuth(),submitProfile)
router.get('/status',ClerkExpressRequireAuth(),checkProfileStatus)
router.get('/',ClerkExpressRequireAuth(),getProfileData)
router.put('/financial',ClerkExpressRequireAuth(),updateFinancial)
router.put('/contact',ClerkExpressRequireAuth(),updateContact)


module.exports = router;
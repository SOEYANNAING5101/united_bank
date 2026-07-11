const router = require("express").Router();
const {submitProfile,checkProfileStatus} = require('../controllers/profileController')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.post('/submit',ClerkExpressRequireAuth(),submitProfile)
router.get('/status',ClerkExpressRequireAuth(),checkProfileStatus)

module.exports = router;
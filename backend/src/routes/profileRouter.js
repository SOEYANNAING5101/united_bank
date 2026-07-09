const router = require("express").Router();
const {submitProfile} = require('../controllers/profileController')
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

router.post('/submit',ClerkExpressRequireAuth(),submitProfile)

module.exports = router;
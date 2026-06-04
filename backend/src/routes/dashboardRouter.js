const {getDashboardData} = require('../controllers/dashboardController')
const router = require('express').Router()
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.get('/',ClerkExpressRequireAuth(),getDashboardData)

module.exports = router;
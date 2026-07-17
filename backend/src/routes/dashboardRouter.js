const {getDashboardData} = require('../controllers/dashboardController')
const router = require('express').Router()
const { requireKyc } = require ('../middleware/kycMiddleware')
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.get('/',ClerkExpressRequireAuth(),requireKyc,getDashboardData)

module.exports = router;
const {getChartData} = require('../controllers/chartController')
const router = require('express').Router()
const { requireKyc } = require ('../middleware/kycMiddleware')
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.get('/',ClerkExpressRequireAuth(),requireKyc,getChartData)

module.exports = router;
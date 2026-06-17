const {getChartData} = require('../controllers/chartController')
const router = require('express').Router()
const {ClerkExpressRequireAuth} = require('@clerk/clerk-sdk-node')

router.get('/',ClerkExpressRequireAuth(),getChartData)

module.exports = router;
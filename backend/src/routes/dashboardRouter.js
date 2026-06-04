const {getDashboardData} = require('../controllers/dashboardController')
const router = require('express').Router()
const verifyToken = require('../middleware/authMiddleware')

router.get('/',verifyToken,getDashboardData)

module.exports = router;
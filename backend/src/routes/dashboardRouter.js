const {getDashboardData} = require('../controllers/dashboardController')
const router = require('express').Router()
const {loadUser,requireProfile} = require("../middleware/loadUser")

router.get('/',loadUser,requireProfile,getDashboardData)

module.exports = router;
const {getChartData} = require('../controllers/chartController')
const router = require('express').Router()
const {loadUser,requireProfile} = require("../middleware/loadUser")

router.get('/',loadUser,requireProfile,getChartData)

module.exports = router;
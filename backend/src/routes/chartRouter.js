const {getChartData} = require('../controllers/chartController')
const router = require('express').Router()
const {loadUser,requireProfile} = require("../middleware/loadUser")
const {chartQuery} =require('../schemas/chartSchemas')
const validate = require('../middleware/validate')

router.get('/',loadUser,requireProfile,validate({query:chartQuery}),getChartData)

module.exports = router;
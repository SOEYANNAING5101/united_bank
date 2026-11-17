const router = require("express").Router()
const { loadUser,requireAdmin } = require("../middleware/loadUser");
const validate = require("../middleware/validate");
const {adminActionParams } = require('../schemas/dealSchemas');
const { getDisputeDeals,postAdminResolve } = require('../controllers/dealController');



router.get("/deals",loadUser,requireAdmin,getDisputeDeals);
router.post("/deals/:id/:action",loadUser,requireAdmin,validate({params:adminActionParams}),postAdminResolve)
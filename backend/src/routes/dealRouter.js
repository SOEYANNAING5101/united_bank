
const router = require("express").Router()
const checkIdempotency = require("../middleware/idempotencyMiddleware");
const { loadUser, requireProfile,requireAdmin } = require("../middleware/loadUser");
const { transferLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { postDeal,postDealAction,getMyDeals,getOneDeal } = require('../controllers/dealController');
const { createDealBody,dealActionParams,dealActionBody,dealIdParams } = require('../schemas/dealSchemas')

router.post("/",loadUser,requireProfile,transferLimiter,validate({body:createDealBody}),checkIdempotency,postDeal)
router.post("/:id/:action",loadUser,requireProfile,transferLimiter,validate({params:dealActionParams,body:dealActionBody}),checkIdempotency,postDealAction)
router.get("/",loadUser,requireProfile,getMyDeals)
router.get("/:id",loadUser,requireProfile,validate({params:dealIdParams}),getOneDeal)

module.exports = router;
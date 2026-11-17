
const router = require("express").Router()
const checkIdempotency = require("../middleware/idempotencyMiddleware");
const { loadUser, requireProfile } = require("../middleware/loadUser");
const { transferLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validate");
const { postDeal,postDealAction } = require('../controllers/dealController');
const { createDealBody,dealActionParams,dealActionBody } = require('../schemas/dealSchemas')

router.post("/",loadUser,requireProfile,transferLimiter,validate({body:createDealBody}),checkIdempotency,postDeal)
router.post("/:id/:action",loadUser,requireProfile,transferLimiter,validate({params:dealActionParams,body:dealActionBody}),checkIdempotency,postDealAction)
module.exports = router;
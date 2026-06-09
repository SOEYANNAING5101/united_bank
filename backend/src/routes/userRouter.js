const router  = require("express").Router()
const bodyParser = require("body-parser");
const {clerkWebhook} = require('../controllers/webhookController')

router.post(
    "/clerk",
    bodyParser.raw({type: 'application/json'}),
    clerkWebhook
)

module.exports = router;
const router  = require("express").Router()
const bodyParser = require("body-parser");
const {userRegister,userLogIn} = require('../controllers/authController')
const {clerkWebhook} = require('../controllers/webhookController')

// router.post("/register-user",userRegister)
// router.post("/login-user",userLogIn)

router.post(
    "/clerk",
    bodyParser.raw({type: 'application/json'}),
    clerkWebhook
)

module.exports = router;
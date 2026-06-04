const router  = require("express").Router()
const {userRegister,userLogIn} = require('../controllers/authController')

router.post("/register-user",userRegister)
router.post("/login-user",userLogIn)

module.exports = router;
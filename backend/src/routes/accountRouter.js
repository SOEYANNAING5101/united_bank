const router = require("express").Router();
const {openAccount,getAccountOwner} = require('../controllers/accountController')
const verifyToken = require ('../middleware/authMiddleware')

router.post('/open',verifyToken,openAccount)
router.get('/lookup/:account_number',verifyToken,getAccountOwner)

module.exports = router;
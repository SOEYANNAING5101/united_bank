const {depositMoney,transferMoney} = require('../controllers/transactionController');
const router = require('express').Router();
const verifyToken = require('../middleware/authMiddleware')

router.post('/deposit',verifyToken,depositMoney);
router.post('/transfer',verifyToken,transferMoney);

module.exports = router;
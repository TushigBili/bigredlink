// routes/transactions.js
const express = require('express');
const { sendMoney } = require('../controllers/transactionController');

const router = express.Router();

// Send money route
router.post('/send', sendMoney);

module.exports = router;

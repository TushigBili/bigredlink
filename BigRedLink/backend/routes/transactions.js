// routes/transactions.js
const express = require('express');
const {
  sendMoney,
  createTransaction,
  getUserTransactions,
} = require('../controllers/transactionController');

const router = express.Router();

// Send money route
router.post('/send', sendMoney);

// Create transaction route
router.post('/', createTransaction);

// Get user transactions route
router.get('/:user_id', getUserTransactions);

module.exports = router;

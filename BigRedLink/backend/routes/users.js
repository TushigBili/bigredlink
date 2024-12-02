// routes/users.js

const express = require('express');
const { registerUser, loginUser, depositMoney, withdraw, getUserBalance } = require('../controllers/userController');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Deposit money route
router.post('/deposit', depositMoney);

// Withdraw money route
router.post('/withdraw', withdraw);

// Get user balance route
router.get('/balance/:user_id', getUserBalance);

module.exports = router;

// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register User
const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, username, password, balance } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      balance,
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate token (optional)
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', user_id: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deposit Money
const depositMoney = async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be greater than zero' });
    }

    // Find user and update balance
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.balance += amount;
    await user.save();

    res.status(200).json({ message: `Successfully deposited $${amount.toFixed(2)}. New balance: $${user.balance.toFixed(2)}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Withdraw Money
const withdraw = async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    // Find the user
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Deduct the amount from the user's balance
    user.balance -= amount;
    await user.save();

    res.status(200).json({ message: `Successfully withdrew $${amount}. Remaining balance: $${user.balance}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Balance Function
const getUserBalance = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find user by ID
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Other functions: registerUser, loginUser, depositMoney, withdraw

module.exports = {
  registerUser,
  loginUser,
  depositMoney,
  withdraw,
  getUserBalance, 
};
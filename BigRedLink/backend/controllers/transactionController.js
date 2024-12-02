// controllers/transactionController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Send Money
const sendMoney = async (req, res) => {
  try {
    const { sender_id, receiver_username, amount } = req.body;

    // Find sender and receiver
    const sender = await User.findById(sender_id);
    const receiver = await User.findOne({ username: receiver_username });

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or Receiver not found' });
    }

    // Check balance
    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Update balances 
    sender.balance -= amount;
    receiver.balance += amount;

    // Save updated balances
    await sender.updateOne({ balance: sender.balance });
    await receiver.updateOne({ balance: receiver.balance });

    // Log transaction
    const transaction = new Transaction({
      sender_id,
      receiver_id: receiver._id,
      amount,
      message: 'Transfer',
      accepted: true,
    });

    await transaction.save();
    res.status(200).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const { sender_id, receiver_id, amount, message, accepted } = req.body;

    const transaction = new Transaction({
      sender_id,
      receiver_id,
      amount,
      message,
      accepted: accepted || false,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Transactions by User
const getUserTransactions = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const transactions = await Transaction.find({
      $or: [{ sender_id: user_id }, { receiver_id: user_id }],
    });

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Correctly export all functions
module.exports = {
  sendMoney,
  createTransaction,
  getUserTransactions,
};

// controllers/transactionController.js
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Send Money
exports.sendMoney = async (req, res) => {
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
    await sender.save();
    await receiver.save();

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
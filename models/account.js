const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    required: true,
    enum: ['checking', 'savings', 'credit']
  },
  balance: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', AccountSchema);

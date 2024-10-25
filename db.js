const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;  // Ensure your URI is stored in the .env file

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

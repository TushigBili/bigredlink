require('dotenv').config();  // This must be at the very top of server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');  // Import the DB connection

const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

console.log('MONGO_URI:', process.env.MONGO_URI);  // Debugging line

connectDB(); // Call this function to connect to MongoDB

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Home Route
app.get('/', (req, res) => {
  res.send('Welcome to BigRedLink Backend (Node.js + Express)');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const Account = require('./models/account'); // Require the Account model
const Transaction = require('./models/transaction'); // Require the Transaction model
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
connectDB(); // Connect to the database

app.set('trust proxy', 1);  // The number depends on how many proxies are between the client and the server

app.use(express.json());
app.use(morgan('dev')); // Logging middleware

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Welcome to our Mock Bank API');
});


app.get('/login', (req, res) => {
  res.send('Login route is active. Please use POST to submit credentials.');
});


// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'ebr66' && password === 'messi') {
    const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});




// Route to create a new account with validation
app.post('/accounts', [
    body('accountName').isString().trim().notEmpty(),
    body('accountType').isIn(['checking', 'savings', 'credit']),
    body('balance').isNumeric(),
    body('currency').isString().trim().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newAccount = new Account(req.body);
      const savedAccount = await newAccount.save();
      res.status(201).json(savedAccount);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Route to fetch all accounts
app.get('/accounts', async (req, res) => {
    try {
      const accounts = await Account.find();
      res.status(200).json(accounts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});


app.post('/transactions', [
  body('fromAccount').isMongoId(),
  body('toAccount').isMongoId(),
  body('amount').isNumeric(),
  body('status').isIn(['pending', 'completed', 'failed']),
  body('transactionDate').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      const newTransaction = new Transaction(req.body);
      const savedTransaction = await newTransaction.save();
      res.status(201).json(savedTransaction);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

app.get('/transactions', async (req, res) => {
  try {
      const transactions = await Transaction.find().populate('fromAccount toAccount');
      res.status(200).json(transactions);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

app.get('/tshirt', (req, res) =>{
  res.status(200).send({
    size: 'large'
  })
});

app.post('/tshirt/:id', (req, res) => {
    const { id } = req.params;

    res.send({
      tshirt:'Id of ${id}',
    });
});


// Authentication Middleware for secure routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Bearer Token
  if (token == null) return res.sendStatus(401);  // No token, unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);  // Invalid token
    req.user = user;
    next();  // Proceed to the next middleware or request handler
  });
};

// Secure route example
app.get('/secure-data', authenticateToken, (req, res) => {
  res.json({ message: "Secure data accessed", content: "Secure content here." });
});

// Error handling middleware should be last
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


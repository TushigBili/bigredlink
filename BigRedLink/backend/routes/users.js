// routes/users.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');

const router = express.Router();

// Route to handle GET request for /api/users
router.get('/', async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users from the database
      res.json({ users }); // Respond with the users as JSON
    } catch (err) {
      res.status(500).json({ error: err.message }); // Handle any errors
    }
});
  
// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');
const { auth } = require('../middleware/auth');

// @route   POST api/auth/login
// @desc    Authenticate voter & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { voterId, password } = req.body;

  try {
    // Check if voter exists
    const voter = await Voter.findOne({ voterId });
    if (!voter) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await voter.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: voter.id,
        voterId: voter.voterId,
        isAdmin: voter.isAdmin,
        hasVoted: voter.hasVoted
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Authentication error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get current voter
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user.user.id).select('-password');
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    res.json(voter);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Authentication error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
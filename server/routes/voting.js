const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { blockchain } = require('../blockchain');

// @route   GET api/voting/candidates
// @desc    Get all candidates for current election
// @access  Private
router.get('/candidates', auth, async (req, res) => {
  try {
    // Find active election
    const activeElection = await Election.findOne({ isActive: true });
    if (!activeElection) {
      return res.status(400).json({ message: 'No active election found' });
    }

    // Get candidates for the active election
    const candidates = await Candidate.find({
      _id: { $in: activeElection.candidates }
    });

    res.json(candidates);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Voting operation error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/voting/status
// @desc    Check if voter has already voted
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const voter = await Voter.findById(req.user.user.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    // Check if there's an active election
    const activeElection = await Election.findOne({ isActive: true });
    if (!activeElection) {
      return res.status(400).json({ 
        hasVoted: false,
        canVote: false,
        message: 'No active election found' 
      });
    }

    // Check if voter has already voted in blockchain
    const hasVotedInBlockchain = blockchain.hasVoted(voter.voterId);

    // Update voter status if needed
    if (hasVotedInBlockchain && !voter.hasVoted) {
      voter.hasVoted = true;
      await voter.save();
    }

    res.json({
      hasVoted: voter.hasVoted,
      canVote: activeElection.isActive && !voter.hasVoted,
      electionId: activeElection._id
    });
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Voting operation error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/voting/cast
// @desc    Cast a vote
// @access  Private
router.post('/cast', auth, async (req, res) => {
  const { candidateId } = req.body;

  try {
    // Check if there's an active election
    const activeElection = await Election.findOne({ isActive: true });
    if (!activeElection) {
      return res.status(400).json({ message: 'No active election found' });
    }

    // Get voter
    const voter = await Voter.findById(req.user.user.id);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    // Check if voter has already voted
    if (voter.hasVoted || blockchain.hasVoted(voter.voterId)) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Check if candidate exists and is part of the active election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    if (!activeElection.candidates.includes(candidateId)) {
      return res.status(400).json({ message: 'Candidate is not part of the current election' });
    }

    // Add vote to blockchain
    const voteData = {
      voterId: voter.voterId,
      candidateId: candidateId,
      electionId: activeElection._id
    };

    const newBlock = blockchain.addBlock(voteData);

    // Update voter status
    voter.hasVoted = true;
    await voter.save();

    // Increment candidate vote count
    candidate.voteCount += 1;
    await candidate.save();

    // Save blockchain to file
    blockchain.saveToFile();

    res.json({
      message: 'Vote cast successfully',
      blockIndex: newBlock.index,
      timestamp: newBlock.timestamp
    });
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Voting operation error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
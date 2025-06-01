const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const Voter = require('../models/Voter');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { blockchain } = require('../blockchain');


// @route   POST api/admin/clear-votes
// @desc    Clear all votes and reset blockchain
// @access  Admin
router.post('/clear-votes', adminAuth, async (req, res) => {
  try {
    // Reset blockchain to genesis block
    blockchain.clearVotes();

    // Reset all voters' hasVoted status
    await Voter.updateMany({}, { hasVoted: false });

    // Reset all candidates' vote counts
    await Candidate.updateMany({}, { voteCount: 0 });

    res.json({ message: 'All votes have been cleared successfully' });
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('Error clearing votes:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/elections
// @desc    Get all elections
// @access  Admin
router.get('/elections', adminAuth, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/elections
// @desc    Create a new election
// @access  Admin
router.post('/elections', adminAuth, async (req, res) => {
  const { title, description } = req.body;

  try {
    // Check if there's already an active election
    const activeElection = await Election.findOne({ isActive: true });
    if (activeElection) {
      return res.status(400).json({ 
        message: 'There is already an active election. End it before creating a new one.' 
      });
    }

    const newElection = new Election({
      title,
      description,
      isActive: false,
      candidates: []
    });

    await newElection.save();
    res.json(newElection);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/elections/:id/start
// @desc    Start an election
// @access  Admin
router.put('/elections/:id/start', adminAuth, async (req, res) => {
  try {
    // Check if there's already an active election
    const activeElection = await Election.findOne({ isActive: true });
    if (activeElection && activeElection._id.toString() !== req.params.id) {
      return res.status(400).json({ 
        message: 'There is already an active election. End it before starting a new one.' 
      });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.candidates.length === 0) {
      return res.status(400).json({ message: 'Cannot start an election with no candidates' });
    }

    // Reset hasVoted status for all voters when starting a new election
    await Voter.updateMany({}, { hasVoted: false });

    election.isActive = true;
    election.startDate = Date.now();
    election.endDate = null;

    await election.save();
    res.json(election);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/elections/:id/end
// @desc    End an election
// @access  Admin
router.put('/elections/:id/end', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!election.isActive) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    election.isActive = false;
    election.endDate = Date.now();

    await election.save();
    res.json(election);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/candidates
// @desc    Get all candidates
// @access  Admin
router.get('/candidates', adminAuth, async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ name: 1 });
    res.json(candidates);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/candidates
// @desc    Create a new candidate
// @access  Admin
router.post('/candidates', adminAuth, async (req, res) => {
  const { name, party, position, description } = req.body;

  try {
    const newCandidate = new Candidate({
      name,
      party,
      position,
      description
    });

    await newCandidate.save();
    res.json(newCandidate);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/elections/:electionId/candidates/:candidateId
// @desc    Add candidate to election
// @access  Admin
router.put('/elections/:electionId/candidates/:candidateId', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.isActive) {
      return res.status(400).json({ message: 'Cannot modify candidates in an active election' });
    }

    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if candidate is already in the election
    if (election.candidates.includes(req.params.candidateId)) {
      return res.status(400).json({ message: 'Candidate already added to this election' });
    }

    election.candidates.push(req.params.candidateId);
    await election.save();

    res.json(election);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/admin/elections/:electionId/candidates/:candidateId
// @desc    Remove candidate from election
// @access  Admin
router.delete('/elections/:electionId/candidates/:candidateId', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.isActive) {
      return res.status(400).json({ message: 'Cannot modify candidates in an active election' });
    }

    // Check if candidate is in the election
    if (!election.candidates.includes(req.params.candidateId)) {
      return res.status(400).json({ message: 'Candidate not in this election' });
    }

    // Remove candidate from election
    election.candidates = election.candidates.filter(
      candidateId => candidateId.toString() !== req.params.candidateId
    );

    await election.save();
    res.json(election);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/blockchain
// @desc    Get the entire blockchain
// @access  Admin
router.get('/blockchain', adminAuth, async (req, res) => {
  try {
    const chain = blockchain.getChain();
    res.json(chain);
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/blockchain/validate
// @desc    Validate the blockchain
// @access  Admin
router.get('/blockchain/validate', adminAuth, async (req, res) => {
  try {
    const isValid = blockchain.isChainValid();
    res.json({ isValid });
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/results/:electionId
// @desc    Get election results
// @access  Admin
router.get('/results/:electionId', adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get vote counts from blockchain
    const voteCounts = blockchain.getVoteCounts();
    
    // Get candidates with vote counts
    const candidates = await Candidate.find({
      _id: { $in: election.candidates }
    });

    const results = candidates.map(candidate => ({
      _id: candidate._id,
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      voteCount: voteCounts[candidate._id.toString()] || 0
    }));

    res.json({
      election,
      results
    });
  } catch (err) {
    const logger = require('../utils/logger');

logger.error('Error fetching elections:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/voters
// @desc    Get all voters
// @access  Admin
router.get('/voters', adminAuth, async (req, res) => {
  try {
    const voters = await Voter.find().select('-password');
    res.json(voters);
  } catch (err) {
    const logger = require('../utils/logger');
    logger.error('Error fetching voters:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
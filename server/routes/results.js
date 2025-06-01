const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const { blockchain } = require('../blockchain');
const logger = require('../utils/logger');

// @route   GET api/results/current
// @desc    Get results for current election
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    // Find the active election
    const election = await Election.findOne({ isActive: true });
    if (!election) {
      return res.status(404).json({ message: 'No active election found' });
    }

    // Get all candidates for this election
    const candidates = await Candidate.find({
      _id: { $in: election.candidates }
    });

    // Get all votes from blockchain
    const chain = blockchain.getChain();
    const votes = chain
      .filter(block => 
        block.voteData && 
        block.voteData.electionId && 
        block.voteData.electionId.toString() === election._id.toString()
      );

    // Count votes for each candidate
    const results = candidates.map(candidate => {
      const voteCount = votes.filter(
        block => block.voteData.candidateId.toString() === candidate._id.toString()
      ).length;

      return {
        candidateId: candidate._id,
        name: candidate.name,
        party: candidate.party,
        voteCount
      };
    });

    // Calculate total votes
    const totalVotes = results.reduce((sum, result) => sum + result.voteCount, 0);

    // Add percentage to each result
    const resultsWithPercentage = results.map(result => ({
      ...result,
      percentage: totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(2) : 0
    }));

    // Sort by vote count in descending order
    resultsWithPercentage.sort((a, b) => b.voteCount - a.voteCount);

    res.json({
      electionId: election._id,
      title: election.title,
      totalVotes,
      results: resultsWithPercentage
    });

  } catch (err) {
    logger.error('Error fetching election results:', err.message);
    res.status(500).json({ message: 'Server error while fetching results' });
  }
});

// @route   GET api/results/:electionId
// @desc    Get results for a specific election
// @access  Private
router.get('/:electionId', auth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get all candidates for this election
    const candidates = await Candidate.find({
      _id: { $in: election.candidates }
    });

    // Get all votes from blockchain
    const chain = blockchain.getChain();
    const votes = chain
      .filter(block => 
        block.voteData && 
        block.voteData.electionId && 
        block.voteData.electionId.toString() === election._id.toString()
      );

    // Count votes for each candidate
    const results = candidates.map(candidate => {
      const voteCount = votes.filter(
        block => block.voteData.candidateId.toString() === candidate._id.toString()
      ).length;

      return {
        candidateId: candidate._id,
        name: candidate.name,
        party: candidate.party,
        voteCount
      };
    });

    // Calculate total votes
    const totalVotes = results.reduce((sum, result) => sum + result.voteCount, 0);

    // Add percentage to each result
    const resultsWithPercentage = results.map(result => ({
      ...result,
      percentage: totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(2) : 0
    }));

    // Sort by vote count in descending order
    resultsWithPercentage.sort((a, b) => b.voteCount - a.voteCount);

    res.json({
      electionId: election._id,
      title: election.title,
      status: election.isActive ? 'Active' : 'Completed',
      startDate: election.startDate,
      endDate: election.endDate,
      totalVotes,
      results: resultsWithPercentage
    });

  } catch (err) {
    logger.error('Error fetching election results:', err.message);
    res.status(500).json({ message: 'Server error while fetching results' });
  }
});

module.exports = router;
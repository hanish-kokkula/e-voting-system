const Block = require('./Block');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // Adjust as needed for demo purposes
    this.pendingVotes = [];
  }

  // Clear all votes by resetting to genesis block
  clearVotes() {
    this.chain = [this.createGenesisBlock()];
    this.saveToFile(); // Save the reset blockchain
    return true;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), { hashedVoterId: 'Genesis Block', candidateId: 'Genesis' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Add a new vote as a block to the chain
  addBlock(voteData) {
    // Hash the voter ID for privacy
    const hashedVoterId = crypto
      .createHash('sha256')
      .update(voteData.voterId)
      .digest('hex');

    const newVoteData = {
      hashedVoterId,
      candidateId: voteData.candidateId,
      electionId: voteData.electionId
    };

    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      previousBlock.index + 1,
      Date.now(),
      newVoteData,
      previousBlock.hash
    );

    // Mine the block (simple proof of work)
    newBlock.mineBlock(this.difficulty);

    // Add to blockchain
    this.chain.push(newBlock);
    return newBlock;
  }

  // Validate the integrity of the blockchain
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // Get the entire blockchain
  getChain() {
    return this.chain;
  }

  // Check if a voter has already voted
  hasVoted(voterId) {
    const hashedVoterId = crypto
      .createHash('sha256')
      .update(voterId)
      .digest('hex');

    return this.chain.some(block => 
      block.voteData && block.voteData.hashedVoterId === hashedVoterId
    );
  }

  // Save blockchain to a file
  saveToFile(filename = 'blockchain.json') {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(this.chain, null, 2));
    console.log(`Blockchain saved to ${filePath}`);
  }

  // Load blockchain from a file
  loadFromFile(filename = 'blockchain.json') {
    try {
      const filePath = path.join(__dirname, filename);
      const data = fs.readFileSync(filePath, 'utf8');
      const chainData = JSON.parse(data);
      
      // Reconstruct the chain with proper Block instances
      this.chain = chainData.map(blockData => {
        const block = new Block(
          blockData.index,
          blockData.timestamp,
          blockData.voteData,
          blockData.previousHash
        );
        block.hash = blockData.hash;
        block.nonce = blockData.nonce;
        return block;
      });
      
      console.log(`Blockchain loaded from ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error loading blockchain:', error.message);
      return false;
    }
  }

  // Get vote counts for each candidate
  getVoteCounts() {
    const voteCounts = {};
    
    // Skip genesis block
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      if (block.voteData && block.voteData.candidateId) {
        const { candidateId } = block.voteData;
        voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
      }
    }
    
    return voteCounts;
  }
}

module.exports = Blockchain;
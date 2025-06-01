const crypto = require('crypto');

class Block {
  constructor(index, timestamp, voteData, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.voteData = voteData; // { hashedVoterId, candidateId }
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.voteData) +
        this.previousHash +
        this.nonce
      )
      .digest('hex');
  }

  // Simple proof of work (mining) - can be adjusted for difficulty
  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

module.exports = Block;
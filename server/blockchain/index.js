const Blockchain = require('./Blockchain');
const Block = require('./Block');

// Create a singleton instance of the blockchain
const blockchain = new Blockchain();

// Load existing blockchain from file if it exists
try {
  blockchain.loadFromFile();
  console.log('Blockchain loaded successfully');
} catch (error) {
  console.log('No existing blockchain found, starting with genesis block');
}

module.exports = {
  blockchain,
  Block,
  Blockchain
};
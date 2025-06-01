import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewBlockchain = () => {
  const [blockchain, setBlockchain] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch blockchain data on component mount
  useEffect(() => {
    const fetchBlockchain = async () => {
      try {
        const [chainRes, validationRes] = await Promise.all([
          axios.get('/api/admin/blockchain'),
          axios.get('/api/admin/blockchain/validate')
        ]);
        setBlockchain(chainRes.data);
        setIsValid(validationRes.data.isValid);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
        toast.error('Error loading blockchain data');
        setLoading(false);
      }
    };

    fetchBlockchain();
  }, []);

  const handleValidateChain = async () => {
    try {
      const res = await axios.get('/api/admin/blockchain/validate');
      setIsValid(res.data.isValid);
      toast.info(`Blockchain is ${res.data.isValid ? 'valid' : 'invalid'}`);
    } catch (err) {
      console.error('Error validating blockchain:', err);
      toast.error('Error validating blockchain');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blockchain Ledger</h1>
        <button
          onClick={handleValidateChain}
          className="btn btn-secondary"
        >
          Validate Chain
        </button>
      </div>

      {/* Blockchain Validation Status */}
      {isValid !== null && (
        <div 
          className={`p-4 mb-6 rounded-md ${isValid ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'}`}
        >
          <p className="font-semibold">
            Blockchain Status: {isValid ? 'Valid' : 'Invalid'}
          </p>
          {isValid ? 
            'The integrity of the blockchain has been verified.' : 
            'Warning: The blockchain may have been tampered with!'}
        </div>
      )}

      {/* Blockchain Blocks */}
      <div className="space-y-6">
        {blockchain.map((block, index) => (
          <div key={block.hash || index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Block #{block.index}</h2>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${block.index === 0 ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
                {block.index === 0 ? 'Genesis Block' : 'Vote Block'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Timestamp:</p>
                <p className="text-gray-800 dark:text-gray-100 break-all">{new Date(block.timestamp).toLocaleString()}</p>
              </div>
              
              {block.voteData && (
                <>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Hashed Voter ID:</p>
                    <p className="text-gray-800 dark:text-gray-100 break-all">{block.voteData.hashedVoterId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Candidate ID:</p>
                    <p className="text-gray-800 dark:text-gray-100 break-all">{block.voteData.candidateId}</p>
                  </div>
                  {block.voteData.electionId && (
                     <div>
                        <p className="text-gray-500 dark:text-gray-400">Election ID:</p>
                        <p className="text-gray-800 dark:text-gray-100 break-all">{block.voteData.electionId}</p>
                    </div>
                  )}
                </>
              )}
              
              <div>
                <p className="text-gray-500 dark:text-gray-400">Previous Hash:</p>
                <p className="text-gray-800 dark:text-gray-100 break-all">{block.previousHash}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Hash:</p>
                <p className="text-gray-800 dark:text-gray-100 break-all">{block.hash}</p>
              </div>
              {block.nonce !== undefined && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Nonce:</p>
                  <p className="text-gray-800 dark:text-gray-100 break-all">{block.nonce}</p>
                </div>
              )}
            </div>
            
            {index < blockchain.length - 1 && (
              <div className="flex justify-center mt-6">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBlockchain;
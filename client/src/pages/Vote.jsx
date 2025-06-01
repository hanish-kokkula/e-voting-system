import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

const Vote = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votingStatus, setVotingStatus] = useState({
    hasVoted: false,
    canVote: false,
    electionId: null,
    loading: true,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useContext(AuthContext);

  // Fetch voting status and candidates on component mount
  useEffect(() => {
    const fetchVotingData = async () => {
      try {
        // Get voting status
        const statusRes = await axios.get('/api/voting/status');
        setVotingStatus({
          ...statusRes.data,
          loading: false
        });

        // If user can vote, fetch candidates
        if (statusRes.data.canVote) {
          const candidatesRes = await axios.get('/api/voting/candidates');
          setCandidates(candidatesRes.data);
        }
      } catch (err) {
        console.error('Error fetching voting data:', err);
        setVotingStatus({
          hasVoted: false,
          canVote: false,
          loading: false,
          message: err.response?.data?.message || 'Error loading voting data'
        });
        toast.error('Error loading voting data');
      }
    };

    fetchVotingData();
  }, []);

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
  };

  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      toast.warning('Please select a candidate');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post('/api/voting/cast', {
        candidateId: selectedCandidate
      });

      setVotingStatus({
        ...votingStatus,
        hasVoted: true,
        canVote: false,
        message: 'Your vote has been cast successfully!'
      });

      toast.success('Vote cast successfully!');
    } catch (err) {
      console.error('Error casting vote:', err);
      toast.error(err.response?.data?.message || 'Error casting vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (votingStatus.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Already voted state
  if (votingStatus.hasVoted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4 text-green-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Thank You for Voting!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your vote has been securely recorded on the blockchain.
          </p>
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200">
              Your vote is anonymous and tamper-proof. The blockchain ensures that your vote is counted accurately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Can't vote state (no active election)
  if (!votingStatus.canVote) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4 text-yellow-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Active Election</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {votingStatus.message || 'There is no active election at the moment. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  // Can vote state
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Cast Your Vote</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Welcome, <span className="font-semibold">{user?.name || user?.voterId}</span>!
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Please select a candidate below to cast your vote. You can only vote once in this election.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {candidates.map(candidate => (
          <div 
            key={candidate._id}
            className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 cursor-pointer transition-all ${selectedCandidate === candidate._id ? 'border-blue-500 transform scale-105' : 'border-transparent hover:border-gray-300'}`}
            onClick={() => handleCandidateSelect(candidate._id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{candidate.name}</h3>
              {selectedCandidate === candidate._id && (
                <div className="bg-blue-500 text-white rounded-full p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Party:</span> {candidate.party}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <span className="font-semibold">Position:</span> {candidate.position}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {candidate.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleVoteSubmit}
          disabled={!selectedCandidate || isSubmitting}
          className={`btn ${!selectedCandidate ? 'btn-secondary' : 'btn-primary'} px-8 py-3 text-lg`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : 'Cast Vote'}
        </button>
      </div>
    </div>
  );
};

export default Vote;
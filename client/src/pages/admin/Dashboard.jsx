import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [activeElection, setActiveElection] = useState(null);
  const [electionStats, setElectionStats] = useState({
    totalVoters: 0,
    votedCount: 0,
    candidateCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get active election
        const electionsRes = await axios.get('/api/admin/elections');
        const active = electionsRes.data.find(election => election.isActive);
        setActiveElection(active || null);

        // Get blockchain data to count votes
        const blockchainRes = await axios.get('/api/admin/blockchain');
        const voteBlocks = blockchainRes.data.filter(block => 
          block.voteData && block.voteData.candidateId !== 'Genesis'
        );

        // Get voters count
        const votersRes = await axios.get('/api/admin/voters');
        const voters = votersRes.data || [];
        const votedVoters = voters.filter(voter => voter.hasVoted);

        // Get candidates
        const candidatesRes = await axios.get('/api/admin/candidates');
        
        setElectionStats({
          totalVoters: voters.length,
          votedCount: votedVoters.length,
          candidateCount: candidatesRes.data.length,
          blockchainLength: voteBlocks.length + 1 // +1 for genesis block
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Error loading dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Admin Dashboard</h1>
      
      {/* Election Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Election Status</h2>
        
        {activeElection ? (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-500 font-medium">Active Election</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">{activeElection.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{activeElection.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Started: {new Date(activeElection.startDate).toLocaleString()}
            </p>
            <div className="mt-4">
              <Link 
                to={`/admin/elections`}
                className="text-blue-500 hover:text-blue-700 mr-4"
              >
                Manage Election
              </Link>
              <Link 
                to="/admin/results"
                className="text-blue-500 hover:text-blue-700 mr-4"
              >
                View Results
              </Link>
              <button
                onClick={async () => {
                  try {
                    await axios.put(`/api/admin/elections/${activeElection._id}/end`);
                    toast.success('Election ended successfully');
                    setActiveElection(null);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Error ending election');
                  }
                }}
                className="text-red-500 hover:text-red-700"
              >
                End Election
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-red-500 font-medium">No Active Election</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              There is currently no active election. Start an election to allow voters to cast their votes.
            </p>
            <Link 
              to="/admin/elections"
              className="btn btn-primary inline-block"
            >
              Manage Elections
            </Link>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Voters</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{(electionStats.totalVoters)-1}</h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Votes Cast</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{electionStats.votedCount}</h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Candidates</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{electionStats.candidateCount}</h3>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Blockchain Size</p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{electionStats.blockchainLength || 1}</h3>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/elections"
            className="bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 p-4 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">Manage Elections</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm">Create, start, or end elections</p>
          </Link>
          
          <Link 
            to="/admin/candidates"
            className="bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 p-4 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">Manage Candidates</h3>
            <p className="text-green-600 dark:text-green-400 text-sm">Add or remove election candidates</p>
          </Link>
          
          <Link 
            to="/admin/blockchain"
            className="bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 p-4 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">View Blockchain</h3>
            <p className="text-purple-600 dark:text-purple-400 text-sm">Inspect the vote ledger and validate chain</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
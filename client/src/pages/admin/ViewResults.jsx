import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const { electionId } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(
          electionId 
            ? `/api/results/${electionId}`
            : '/api/results/current'
        );
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        toast.error(err.response?.data?.message || 'Error loading election results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          No results available
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Election Results: {results.title}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            Total Votes Cast: <span className="font-semibold">{results.totalVotes}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Status: <span className="font-semibold">{results.status}</span>
          </p>
        </div>

        <div className="space-y-4">
          {results.results.map((result) => (
            <div 
              key={result.candidateId}
              className="border dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {result.name}
                </h3>
                <span className="text-2xl font-bold text-blue-500">
                  {result.percentage}%
                </span>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      {result.voteCount} votes
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${result.percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
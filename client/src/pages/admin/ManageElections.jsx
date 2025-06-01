import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageElections = () => {
  const [elections, setElections] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidatesForSelectedElection, setCandidatesForSelectedElection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch elections and candidates on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsRes, candidatesRes] = await Promise.all([
          axios.get('/api/admin/elections'),
          axios.get('/api/admin/candidates')
        ]);
        setElections(electionsRes.data);
        setAllCandidates(candidatesRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Error loading elections or candidates');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { title, description } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateElection = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post('/api/admin/elections', formData);
      setElections([...elections, res.data]);
      toast.success('Election created successfully');
      setFormData({ title: '', description: '' });
    } catch (err) {
      console.error('Error creating election:', err);
      toast.error(err.response?.data?.message || 'Error creating election');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectElection = (election) => {
    setSelectedElection(election);
    setCandidatesForSelectedElection(election.candidates || []);
  };

  const handleAddCandidateToElection = async (candidateId) => {
    if (!selectedElection) return;

    try {
      const res = await axios.put(`/api/admin/elections/${selectedElection._id}/candidates/${candidateId}`);
      setSelectedElection(res.data);
      setCandidatesForSelectedElection(res.data.candidates);
      // Update elections list
      setElections(elections.map(e => e._id === res.data._id ? res.data : e));
      toast.success('Candidate added to election');
    } catch (err) {
      console.error('Error adding candidate to election:', err);
      toast.error(err.response?.data?.message || 'Error adding candidate');
    }
  };

  const handleRemoveCandidateFromElection = async (candidateId) => {
    if (!selectedElection) return;

    try {
      const res = await axios.delete(`/api/admin/elections/${selectedElection._id}/candidates/${candidateId}`);
      setSelectedElection(res.data);
      setCandidatesForSelectedElection(res.data.candidates);
      // Update elections list
      setElections(elections.map(e => e._id === res.data._id ? res.data : e));
      toast.success('Candidate removed from election');
    } catch (err) {
      console.error('Error removing candidate from election:', err);
      toast.error(err.response?.data?.message || 'Error removing candidate');
    }
  };

  const handleStartElection = async (electionId) => {
    try {
      const res = await axios.put(`/api/admin/elections/${electionId}/start`);
      setElections(elections.map(e => e._id === electionId ? res.data : e));
      if (selectedElection && selectedElection._id === electionId) {
        setSelectedElection(res.data);
      }
      toast.success('Election started successfully');
    } catch (err) {
      console.error('Error starting election:', err);
      toast.error(err.response?.data?.message || 'Error starting election');
    }
  };

  const handleEndElection = async (electionId) => {
    try {
      const res = await axios.put(`/api/admin/elections/${electionId}/end`);
      setElections(elections.map(e => e._id === electionId ? res.data : e));
      if (selectedElection && selectedElection._id === electionId) {
        setSelectedElection(res.data);
      }
      toast.success('Election ended successfully');
    } catch (err) {
      console.error('Error ending election:', err);
      toast.error(err.response?.data?.message || 'Error ending election');
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Manage Elections</h1>

      {/* Create Election Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Create New Election</h2>
        <form onSubmit={handleCreateElection}>
          <div className="mb-4">
            <label htmlFor="title" className="form-label dark:text-white">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Election Title"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="form-label dark:text-white">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Brief description of the election"
              rows="3"
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Election'}
          </button>
        </form>
      </div>

      {/* Elections List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Existing Elections</h2>
        {elections.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No elections found. Create one using the form above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Candidates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {elections.map(election => (
                  <tr key={election._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{election.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {election.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{election.candidates.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSelectElection(election)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3"
                      >
                        Manage Candidates
                      </button>
                      {!election.isActive ? (
                        <button
                          onClick={() => handleStartElection(election._id)}
                          disabled={election.candidates.length === 0}
                          className={`text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 mr-3 ${election.candidates.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEndElection(election._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 mr-3"
                        >
                          End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Candidates for Selected Election */}
      {selectedElection && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Manage Candidates for: <span className="text-blue-600 dark:text-blue-400">{selectedElection.title}</span>
          </h2>
          {selectedElection.isActive && (
            <p className="text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md mb-4">
              This election is active. Candidates cannot be modified.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidates in Election */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Current Candidates ({candidatesForSelectedElection.length})</h3>
              {candidatesForSelectedElection.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No candidates added to this election yet.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {candidatesForSelectedElection.map(candidateId => {
                    const candidate = allCandidates.find(c => c._id === candidateId);
                    return candidate ? (
                      <li key={candidate._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-gray-800 dark:text-gray-100">{candidate.name} ({candidate.party})</span>
                        {!selectedElection.isActive && (
                          <button
                            onClick={() => handleRemoveCandidateFromElection(candidate._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>

            {/* Available Candidates */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Available Candidates</h3>
              {allCandidates.filter(c => !candidatesForSelectedElection.includes(c._id)).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No other candidates available or all are added.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {allCandidates
                    .filter(c => !candidatesForSelectedElection.includes(c._id))
                    .map(candidate => (
                      <li key={candidate._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-gray-800 dark:text-gray-100">{candidate.name} ({candidate.party})</span>
                        {!selectedElection.isActive && (
                          <button
                            onClick={() => handleAddCandidateToElection(candidate._id)}
                            className="text-green-500 hover:text-green-700 text-sm"
                          >
                            Add
                          </button>
                        )}
                      </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageElections;
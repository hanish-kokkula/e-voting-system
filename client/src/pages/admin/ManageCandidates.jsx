import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    position: '',
    description: ''
  });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch candidates on component mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get('/api/admin/candidates');
        setCandidates(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        toast.error('Error loading candidates');
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const { name, party, position, description } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCandidate) {
        // Update candidate (not implemented in backend, but can be added)
        // const res = await axios.put(`/api/admin/candidates/${editingCandidate._id}`, formData);
        // setCandidates(candidates.map(c => (c._id === editingCandidate._id ? res.data : c)));
        toast.info('Candidate update functionality not implemented yet.');
      } else {
        // Create new candidate
        const res = await axios.post('/api/admin/candidates', formData);
        setCandidates([...candidates, res.data]);
        toast.success('Candidate created successfully');
      }
      
      // Reset form
      setFormData({ name: '', party: '', position: '', description: '' });
      setEditingCandidate(null);
    } catch (err) {
      console.error('Error saving candidate:', err);
      toast.error(err.response?.data?.message || 'Error saving candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      description: candidate.description
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        // Delete candidate (not implemented in backend, but can be added)
        // await axios.delete(`/api/admin/candidates/${id}`);
        // setCandidates(candidates.filter(c => c._id !== id));
        toast.info('Candidate deletion functionality not implemented yet.');
      } catch (err) {
        console.error('Error deleting candidate:', err);
        toast.error(err.response?.data?.message || 'Error deleting candidate');
      }
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Manage Candidates</h1>

      {/* Candidate Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="form-label dark:text-white">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Candidate Name"
                required
              />
            </div>
            <div>
              <label htmlFor="party" className="form-label dark:text-white">Party</label>
              <input
                type="text"
                id="party"
                name="party"
                value={party}
                onChange={onChange}
                className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Political Party"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="position" className="form-label dark:text-white">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={position}
              onChange={onChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Position (e.g., President)"
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
              placeholder="Brief description of the candidate"
              rows="3"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            {editingCandidate && (
              <button
                type="button"
                onClick={() => {
                  setEditingCandidate(null);
                  setFormData({ name: '', party: '', position: '', description: '' });
                }}
                className="btn btn-secondary"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingCandidate ? 'Update Candidate' : 'Add Candidate')}
            </button>
          </div>
        </form>
      </div>

      {/* Candidates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Existing Candidates</h2>
        {candidates.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">No candidates found. Add some using the form above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {candidates.map(candidate => (
                  <tr key={candidate._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{candidate.party}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{candidate.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(candidate)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(candidate._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCandidates;
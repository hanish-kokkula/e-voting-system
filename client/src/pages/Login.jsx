import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    voterId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, isAdmin, error } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/vote');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const { voterId, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(voterId, password);
    
    setIsLoading(false);
    
    if (success) {
      // Redirect handled by useEffect
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">E-Voting System</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Secure, Transparent, Blockchain-based</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="voterId" className="form-label dark:text-white">Voter ID</label>
            <input
              type="text"
              id="voterId"
              name="voterId"
              value={voterId}
              onChange={onChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Enter your voter ID"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="form-label dark:text-white">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              E-Voting System
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <div className="flex items-center space-x-4">
                    <Link to="/admin" className="hover:text-blue-200">Dashboard</Link>
                    <Link to="/admin/elections" className="hover:text-blue-200">Elections</Link>
                    <Link to="/admin/candidates" className="hover:text-blue-200">Candidates</Link>
                    <Link to="/admin/blockchain" className="hover:text-blue-200">Blockchain</Link>
                    <Link to="/admin/results" className="hover:text-blue-200">results</Link>
                  </div>
                ) : (
                  <Link to="/vote" className="hover:text-blue-200">Vote</Link>
                )}
                <div className="flex items-center ml-4">
                  <span className="mr-2">{user?.name || user?.voterId}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="hover:text-blue-200">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
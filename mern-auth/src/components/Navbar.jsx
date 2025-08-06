import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-4xl font-bold">
          MERN Auth
        </Link>
        <div className="flex space-x-4">
          {currentUser ? (
            <>
              <Link to="/profile" className="hover:text-gray-300 text-2xl">
                Profile
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-300 text-2xl">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300 text-2xl">
                Log In
              </Link>
              <Link to="/register" className="hover:text-gray-300 text-2xl">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">CB</div>
            CloudBox
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-black font-medium transition-colors">Home</Link>
            <a href="/#features" className="text-gray-600 hover:text-black font-medium transition-colors">Features</a>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-black font-medium transition-colors">Dashboard</Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <FaUserCircle size={24} />
                  )}
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-black focus:outline-none">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-600 hover:text-black font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            <a href="/#features" className="text-gray-600 hover:text-black font-medium" onClick={() => setIsOpen(false)}>Features</a>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-black font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium" onClick={() => setIsOpen(false)}>
                  <FaUserCircle /> Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 text-red-600 font-medium text-left"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-black text-white rounded-lg font-medium text-center" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

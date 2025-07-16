import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Notifications from './notification';
import logoImage from '../assets/logo.png'; // Adjust the path as necessary
const Logo = () => (
  <div className="flex items-center ml-2 mt-1 sm:ml-2 space-x-2 sm:space-x-4">
    <img
      src={logoImage}
      alt="Logo"
      className="h-8 sm:h-10 w-auto object-contain"
    />
    <span className="text-xl font-bold text-blue-600">TASKNITTER</span>
  </div>
);


const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? '/profile' : '/login');
  };

  return (
    <div
      className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
      onClick={handleProfileClick}
    >
      {isLoggedIn ? (
        <>
          <img
            src={
              user?.profileImage ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtWEEWgiyAT_KVW1VcGhDPXe1wqDUx2e3eWMpcH5v3CgRtwRvq0ReyojDSqI5WJ2WYuWg&usqp=CAU"
            }
            alt="Profile"
            className="h-9 w-10 sm:h-9 sm:w-10 rounded-full object-cover border border-gray-300"
          />
          <span className="text-gray-800 font-medium text-sm sm:text-base">
            {user?.first_name}
          </span>
        </>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          Login
        </button>
      )}
    </div>
  );
};

const Navbar = () => (
  <div className="fixed top-0 w-full bg-white shadow-md z-10">
    <div className="relative container mx-auto px-4 py-2 sm:py-3 flex items-center justify-between">
      
      {/* Centered Logo on small screens */}
      <div className="absolute left-1/2 transform -translate-x-1/2 sm:static sm:translate-x-0 sm:left-0">
        <Logo />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
        <Notifications />
        <Profile />
      </div>
    </div>
  </div>
);

export default Navbar;

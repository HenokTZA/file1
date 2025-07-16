// src/components/Logout.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import { logoutUser } from '../../Services/authService';

const Logout = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser(); 
      dispatch(logout()); 
      // Optionally redirect or display a success message
    } catch (error) {
      console.error('Logout error:', error.response.data.message);
      // Handle error (show a notification, etc.)
    }
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">
      Logout
    </button>
  );
};

export default Logout;

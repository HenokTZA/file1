import React from 'react';
import ResetPassword from '../../Components/authComponents/resetPassword'; // Adjust path if needed

const ResetPasswordPage = () => {
  return (
    // This is the main page container, providing the background and centering everything.
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
     
      <div className="w-full max-w-md p-8 lg:p-10 bg-white rounded-xl shadow-2xl">
        <ResetPassword />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
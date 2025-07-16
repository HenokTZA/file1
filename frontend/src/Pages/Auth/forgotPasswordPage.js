import React from 'react';
import ForgotPassword from '../../Components/authComponents/forgotPassword';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-blue-700">Forgot Password</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your email and we’ll send you a reset link.
        </p>
        <ForgotPassword />
        <div className="mt-6 text-center">
          <Link to="/login" className="text-blue-500 hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

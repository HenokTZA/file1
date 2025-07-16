import React, { useState } from 'react';
import { forgotPassword } from '../../Services/authService';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword({ email });
      toast.success(response.message || "Reset link sent!");
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div >
        <label className="block mb-1 text-sm font-medium text-gray-700">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Send Reset Link
      </button>
    </form>
  );
};

export default ForgotPassword;

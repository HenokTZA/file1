import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../Services/authService';
import { toast } from 'react-toastify';
import { FiKey, FiEye, FiEyeOff, FiLoader, FiCheckCircle, FiLock } from 'react-icons/fi';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword(token, { password });
      setSuccess(response.message || 'Password reset successfully!');
      toast.success('Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional rendering for the success state
  if (success) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <FiCheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
        <p className="text-gray-600">{success}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <FiLock className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Set a New Password</h2>
        <p className="mt-2 text-sm text-gray-600">Please enter and confirm your new password below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password Field */}
        <div className="relative">
          <FiKey className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="New Password"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <FiKey className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm New Password"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {error && (
            <div className="text-center text-sm text-red-600 p-2 bg-red-50 rounded-md">
                {error}
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const ErrorAlert = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-center">
        <FiAlertCircle className="text-red-500 mr-2" />
        <div>
          <p className="text-sm text-red-700">
            {message || 'An error occurred. Please try again.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
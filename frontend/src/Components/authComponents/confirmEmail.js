import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmEmail } from '../../Services/authService'; 
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Success and error icons

const ConfirmEmail = () => {
  const { confirmationCode } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const confirmEmailAddress = async () => {
      try {
        const response = await confirmEmail(confirmationCode);
        setMessage(response.message || 'Email confirmed successfully! Redirecting to login...');
        setIsError(false);  // Reset error state on success
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
        setIsError(true); // Set error state on failure
      }
    };

    if (confirmationCode) {
      confirmEmailAddress();
    }
  }, [confirmationCode, navigate]);

  return (
    <div className={`flex items-center justify-center max-w-2xl mx-auto p-6 rounded-lg shadow-lg transition-all duration-300 
      ${isError ? 'bg-red-100 border-l-4 border-red-500 text-red-500' : 'bg-green-100 border-l-4 border-green-500 text-green-500'}`}>
      <div className="mr-4">
        {isError ? (
          <FaExclamationCircle size={40} color="red" />
        ) : (
          <FaCheckCircle size={40} color="green" />
        )}
      </div>
      <div>
        <h2 className="text-lg font-medium">{message}</h2>
      </div>
    </div>
  );
};

export default ConfirmEmail;

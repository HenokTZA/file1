// src/pages/RegisterPage.js
import React from 'react';
import LoginForm from '../../Components/authComponents/loginForm';
import RegisterImage from '../../Components/authComponents/authImage';

const RegisterPage = () => (
  <div className="flex items-center justify-center md:min-h-screen py-0 bg-gray-100">
    <div className="flex flex-col w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
    <RegisterImage 
        src="https://t3.ftcdn.net/jpg/06/59/14/28/360_F_659142858_9cvsyhGPm4Gcaw2KDqWo2BFUCLB74k9K.jpg" 
        alt="Registration"
      />
      <div className="w-full p-8 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">Login</h2>
        <LoginForm />
      </div>
    </div>
  </div>
);

export default RegisterPage;

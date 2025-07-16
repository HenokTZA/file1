// src/pages/RegisterPage.js
import React from 'react';
import RegisterForm from '../../Components/authComponents/registerForm';
import RegisterImage from '../../Components/authComponents/authImage';

const RegisterPage = () => (
  <div className="flex items-center justify-center md:min-h-screen md:py-0 pt-0 pb-0 ">
    <div className="flex flex-col w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
    <RegisterImage 
        src="https://t3.ftcdn.net/jpg/06/59/14/28/360_F_659142858_9cvsyhGPm4Gcaw2KDqWo2BFUCLB74k9K.jpg" 
        alt="Registration"
      />
      <div className="w-full p-8 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">Register Users</h2>
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default RegisterPage;

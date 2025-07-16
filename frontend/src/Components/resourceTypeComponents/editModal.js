// src/Components/common/Modal.js
import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-start pt-16 overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 my-8 transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
        >
          <FiX size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems 
}) => {
  // Show pagination only if there's more than one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-4 space-x-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
          currentPage === 1 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <FaChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>
      
      <span className="text-gray-600">
        Page {currentPage} of {totalPages} ({totalItems} items)
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <span>Next</span>
        <FaChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination; 
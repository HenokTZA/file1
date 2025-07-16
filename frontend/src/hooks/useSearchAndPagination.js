import { useState, useMemo } from 'react';

const useSearchAndPagination = (items = [], itemsPerPage = 7, searchKeys = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (!searchTerm) return items;

    return items.filter(item => 
      searchKeys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [items, searchTerm, searchKeys]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  // Ensure current page is within valid range
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  // Calculate slice indices
  const indexOfLastItem = validCurrentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Get current items
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (pageNumber) => {
    const newPage = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(newPage);
  };

  return {
    searchTerm,
    currentPage: validCurrentPage,
    currentItems,
    totalPages,
    handleSearchChange,
    handlePageChange,
    totalItems: filteredItems.length,
    itemsPerPage,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1
  };
};

export default useSearchAndPagination; 
// /components/DataGrid.js (Refactored)

import React, { useState } from 'react';

// Receive `data` and `columns` as props instead of `tasks`
const DataGrid = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState({});

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleColumnFilter = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...data];

    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filteredData = filteredData.filter(item => {
          const value = item[column];
          if (value === undefined || value === null) return false;
          if (typeof value === 'string') {
            return value.toLowerCase().includes(filterValue.toLowerCase());
          }
          return value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const valA = a[sortConfig.key] || 0; // Default undefined values to 0 for sorting
        const valB = b[sortConfig.key] || 0;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filteredData;
  };

  // Helper for rendering cell content based on column definition
  const renderCell = (item, column) => {
      const value = item[column.key];
      if (value === undefined || value === null) return <span className="text-gray-400">-</span>;

      if (column.isCurrency) {
          return `$${Number(value).toFixed(2)}`;
      }
      if (column.isNumeric) {
          return Number(value).toFixed(2);
      }
      return value;
  };

  const sortedData = getSortedAndFilteredData();

  return (
    <div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                // Responsive padding for headers
                                className={`px-3 py-3 sm:px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${column.width}`}
                                onClick={() => handleSort(column.key)}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{column.label}</span>
                                    {/* Sorting indicators */}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    className="mt-1 block w-full text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((item, index) => (
                        <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}>
                            {columns.map((column) => (
                                <td key={column.key} className={`px-3 py-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm text-gray-800 ${column.isNumeric || column.isCurrency ? 'text-right font-mono' : 'text-left'}`}>
                                    {renderCell(item, column)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length > 0 && sortedData.length === 0 && (
                <div className="text-center p-4 text-sm text-gray-500">No tasks found matching the column filters.</div>
            )}
            {data.length === 0 && (
                 <div className="text-center p-4 text-sm text-gray-500">No tasks to display.</div>
            )}
        </div>
  );
};

export default DataGrid;

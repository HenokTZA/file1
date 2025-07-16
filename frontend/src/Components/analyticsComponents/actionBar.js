// src/Components/analyticsComponents/ActionBar.js (Updated)

import React from 'react';
import Papa from 'papaparse'; // Import the library
import { FiSave, FiDownload, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';

const ActionBar = ({ 
    onAddCustomColumn,
    dataToExport,    // <-- New prop: The array of processed task objects
    columnsToExport, // <-- New prop: The array of column definitions
}) => {

  const handleExport = () => {
    if (!dataToExport || dataToExport.length === 0) {
      alert('No data available to export.');
      return;
    }

    // 1. Prepare Headers: Extract the 'label' from each column definition.
    const headers = columnsToExport.map(col => col.label);

    // 2. Prepare Data: Map the data rows to an array of values, in the same order as the headers.
    const data = dataToExport.map(row => 
        columnsToExport.map(col => {
            const value = row[col.key];
            // Format numbers and currency for consistent output
            if (col.isCurrency) return Number(value || 0).toFixed(2);
            if (col.isNumeric) return Number(value || 0).toFixed(2);
            return value;
        })
    );

    // 3. Convert to CSV using Papaparse
    const csv = Papa.unparse({
      fields: headers,
      data: data,
    });

    // 4. Create a Blob and trigger a download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
      link.setAttribute('href', url);
      link.setAttribute('download', `task_analytics_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    // Responsive button layout with icons
    <div className="flex flex-col sm:flex-row gap-2">
      <button 
        onClick={handleExport}
        className="px-3 py-2 text-sm flex items-center gap-2 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FiDownload size={16}/>
        <span className="hidden sm:inline">Export</span>
      </button>
      <button 
        onClick={onAddCustomColumn}
        className="px-3 py-2 text-sm flex items-center gap-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FiPlus size={16}/>
        <span className="hidden sm:inline">Add Column</span>
      </button>
    </div>
  );
};

export default ActionBar;
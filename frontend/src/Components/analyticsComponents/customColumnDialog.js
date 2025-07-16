
import React, { useState } from 'react';
import { FiPlusCircle,FiChevronsRight,FiBarChart2 } from 'react-icons/fi';

const CustomColumnDialog = ({ onClose, onAdd, availableColumns = [] }) => {
  const [columnName, setColumnName] = useState('');
  const [formula, setFormula] = useState('');
  const calculableFields = availableColumns.filter(
    col => col.isNumeric || col.isCurrency
  );

  // Simplified examples that use keys guaranteed to exist from our hook.
  const exampleFormulas = [
    { name: 'Cost per Minute', formula: 'totalLaborCost / totalLoggedMinutes' },
    { name: 'Cost per Hour', formula: '(totalLaborCost * 60) / totalLoggedMinutes' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (columnName && formula) {
      // The key for the new column will be a sanitized version of its name
      const key = columnName.replace(/\s+/g, '_').toLowerCase();
      onAdd({ name: columnName, key: key, formula });
    }
  };

  const insertField = (fieldKey) => {
    setFormula(prev => prev ? `${prev} ${fieldKey}` : fieldKey);
  };

  const applyExample = (example) => {
    setColumnName(example.name);
    setFormula(example.formula);
  };

  return (
    // The fixed overlay that covers the screen
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      
      {/* --- RESPONSIVE DIALOG CONTAINER --- */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col"
        // Prevent clicks inside the dialog from closing it
        onClick={e => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
            <FiPlusCircle className="mr-3 text-blue-500"/>
            Add Custom Column
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600 p-1 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* --- FORM & CONTENT (with vertical scrolling) --- */}
        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            
            {/* Column Name Input */}
            <div>
              <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
              <input
                id="columnName"
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Profit per Task"
                required
              />
            </div>

            {/* Formula Textarea */}
            <div>
              <label htmlFor="formula" className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
              <textarea
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="e.g., totalLaborCost + totalResourceCost"
                rows="3"
                required
              />
            </div>

            {/* Available Fields Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiBarChart2 />
                Available Fields (click to insert)
              </label>
              <div className="flex flex-wrap gap-2">
                {calculableFields.map(field => (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => insertField(field.key)}
                    className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-full bg-white hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700 transition-colors"
                    title={`Click to add '${field.key}' to formula`}
                  >
                    {field.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Example Formulas Section */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiChevronsRight/>
                Example Formulas
              </label>
              {/* Responsive grid for examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exampleFormulas.map((example, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => applyExample(example)}>
                    <p className="font-medium text-sm text-gray-800">{example.name}</p>
                    <p className="text-xs text-gray-600 font-mono bg-gray-200 p-2 rounded mt-1 break-all">{example.formula}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        
        {/* --- FOOTER with buttons --- */}
        <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {/* Responsive button layout */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit} // Can also be tied directly to the button
                disabled={!columnName || !formula}
                className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Column
              </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CustomColumnDialog;
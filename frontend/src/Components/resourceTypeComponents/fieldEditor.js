
import React from 'react';
import { 
  FiSquare, FiTrash2, FiChevronDown, FiHash, FiTag, FiList, FiCode, 
  FiCheckCircle, FiTrendingUp, FiDollarSign, FiArchive 
} from 'react-icons/fi';

const FieldEditor = ({ index, field, onUpdate, onRemove, resourceType }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    const updatedField = { ...field, [name]: finalValue };

    if (name === 'isQuantifiable' && !checked) {
      updatedField.quantifiableUnit = '';
      updatedField.quantifiableCategory = 'other';
    }

    onUpdate(index, updatedField);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 flex items-center">
            <FiSquare className="mr-3 text-blue-500" />
            Field: <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{field.displayName || field.fieldName || `(New Field)`}</span>
          </h3>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
            aria-label="Remove field"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
  
        {/* --- CORE FIELDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Field Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
              <FiHash className="mr-1.5 text-gray-400" />Field Name*
            </label>
            <input
              type="text" name="fieldName" value={field.fieldName} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., 'unitCost' (no spaces)" required
            />
          </div>
  
          {/* Display Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
              <FiTag className="mr-1.5 text-gray-400" />Display Name
            </label>
            <input
              type="text" name="displayName" value={field.displayName} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., 'Unit Cost'"
            />
          </div>
  
          {/* Field Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
              <FiList className="mr-1.5 text-gray-400" />Field Type*
            </label>
            <div className="relative">
              <select name="fieldType" value={field.fieldType} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
              >
                <option value="string">Text (String)</option>
                <option value="number">Number</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Default Value */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
              <FiCode className="mr-1.5 text-gray-400" />Default Value
            </label>
            <input
              type={field.fieldType === 'number' ? 'number' : 'text'}
              name="defaultValue" value={field.defaultValue || ''} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              step={field.fieldType === 'number' ? 'any' : undefined}
            />
          </div>
        </div>
      </div>

      {/* --- ADVANCED & QUANTIFIABLE OPTIONS --- */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-4 rounded-b-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            {/* Required Toggle */}
            <div className="flex items-center pt-1.5">
              <input type="checkbox" id={`required-${index}`} name="required"
                checked={!!field.required} onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`required-${index}`} className="ml-2 text-sm font-medium text-gray-800 flex items-center">
                <FiCheckCircle className="mr-1.5 text-gray-400" />Required
              </label>
            </div>

            {/* Quantifiable Toggle */}
            <div className="flex items-center pt-1.5 md:col-span-2">
                <input type="checkbox" id={`isQuantifiable-${index}`} name="isQuantifiable"
                    checked={!!field.isQuantifiable} onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`isQuantifiable-${index}`} className="ml-2 text-sm font-medium text-gray-800 flex items-center">
                    <FiTrendingUp className="mr-1.5 text-gray-400" />Is Quantifiable?
                </label>
            </div>
        </div>

        {/* --- CONDITIONAL QUANTIFIABLE FIELDS --- */}
        {field.isQuantifiable && (
          <div className="mt-4 pt-4 border-t border-dashed border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Quantifiable Unit */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FiDollarSign className="mr-1.5 text-gray-400" />Unit*
              </label>
              <input
                type="text" name="quantifiableUnit" value={field.quantifiableUnit || ''} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., USD, hours, kg" required
              />
            </div>

            {/* Quantifiable Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                <FiArchive className="mr-1.5 text-gray-400" />Category
              </label>
              <div className="relative">
                <select name="quantifiableCategory" value={field.quantifiableCategory || 'other'} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                >
                  <option value="cost">Cost</option>
                  <option value="time">Time</option>
                  <option value="capacity">Capacity</option>
                  <option value="output">Output</option>
                  <option value="measurement">Measurement</option>
                  <option value="other">Other</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldEditor;
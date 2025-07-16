
import Select from 'react-select';
import React, { useState } from 'react';

const getSelectedOptions = (items, options) => {
 
  if (!items || items.length === 0) return []; // Handle undefined/null/empty cases

  return items.map(item => {
    const id = typeof item === "object" ? item._id || item.id : item; // Extract ID if it's an object
    return options.find(option => option.value === id) || null; // Find option in dropdown options
  }).filter(option => option !== null); // Remove nulls
};
const SelectInput = ({ label, name, value = [], onChange, options = [], isMulti = false }) => {
 
  // Convert value to option objects for react-select
  const selectedOptions = isMulti
    ? options.filter(opt => value.includes(opt.value))
    : options.find(opt => opt.value === value) || null;

  const handleSelectChange = (selected) => {
    const newValue = isMulti
      ? (selected || []).map(opt => opt.value)
      : selected?.value || null;

    // Create synthetic event to match your handleChange expectations
    onChange({
      target: {
        name,
        value: newValue
      }
    });
  };

  return (
    <div className="w-full px-2">
      <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
      <Select
        name={name}
        value={selectedOptions}
        onChange={handleSelectChange}
        options={options}
        isClearable
        isSearchable
        placeholder={`Select ${label}`}
        isMulti={isMulti}
        className="w-full"
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: 'rgb(249 250 251)',
            padding: '4px 8px',
            borderColor: 'rgb(209 213 219)',
            minHeight: '40px'
          }),
          placeholder: (base) => ({ ...base, color: 'rgb(107 114 128)' }),
        }}
      />
    </div>
  );
};




// Options for time period (days, weeks, months, years)
const periodOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];
  
  // Validation function for task period
  const validateTaskPeriod = (number, period) => {
    if (!number || isNaN(number) || number <= 0) {
      return { valid: false, error: "Please enter a valid number." };
    }
  
    if (!period) {
      return { valid: false, error: "Please select a time period (day, week, month, year)." };
    }
  
    return { valid: true };
  };
  
  const SelectTaskPeriodInput = ({ label, name, value = "", onChange, required = false }) => {
    const [numberValue, setNumberValue] = useState(value ? value.split(' ')[0] : ''); // Extract number from string
    const [periodValue, setPeriodValue] = useState(value ? value.split(' ')[1] : ''); // Extract period from string
    const [error, setError] = useState('');
  
    // Handle changes in the number field
    const handleNumberChange = (e) => {
      const newNumber = e.target.value;
      setNumberValue(newNumber);
  
      const validationResult = validateTaskPeriod(newNumber, periodValue);
      if (validationResult.valid) {
        setError("");
      } else {
        setError(validationResult.error);
      }
  
      // Combine number and period into one string and send
      const combinedValue = `${newNumber} ${periodValue}`;
      onChange({ target: { name, value: combinedValue } });
    };
  
    // Handle changes in the period selector (day, week, month, year)
    const handlePeriodChange = (selectedOption) => {
      const newPeriod = selectedOption ? selectedOption.value : '';
      setPeriodValue(newPeriod);
  
      const validationResult = validateTaskPeriod(numberValue, newPeriod);
      if (validationResult.valid) {
        setError("");
      } else {
        setError(validationResult.error);
      }
  
      // Combine number and period into one string and send
      const combinedValue = `${numberValue} ${newPeriod}`;
      onChange({ target: { name, value: combinedValue } });
    };
  
    return (
        <div className="w-full px-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
          
          {/* Flex container to hold both inputs horizontally */}
          <div className="flex items-center space-x-1">
            {/* Number Input for task period */}
            <input
              type="number"
              value={numberValue}
              onChange={handleNumberChange}
              placeholder="time"
              className="md:w-1/3 w-1/2 py-2 px-2 border border-gray-300 rounded"
            />
      
            {/* Select Input for period (day, week, month, year) */}
            <Select
              name={`${name}-period`}
              value={periodValue ? periodOptions.find(option => option.value === periodValue) : null}
              onChange={handlePeriodChange}
              options={periodOptions}
              isClearable
              placeholder="period"
              className="md:w-2/3 w-1/2"  // Adjust the width proportionally
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: 'rgb(249 250 251)',
                  padding: '2px 2px',
                  borderColor: 'rgb(209 213 219)',
                }),
                placeholder: (base) => ({ ...base, color: 'rgb(107 114 128)' }),
              }}
            />
          </div>
      
          {/* Display error message if the input is invalid */}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      );
      
  };
  

export { SelectTaskPeriodInput,getSelectedOptions, SelectInput };

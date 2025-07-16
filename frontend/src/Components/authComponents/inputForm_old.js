

import React from 'react';
import PropTypes from 'prop-types';

const FormInput = ({ label, name, type, value, onChange, required, options, checked }) => (
  <div className="mb-4">
    {type === 'checkbox' ? (
      <div className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-600">{label}</label>
      </div>
    ) : options ? (
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required={required}
        >
          <option value="" disabled>Select {label}</option>
          {options.map(({ value, description }) => (
            <option key={value} value={value}>
              {description}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          required={required}
        />
      </div>
    )}
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ),
  checked: PropTypes.bool,
};

export default FormInput;

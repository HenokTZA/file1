

// import React from 'react';
// import PropTypes from 'prop-types';

// const FormInput = ({ label, name, type, value, onChange, required, options, checked }) => (
//   <div className="mb-4">
//     {type === 'checkbox' ? (
//       <div className="flex items-center">
//         <input
//           type="checkbox"
//           name={name}
//           checked={checked}
//           onChange={onChange}
//           className="mr-2"
//         />
//         <label className="text-sm font-medium text-gray-600">{label}</label>
//       </div>
//     ) : options ? (
//       <div>
//         <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
//         <select
//           name={name}
//           value={value}
//           onChange={onChange}
//           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//           required={required}
//         >
//           <option value="" disabled>Select {label}</option>
//           {options.map(({ value, description }) => (
//             <option key={value} value={value}>
//               {description}
//             </option>
//           ))}
//         </select>
//       </div>
//     ) : (
//       <div>
//         <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
//         <input
//           type={type}
//           name={name}
//           value={value}
//           onChange={onChange}
//           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
//           required={required}
//         />
//       </div>
//     )}
//   </div>
// );

// FormInput.propTypes = {
//   label: PropTypes.string.isRequired,
//   name: PropTypes.string.isRequired,
//   type: PropTypes.string.isRequired,
//   value: PropTypes.string,
//   onChange: PropTypes.func.isRequired,
//   required: PropTypes.bool,
//   options: PropTypes.arrayOf(
//     PropTypes.shape({
//       value: PropTypes.string.isRequired,
//       description: PropTypes.string.isRequired,
//     })
//   ),
//   checked: PropTypes.bool,
// };

// export default FormInput;
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const FormInput = ({ label, name, type, value, onChange, required, options, checked, error, isPassword, onToggleVisibility,  autocomplete,...props }) => {
  // +++ Define base and conditional classes for styling +++
  const baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring";
  const errorClasses = "border-red-500 focus:ring-red-300";
  const defaultClasses = "focus:ring-blue-300";
  
  const passwordPadding = isPassword ? 'pr-10' : '';
  const inputClasses = `${baseClasses} ${passwordPadding} ${error ? errorClasses : defaultClasses}`;

  return (
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
            className={inputClasses} // +++ Use dynamic classes
            required={required}
            {...props}
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
          {/* +++ Wrap the input and icon in a relative container +++ */}
          <div className="relative">
            <input
              type={type} 
              name={name}
              value={value}
              onChange={onChange}
              className={inputClasses}
              required={required}
              autoComplete={autocomplete} 
              {...props}
            />
            {/* +++ Render the icon button if it's a password field +++ */}
            {isPassword && (
              <button
                type="button" // Important to prevent form submission
                onClick={onToggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={type === 'password' ? 'Show password' : 'Hide password'}
              >
                {type === 'password' ? <FiEye /> : <FiEyeOff />}
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow number for rate fields
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Allow number for access level
      description: PropTypes.string.isRequired,
    })
  ),
  checked: PropTypes.bool,
  error: PropTypes.string, 
  isPassword: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  autocomplete: PropTypes.string,
};

// +++ It's good practice to add defaultProps for non-required props +++
FormInput.defaultProps = {
  value: '',
  required: false,
  options: null,
  checked: false,
  error: null,
  isPassword: false,
  onToggleVisibility: () => {},
  autocomplete: 'on',
};

export default FormInput;

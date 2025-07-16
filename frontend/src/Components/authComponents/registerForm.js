import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { registerUsers } from '../../features/authSlice';
import FormInput from './inputForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
const validate = (name, value, formData) => {
  switch (name) {
    case 'first_name':
    case 'last_name':
      return value.trim() === '' ? 'This field is required.' : '';
    case 'email':
      if (!value) return 'Email is required.';
      if (!/\S+@\S+\.\S+/.test(value)) return 'Please provide a valid email address.';
      return '';
    case 'password':
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value)) {
        return 'Password needs uppercase, lowercase, number, and special character.';
      }
      return '';
    case 'confirmPassword':
      if (!value) return 'Please confirm your password.';
      if (value !== formData.password) return 'Passwords do not match.';
      return '';
    case 'payroll.rate':
      // Rate is optional, but if entered, it must be a valid number
      if (value && isNaN(parseFloat(value))) return 'Rate must be a number.';
      return '';
    default:
      return '';
  }
};
const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialFormData = {
    email: '', password: '', first_name: '', last_name: '', personal_number: '', access_level: 1,
    payroll: { rate_type: 'hourly', rate: '', currency: 'USD', overtime_multiplier: '1.5' }
  };
  
  const [formData, setFormData] = useState(initialFormData);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [confirmationMessage, setConfirmationMessage] = useState('');
  useEffect(() => {
    setFormData(initialFormData);
    setConfirmPassword('');
    setErrors({});
  }, []); 
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData }; // Create a copy to work with

    if (name.startsWith('payroll.')) {
      const payrollField = name.split('.')[1];
      newFormData = { ...newFormData, payroll: { ...newFormData.payroll, [payrollField]: value }};
      setFormData(newFormData);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      newFormData = { ...newFormData, [name]: value };
      setFormData(newFormData);
    }

    // Perform real-time validation
    const currentFormData = name === 'password' ? { ...newFormData, password: value } : newFormData;
    const error = validate(name, value, currentFormData);
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));

    // If the password field is being changed, we must also re-validate the confirmPassword field
    if (name === 'password') {
      const confirmError = validate('confirmPassword', confirmPassword, currentFormData);
      setErrors(prevErrors => ({ ...prevErrors, confirmPassword: confirmError }));
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //      // +++ Final validation check before submitting +++
  //      const formErrors = {};
  //   Object.keys(formData).forEach(key => {
  //       if (key !== 'payroll' && key !== 'personal_number' && key !== 'access_level') { 
  //            const error = validate(key, formData[key], formData);
  //            if (error) formErrors[key] = error;
  //       }
  //   });
  //   const confirmPasswordError = validate('confirmPassword', confirmPassword, formData);
  //   if(confirmPasswordError) formErrors.confirmPassword = confirmPasswordError;

  //   setErrors(formErrors);
    
  //   if (Object.keys(formErrors).length > 0) {
  //       toast.error("Please fix the errors before submitting.");
  //       return;
  //   }
  //   try {
  //     const resultAction = await dispatch(registerUsers(formData));
      
  //     if (registerUsers.fulfilled.match(resultAction)) {
  //       toast.success('User registered successfully!');
  //       setFormData({
  //         email: '', password: '', first_name: '', last_name: '', personal_number: '', access_level: 1,
  //         payroll: { rate_type: 'hourly', rate: '', currency: 'USD', overtime_multiplier: '1.5' }
  //       });
  //       setConfirmPassword(''); // Reset confirm password
  //       navigate('/home');
  //     } else if (registerUsers.rejected.match(resultAction)) {
  //       const error = resultAction.payload;
        
  //       if (error.code === 'USER_LIMIT_REACHED') {
  //         toast.error(
  //           <div className="p-4">
  //             <p className="font-medium">{error.message}</p>
  //             <p className="my-2">
  //               Current: {error.details?.currentCount || 'N/A'}/
  //               {error.details?.maxAllowed || 'N/A'} users
  //             </p>
  //             {error.details?.upgradeAvailable && (
  //               <div className="mt-3">
  //                 <Link 
  //                   to={error.actions?.[0]?.url || '/subscription'} 
  //                   className="text-blue-600 hover:text-blue-800 font-medium underline"
  //                   onClick={() => toast.dismiss()}
  //                 >
  //                   {error.actions?.[0]?.label || 'Upgrade subscription'}
  //                 </Link>
  //               </div>
  //             )}
  //           </div>,
  //           {
  //             position: "top-right",
  //             autoClose: false,
  //             className: 'border-l-4 border-red-500'
  //           }
  //         );
  //       } else {
  //         toast.error(error.message || 'Registration failed');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error:', error);
  //     toast.error('An unexpected error occurred');
  //   }
  // };
   // --- THIS IS THE MAIN AREA OF CHANGE ---
   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check (this part is perfect, no changes needed)
    const formErrors = {};
    Object.keys(formData).forEach(key => {
        if (key !== 'payroll' && key !== 'personal_number' && key !== 'access_level') { 
             const error = validate(key, formData[key], formData);
             if (error) formErrors[key] = error;
        }
    });
    const confirmPasswordError = validate('confirmPassword', confirmPassword, formData);
    if(confirmPasswordError) formErrors.confirmPassword = confirmPasswordError;
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
        toast.error("Please fix the errors before submitting.");
        return;
    }

    try {
      const resultAction = await dispatch(registerUsers(formData));
      
      if (registerUsers.fulfilled.match(resultAction)) {
        
        toast.success('User registered successfully!');
        
        setFormData(initialFormData);
        setConfirmPassword('');
        setErrors({});
        navigate('/user'); 
      } else if (registerUsers.rejected.match(resultAction)) {
        const error = resultAction.payload;
      
                if (error.code === 'USER_LIMIT_REACHED') {
          
                    toast.error(
                      <div className="p-4">
                        <p className="font-medium">{error.message}</p>
                        <p className="my-2">
                          Current: {error.details?.currentCount || 'N/A'}/
                          {error.details?.maxAllowed || 'N/A'} users
                        </p>
                        {error.details?.upgradeAvailable && (
                          <div className="mt-3">
                            <Link 
                              to={error.actions?.[0]?.url || '/subscription'} 
                              className="text-blue-600 hover:text-blue-800 font-medium underline"
                              onClick={() => toast.dismiss()}
                            >
                              {error.actions?.[0]?.label || 'Upgrade subscription'}
                            </Link>
                          </div>
                        )}
                      </div>,
                      {
                        position: "top-right",
                        autoClose: false,
                        className: 'border-l-4 border-red-500'
                      }
                    );
        } else {
          // This will now display any other error, like "User with this email already exists"
          toast.error(`Registration Failed: ${error.message || 'Please check the details and try again.'}`);
        }
              }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

   // +++ Memoize the form validity check +++
   const isFormValid = useCallback(() => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !confirmPassword) {
        return false;
    }
    // Check if there are any error messages
    return !Object.values(errors).some(error => error !== '');
 }, [formData, confirmPassword, errors]);

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
   <FormInput label="First Name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} required error={errors.first_name} autoComplete="off" />
      <FormInput label="Last Name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} required error={errors.last_name} autoComplete="off" />
      
      {/* Tell the browser this is an email but don't autofill it in this context */}
      <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required error={errors.email} autoComplete="off" />
      
      {/* Use "new-password" to signal this is for registration, which most modern browsers respect */}
      <FormInput
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        error={errors.password}
        isPassword={true}
        type={showPassword ? 'text' : 'password'}
        onToggleVisibility={() => setShowPassword(!showPassword)}
        autoComplete="new-password"
      />
    {/* +++ UPDATED: Password requirements text now matches backend +++ */}
    <div className="text-sm text-gray-600 pl-1 mt-6">
        <p className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>✓ At least 8 characters</p>
        <p className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>✓ One uppercase letter</p>
        <p className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>✓ One lowercase letter</p>
        <p className={/(?=.*[0-9])/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>✓ One number</p>
        <p className={/(?=.*[!@#$%^&*])/.test(formData.password) ? 'text-green-600' : 'text-gray-600'}>✓ One special character (!@#$%^&*)</p>
    </div>

    <FormInput
        label="Confirm Password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={handleChange}
        required
        error={errors.confirmPassword}
        // +++ Add visibility toggle props +++
        isPassword={true}
        type={showConfirmPassword ? 'text' : 'password'}
        onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
        autoComplete="new-password"
      />
    <FormInput label="Personal Number" name="personal_number" type="text" value={formData.personal_number} onChange={handleChange} />
   
    <FormInput
      label="Access Level"
      name="access_level"
      type="select"
      value={formData.access_level}
      onChange={handleChange}
      required
      options={[
        { value: 1, description: '1 - Random User' },
        { value: 2, description: '2 - Service Personnel' },
        { value: 3, description: '3 - Manager' },
        { value: 4, description: '4 - Free' },
      ]}
    />
        {/* +++ ADDED PAYROLL SECTION +++ */}
        <fieldset className="border border-gray-300 p-4 rounded-lg">
        <legend className="text-sm font-medium text-gray-700 px-2">Payroll Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
                label="Rate Type"
                name="payroll.rate_type" // Use dot notation for nested fields
                type="select"
                value={formData.payroll.rate_type}
                onChange={handleChange}
                options={[
                    { value: 'hourly', description: 'Hourly' },
                    { value: 'salaried', description: 'Salaried' },
                    { value: 'project', description: 'Per Project' },
                ]}
            />
            <FormInput
                label="Rate"
                name="payroll.rate"
                type="number"
                value={formData.payroll.rate}
                onChange={handleChange}
                placeholder="e.g., 25.50"
            />
            <FormInput
                label="Currency"
                name="payroll.currency"
                type="text"
                value={formData.payroll.currency}
                onChange={handleChange}
                placeholder="e.g., USD"
            />
             <FormInput
                label="Overtime Multiplier"
                name="payroll.overtime_multiplier"
                type="number"
                step="0.1"
                value={formData.payroll.overtime_multiplier}
                onChange={handleChange}
            />
        </div>
      </fieldset>
      
      {/* {errors && <p className="text-red-500">{errors}</p>} */}
      {confirmationMessage && <p className="text-green-500">{confirmationMessage}</p>}

      <button
        disabled={!isFormValid()}
        type="submit"
        // FIX #3: ADDED BACK THE DISABLED STYLES FOR BETTER UI FEEDBACK
        className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;

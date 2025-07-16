
import React, { useState, useEffect } from 'react';

const UserForm = ({ onSubmit, user, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    access_level: '',
  });

  // Populate form data when editing a user
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        access_level: user.access_level || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass updated form data back to the parent
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name Field */}
      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Last Name Field */}
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Role Dropdown */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Access Level
        </label>
        <select
          id="access_level"
          name="access_level"
          value={formData.access_level}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        >
          <option value="">Select Role</option>
          <option value="1">1 - Random</option>
          <option value="2">2 - Service Personnel </option>
          <option value="3">3 - Manager</option>
          <option value="4">4 - Free</option>
          <option value="5">5 - Admin</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default UserForm;

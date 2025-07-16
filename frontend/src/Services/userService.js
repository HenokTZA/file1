import axios from 'axios';

// The base URL for the user-related API endpoints
const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/users`;

/**
 * Fetches all users. Typically an admin-only action.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 */
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    // Throw a more specific error message from the API if available
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

/**
 * Fetches a single user by their ID.
 * @param {string} userId - The ID of the user to fetch.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Object>} A promise that resolves to the user object.
 */
export const getUser = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

/**
 * Updates a user's own profile. This should be called when a user is editing themselves.
 * @param {string} userId - The ID of the user to update (should match the logged-in user).
 * @param {Object} updateData - The data to update.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Object>} A promise that resolves to the updated user object.
 */
export const updateUserProfile = async (userId, updateData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

/**
 * Updates any user's profile. This should be called from an admin panel.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} updateData - The data to update.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Object>} A promise that resolves to the updated user object.
 */
export const adminUpdateUser = async (userId, updateData, token) => {
  try {
    // Note the '/admin' suffix in the URL, matching your backend route
    const response = await axios.put(`${API_URL}/${userId}/admin`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform admin update');
  }
};

/**
 * Deletes a user account. Can be used by an admin to delete another user,
 * or by a user to delete their own account. The backend handles authorization.
 * @param {string} userId - The ID of the user to delete.
 * @param {string} token - The authentication token for the request.
 * @returns {Promise<Object>} A promise that resolves to the API's success message.
 */
export const deleteUserAccount = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

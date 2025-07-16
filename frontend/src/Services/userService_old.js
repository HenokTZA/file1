import axios from 'axios';


const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/users`;


export const getAllUsers = async (token) => {
  try {
   
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
   
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

export const getUser = async (userId, token) => {
  try {
    
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch user');
  }
};

export const updateUserProfile = async (userId, updateData, token) => {
  try {
   
      const response = await axios.put(`${API_URL}/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

           return response.data.data;
   
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update user');
  }
};

export const adminUpdateUser = async (userId, updateData, token) => {
  try {
    
      const response = await axios.put(`${API_URL}/${userId}/admin`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

           return response.data.data;
    
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to admin update user');
  }
};

export const deleteUserAccount= async (userId, token) => {
  try {
    
      const response = await axios.delete(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

        return response.data;
   
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete user');
  }
};


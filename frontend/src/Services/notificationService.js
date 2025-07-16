// src/Services/notificationService.js
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/notifications`;

const notificationService = {
  getNotifications: async (token) => {
    const response = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  markAsRead: async (ids, token) => {
    const response = await axios.patch(`${API_URL}/read`, { ids }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};

export default notificationService;

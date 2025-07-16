// services/calendarService.js
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/tasks`;

const calendarService = {
  /**
   * Import calendar from iCal URL
   * @param {string} url - iCal feed URL
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Import result
   */
  importCalendar: async (url, token) => {
    const res = await axios.post(
      `${API_URL}/import`,
      { url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  },
};

export default calendarService;

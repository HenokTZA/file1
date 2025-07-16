
// import axios from 'axios';

// // The API URL should point to your new reporting endpoint
// const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/tasks/report-data`;

// const analyticsService = {
//   /**
//    * Fetches the complete dataset for the analytics report from a single endpoint.
//    * @param {object} filters - An object containing filter parameters.
//    * @param {string} token - The user's authentication token.
//    * @returns {Promise<object>} A promise that resolves to the object containing all raw data arrays.
//    */
//   getAnalyticsData: async (filters, token) => {
//     try {
//       const response = await axios.get(API_URL, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: filters // Axios handles query string conversion
//       });
      
//       return response.data.data; 

//     } catch (error) {
//       // Re-throw a standardized error object for the slice to handle
//       throw error.response?.data || { message: error.message };
//     }
//   },
// };

// export default analyticsService;

// src/services/analyticsService.js

import axios from 'axios';
// --- THIS IS THE FIX ---
// Import the 'qs' library after installing it.
import qs from 'qs';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/tasks/report-data`;

const analyticsService = {
  getAnalyticsData: async (filters, token) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        // This ensures arrays are sent as, e.g., userIds=id1&userIds=id2
        // which is a common format for Express servers.
        paramsSerializer: params => {
            // Now 'qs' is correctly defined and can be used.
            return qs.stringify(params, { arrayFormat: 'repeat' });
        }
      });
      return response.data.data; 
    } catch (error) {
      // Re-throw a standardized error object for the slice/thunk to handle
      throw error.response?.data || { message: error.message };
    }
  },
};

export default analyticsService;
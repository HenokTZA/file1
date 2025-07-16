
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/tasks`;

const taskService = {
 
  /**
   * Create a new task
   * @param {Object} taskData - Task data to create
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Created task
   */
  createTask: async (taskData, token) => {
    try {
      // Transform and validate data before sending
      const formattedData = {
        ...taskData,
        schedule: {
          start: taskData.start_time,
          end: taskData.end_time,
          timezone: taskData.timezone || 'UTC'
        },
        // Convert status to valid enum value
        status: taskData.status === 'in progress' ? 'in_progress' : taskData.status,
        resources: taskData.resources ? Object.entries(taskData.resources).flatMap(
          ([resourceId, resourceIds]) => resourceIds.map(id => ({
            resource: id,
            relationshipType: 'requires', // or whatever default you need
            required: false // or true if required
          }))
        ) : [],
        // Remove old fields
        start_time: undefined,
        end_time: undefined
      };
  
      // Additional validation
      if (!formattedData.title) {
        throw { message: 'Title is required', statusCode: 400 };
      }
  
      const response = await axios.post(API_URL, formattedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  /**
   * Get a task by ID
   * @param {string} taskId - Task ID
   * @param {string} organizationId - Organization ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Task data
   */
  getTaskById: async (taskId, organizationId, token) => {
    try {
      const response = await axios.get(`${API_URL}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { organizationId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
 fetchImageMetadata: async (fileIds, token) => {
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error("Invalid fileIds array");
    }
  
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/tasks/images/bulk?fileIds=${fileIds.join(',')}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("✅ Fetched metadata:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("❌ Error fetching image metadata:", error.message);
      throw error;
    }
  },
  
  
  fetchImageFile: async (fileId, token, signal) => {
    const response = await axios.get(`${API_URL}/image/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
      signal // Pass the AbortSignal
    });
    return {
      fileId,
      blob: response.data,
      contentType: response.headers['content-type']
    };
  },
  
  /**
   * Update a task
   * @param {string} taskId - Task ID to update
   * @param {Object} updateData - Data to update
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated task
   */
  updateTask: async (taskId, updateData, token) => {

    try {
      const response = await axios.put(`${API_URL}/${taskId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete a task
   * @param {string} taskId - Task ID to delete
   * @param {string} organizationId - Organization ID
   * @param {string} token - Auth token
   * @returns {Promise<boolean>} True if successful
   */

  deleteTask: async (taskId, token) => {
    try {
      await axios.delete(`${API_URL}/${taskId}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
        // No need for organizationId in params since backend gets it from token
      });
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  /**
   * Get tasks by organization
   * @param {string} organizationId - Organization ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Tasks and pagination data
   */
  getOrganizationTasks: async ({ page = 1, limit = 10 }, token) => {
    try {
      const response = await axios.get(`${API_URL}`, { // Note: No organizationId in URL
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
 filterTasks : async (filters = {}, token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
  
      // Always use POST with the filters in the request body
      const response = await axios.post(`${API_URL}/filter`, filters, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getAllDoneTasks: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/done/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getDoneTasksForUser: async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/done/user`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getTasksByAssignedUser: async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}/assigned/user`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  /**
   * Change task status
   * @param {string} taskId - Task ID
   * @param {string} newStatus - New status
   * @param {string} changedBy - User ID who changed status
   * @param {string} notes - Change notes
   * @param {string} organizationId - Organization ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated task
   */
  changeTaskStatus: async (taskId, newStatus, changedBy, notes, organizationId, token) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${taskId}/status`,
        { newStatus, changedBy, notes, organizationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default taskService;
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/team`;

const teamService = {
  /**
   * Create a new team
   * @param {Object} teamData - Team data to create
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Created team
   */
  createTeam: async (teamData, token) => {
    try {
      const response = await axios.post(API_URL, teamData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get team by ID
   * @param {string} teamId - Team ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Team data
   */
  getTeamById: async (teamId, token) => {
    try {
      const response = await axios.get(`${API_URL}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all teams for organization
   * @param {string} token - Auth token
   * @param {Object} params - Pagination and search params
   * @returns {Promise<Array>} List of teams
   */
  getTeamsByOrganization: async (token, params = {}) => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update team
   * @param {string} teamId - Team ID
   * @param {Object} updateData - Data to update
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated team
   */
  updateTeam: async (teamId, updateData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${teamId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete team
   * @param {string} teamId - Team ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Success message
   */
  deleteTeam: async (teamId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Add member to team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID to add
   * @param {string} role - Member role
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated team
   */
  addTeamMember: async (teamId, userId, role, token) => {
    try {
      const response = await axios.post(`${API_URL}/${teamId}/members`, {
        userId,
        role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Remove member from team
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID to remove
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated team
   */
  removeTeamMember: async (teamId, userId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/${teamId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update member role
   * @param {string} teamId - Team ID
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Updated team
   */
  updateMemberRole: async (teamId, userId, role, token) => {
    try {
      const response = await axios.patch(`${API_URL}/${teamId}/members/${userId}/role`, {
        role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default teamService;
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/resource-types`;

const resourceTypeService = {
  createResourceType: async (resourceTypeData, token) => {
    try {
   
        const response = await axios.post(API_URL, resourceTypeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        

        return response.data.data;

    } catch (error) {
      throw error;
    }
  },

  fetchResourceTypes: async (token) => {
    try {
     
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        
        return response.data;
     
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateResourceType: async (id, updatedData, token) => {
    try {
      
        const response = await axios.put(`${API_URL}/${id}`, updatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data;
      
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteResourceType: async (id, token) => {
    try {
      
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return id;
      
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default resourceTypeService;
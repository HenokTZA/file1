import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire';
import resourceTypeService from '../Services/resourceTypeService';

// Async Thunks using the service layer
export const createResourceType = createAsyncThunk(
  'resourceTypes/createResourceType',
  async (resourceTypeData, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      return await resourceTypeService.createResourceType(resourceTypeData, token);
    } catch (error) {
      
      if (error.response?.status === 403 && error.response.data?.error?.code === 'RESOURCE_LIMIT_REACHED') {
        return rejectWithValue({
          ...error.response.data.error,
          limitReached: true // Adding for backward compatibility
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Error creating resource type'
      });
    }
  }
);
export const fetchResourceTypes = createAsyncThunk(
  'resourceTypes/fetchResourceTypes',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      return await resourceTypeService.fetchResourceTypes(token);
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching resource types');
    }
  }
);

export const updateResourceType = createAsyncThunk(
  'resourceTypes/updateResourceType',
  async ({ id, updatedData }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      return await resourceTypeService.updateResourceType(id, updatedData, token);
    } catch (error) {
      return rejectWithValue(error.message || 'Error updating resource type');
    }
  }
);

export const deleteResourceType = createAsyncThunk(
  'resourceTypes/deleteResourceType',
  async (id, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      await resourceTypeService.deleteResourceType(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Error deleting resource type');
    }
  }
);

const resourceTypeSlice = createSlice({
  name: 'resourceTypes',
  initialState: {
    resourceTypes: [],
    status: 'idle',
    loading: false,
    error: null,
    lastSocketUpdate: null
  },
  reducers: {
    // Add this new reducer for socket updates
   
    addResourceTypeFromSocket: (state, action) => {
      const newResourceType = action.payload;
      // Check if resource type already exists
      const exists = state.resourceTypes.some(rt => rt._id === newResourceType._id);
      if (!exists) {
        // Create new array reference to ensure React detects the change
        state.resourceTypes = [...state.resourceTypes, newResourceType];
        state.lastSocketUpdate = new Date().toISOString();
      }
    },
    // Keep your existing reducers
    resourceTypeAdded: (state, action) => {
      state.resourceTypes.push(action.payload);
    },
    resourceTypeUpdated: (state, action) => {
      const index = state.resourceTypes.findIndex(
        rt => rt._id === action.payload._id
      );
      if (index !== -1) {
        state.resourceTypes[index] = action.payload;
      }
    },
    resourceTypeDeleted: (state, action) => {
      state.resourceTypes = state.resourceTypes.filter(
        rt => rt._id !== action.payload
      );
    },
    resetResourceTypeState: (state) => {
      state.resourceTypes = [];
      state.status = 'idle';
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Resource Type
      .addCase(createResourceType.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(createResourceType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        if (action.payload) {
          const exists = state.resourceTypes.some(rt => rt._id === action.payload._id);
          if (!exists) {
            state.resourceTypes.push(action.payload);
          }
        }
      })
      .addCase(createResourceType.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Resource Types
      .addCase(fetchResourceTypes.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        // Merge with existing resource types, avoiding duplicates
        const newResourceTypes = action.payload.data || [];
        const existingIds = new Set(state.resourceTypes.map(rt => rt._id));
        const uniqueNewTypes = newResourceTypes.filter(
          rt => !existingIds.has(rt._id)
        );
        state.resourceTypes = [...state.resourceTypes, ...uniqueNewTypes];
      })
      .addCase(fetchResourceTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Resource Type
      .addCase(updateResourceType.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResourceType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        const { id, updatedData } = action.meta.arg;
        const index = state.resourceTypes.findIndex(rt => rt._id === id);
      
        if (index !== -1) {
             state.resourceTypes[index] = {
            ...state.resourceTypes[index],
            ...updatedData
          };
        }
      })
      .addCase(updateResourceType.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
     
       .addCase(deleteResourceType.pending, (state) => {
         state.status = 'loading'; 
      })
      .addCase(deleteResourceType.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resourceTypes = state.resourceTypes.filter(
          rt => rt._id !== action.payload
        );
      })
      .addCase(deleteResourceType.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false; // Ensure loading is always reset
        console.warn('Delete resource type failed:', action.payload); // Good for debugging
      });
  }
});

export const { 
  addResourceTypeFromSocket, // Export the new action
  resourceTypeAdded, 
  resourceTypeUpdated, 
  resourceTypeDeleted,
  resetResourceTypeState
} = resourceTypeSlice.actions;

export default resourceTypeSlice.reducer;

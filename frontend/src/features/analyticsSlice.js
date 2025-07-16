
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService from '../Services/analyticsService';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire';

export const fetchAnalyticsData = createAsyncThunk(
  'analytics/fetchData',
  async (dateRange, { getState, dispatch, rejectWithValue }) => {
    try {
      
      const token = getState().auth.token;
            if (checkTokenAndLogout(token, dispatch)) {
              return rejectWithValue('Session expired');
            }
            
      // Fetch a broad dataset based only on a date range
      const populatedTasks = await analyticsService.getAnalyticsData(dateRange, token);
      return populatedTasks; 
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics data');
    }
  }
);

const initialState = {
    // This holds the complete, unfiltered dataset for the session
    allTasks: [], 
    status: 'idle',
    error: null,
  };
  
  const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
      // The setAnalyticsFilters reducer is removed.
    },
    extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allTasks = action.payload; // Store the master dataset
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default analyticsSlice.reducer;
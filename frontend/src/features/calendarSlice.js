// features/calendar/calendarSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import calendarService from '../Services/calendarService';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire'; 

export const importCalendar = createAsyncThunk(
  'calendar/importCalendar',
  async (url, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return rejectWithValue('Session expired');
      }
      const result = await calendarService.importCalendar(url, token);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to import calendar');
    }
  }
);

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    loading: false,
    success: false,
    error: null,
    importedCount: 0,
  },
  reducers: {
    resetCalendarState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.importedCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importCalendar.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(importCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.importedCount = action.payload.count || 0;
      })
      .addCase(importCalendar.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetCalendarState } = calendarSlice.actions;
export default calendarSlice.reducer;

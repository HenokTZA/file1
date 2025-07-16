
import { createSlice } from "@reduxjs/toolkit";
import checkTokenExpiration from "../Helper/checkTokenExpire";
import {jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { resetToastFlag } from '../Helper/checkTokenExpire';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire';
import {registerUser,CustomError} from '../Services/authService';

const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  access_level: null, // Add accessLevel to track user permissions
};
export const registerUsers = createAsyncThunk(
  'auth/register',
  async (userData, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return rejectWithValue('Session expired. Please log in again.');
    }
    
    try {
      return await registerUser(userData, token);
    } catch (error) {
     
      if (error instanceof CustomError) {
        return rejectWithValue({
          message: error.message,
          code: error.code,
          ...error // Spread all additional properties
        });
      }
      return rejectWithValue({
        message: error.message || 'Registration failed',
        code: 'UNKNOWN_ERROR'
      });
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user, access_level } = action.payload;
    
      if (checkTokenExpiration(token)) {
        throw new Error("Token is expired"); // Prevent setting expired token
      }
    
      state.token = token;
      state.user = user;
      state.access_level = access_level;
      state.isLoggedIn = true;
      resetToastFlag();
      const { exp } = jwtDecode(token);
      const expiresIn = exp * 1000 - Date.now();
    
      // Set timeout to log out the user when the token expires
      setTimeout(() => {
        toast.error("Your session has expired. Please log in again.");
        window.Storage.dispatch(logout()); // Use the globally accessible store

      }, expiresIn);
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.access_level = null; // Clear accessLevel
      state.isLoggedIn = false;
      localStorage.removeItem('token');
sessionStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Optionally update state if needed
      })
      .addCase(registerUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

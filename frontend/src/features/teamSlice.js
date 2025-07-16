import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire';
import teamService from '../Services/teamService';

// Async Thunks
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.createTeam(teamData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error creating team');
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.getTeamById(teamId, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching team');
    }
  }
);

export const fetchOrganizationTeams = createAsyncThunk(
  'teams/fetchOrganizationTeams',
  async (params, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.getTeamsByOrganization(token, params);
      return response.data.teams;
    } catch (error) {
      return rejectWithValue(error.message || 'Error fetching teams');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, updateData }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.updateTeam(teamId, updateData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error updating team');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.deleteTeam(teamId, token);
      return { teamId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Error deleting team');
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async ({ teamId, userId, role }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.addTeamMember(teamId, userId, role, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error adding team member');
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async ({ teamId, userId }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.removeTeamMember(teamId, userId, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error removing team member');
    }
  }
);

export const updateTeamMemberRole = createAsyncThunk(
  'teams/updateTeamMemberRole',
  async ({ teamId, userId, role }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null;
    }
    try {
      const response = await teamService.updateMemberRole(teamId, userId, role, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Error updating member role');
    }
  }
);

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    currentTeam: null,
    teams: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  },
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
    resetTeamError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.unshift(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Team By ID
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Organization Teams
      .addCase(fetchOrganizationTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchOrganizationTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teams.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?._id === action.payload._id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter(t => t._id !== action.payload.teamId);
        if (state.currentTeam?._id === action.payload.teamId) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Team Member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentTeam) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove Team Member
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentTeam) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Member Role
      .addCase(updateTeamMemberRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamMemberRole.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentTeam) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeamMemberRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentTeam, resetTeamError } = teamSlice.actions;
export default teamSlice.reducer;
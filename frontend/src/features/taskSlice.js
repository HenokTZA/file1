import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '../Services/taskService';
import { checkTokenAndLogout } from '../Helper/checkTokenExpire'; 


export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return rejectWithValue('Session expired');
      }
      
      const response = await taskService.createTask(taskData, token);
      
      // Ensure consistent response format
      return Array.isArray(response) 
        ? { data: response } 
        : response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating task');
    }
  }
);
export const getTasksByAssignedUser = createAsyncThunk(
  'tasks/getTasksByAssignedUser',
  async (userId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return null;
      }
      return await taskService.getTasksByAssignedUser(userId, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching tasks for assigned user');
    }
  }
);

export const getTasksDoneByAssignedUser = createAsyncThunk(
  'tasks/getTasksDoneByAssignedUser',
  async (userId, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return null;
      }
      return await taskService.getDoneTasksForUser(userId, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching done tasks for assigned user');
    }
  }
);

export const getAllDoneTasks = createAsyncThunk(
  'tasks/getAllDoneTasks',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return null;
      }
      return await taskService.getAllDoneTasks(token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching all done tasks');
    }
  }
);
// Fetch Tasks
export const fetchOrganizationTasks = createAsyncThunk(
  'tasks/fetchOrganizationTasks',
  async ({ page = 1, limit = 100 }, { rejectWithValue, dispatch, getState }) =>{
      try {
        const token = getState().auth.token; // Get the token from Redux state
        if (checkTokenAndLogout(token, dispatch)) {
          return null; // Exit if the token is expired
        }
        return await taskService.getOrganizationTasks(
          { page, limit },
          token
        );
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updatedData }, { getState, dispatch,rejectWithValue }) => {
    const token = getState().auth.token;
    if (checkTokenAndLogout(token, dispatch)) {
      return null; // Exit if the token is expired
    }

   
    try {
      // return await taskService.updateTask(taskId, updatedData, token);
      const response = await taskService.updateTask(taskId, updatedData, token);
     
    return response.data; 
    } catch (error) {
      console.error('Error in updateTask:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message || 'Error updating task');
    }
  }
);

// Fetch image metadata
export const fetchImageMetadata = createAsyncThunk(
  'tasks/fetchImageMetadata',
  async ({ fileIds }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;

    if (checkTokenAndLogout(token, dispatch)) return null;

    try {
      const response = await taskService.fetchImageMetadata(fileIds, token);
        return response;
      
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchImageFile = createAsyncThunk(
  'tasks/fetchImageFile',
  async ({ fileId }, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;

    if (checkTokenAndLogout(token, dispatch)) return null;

    try {
      const response = await taskService.fetchImageFile(fileId, token);
return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete Task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { getState, dispatch, rejectWithValue }) => {
    const token = getState().auth.token;
    
    if (checkTokenAndLogout(token, dispatch)) {
      return null; // Exit if token is expired
    }
    
    try {
      return await taskService.deleteTask(taskId, token);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error deleting task');
    }
  }
);

export const bulkUpdateTasks = createAsyncThunk(
  'tasks/bulkUpdateTasks',
  async (tasksData, { getState, dispatch,rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return null; // Exit if the token is expired
      }
      const results = await taskService.bulkUpdateTasks(tasksData, token);
      // Filter successful updates
      const successfulUpdates = results.filter(result => result.status === 'success')
                                     .map(result => result.updatedTask);
      
      return successfulUpdates;
    } catch (error) {
      console.log("error",error)
      return rejectWithValue(error.response?.data || 'Error updating tasks');
    }
  }
);
// features/tasks/tasksSlice.js
export const filterTasks = createAsyncThunk(
  'tasks/filterTasks',
  async (filters, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (checkTokenAndLogout(token, dispatch)) {
        return null; // Exit if the token is expired
      }
      // Prepare filters with defaults
      const requestFilters = {
        // page: filters?.page || 2,
        // limit: filters?.limit || 100,
        filters: filters || {}
      };

      return await taskService.filterTasks(requestFilters, token);
    } catch (error) {
      return rejectWithValue(error.message || 'Error filtering tasks');
    }
  }
);
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    status: 'idle',
    filteredTasks: [], 
    imageMetadata: [],
    imageFiles: {},
    error: null,
    currentView: 'allTasks', // Default to showing all tasks
  },
  reducers: {
    setTaskView: (state, action) => {
      state.currentView = action.payload; // Update the view (e.g., 'allTasks' or 'userTasks')
    },
    
    addMultipleTasksFromSocket: (state, action) => {
      // Ensure state.tasks is always an array
      if (!Array.isArray(state.tasks)) {
        state.tasks = [];
      }
      
      // Ensure payload is an array
      const newTasks = Array.isArray(action.payload) ? action.payload : [action.payload].filter(Boolean);
      
      // Create Set of existing IDs (safe even if state.tasks is empty)
      const existingIds = new Set(
        Array.isArray(state.tasks) 
          ? state.tasks.map(t => t._id) 
          : []
      );
      
      // Filter out duplicates and invalid tasks
      const uniqueNewTasks = newTasks.filter(
        task => task?._id && !existingIds.has(task._id)
      );
      
      // Safely add new tasks
      if (uniqueNewTasks.length > 0) {
        state.tasks = [...state.tasks, ...uniqueNewTasks];
      }
    },
    resetFilteredTasks: (state) => {
      state.filteredTasks = [];
      state.currentView = 'allTasks'; // Reset to all tasks view
    },
    
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchImageMetadata.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchImageMetadata.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.imageMetadata = action.payload;
    })
    .addCase(fetchImageMetadata.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    })
    .addCase(fetchImageFile.fulfilled, (state, action) => {
      state.imageFiles[action.payload.fileId] = action.payload.blob;
    })
      .addCase(createTask.pending, (state) => {
        state.status = 'loading';
      })
    
      // In your taskSlice.js
// .addCase(createTask.fulfilled, (state, action) => {
//   state.status = 'succeeded';
  
//   // Process payload into array of tasks
//   const receivedTasks = Array.isArray(action.payload) 
//     ? action.payload 
//     : action.payload?.data 
//       ? Array.isArray(action.payload.data) 
//         ? action.payload.data 
//         : [action.payload.data]
//       : [action.payload].filter(Boolean);
  
//   // Create Set of existing task IDs for quick lookup
//   const existingIds = new Set(state.tasks.map(t => t._id));
  
//   // Filter out duplicates and invalid tasks
//   const uniqueNewTasks = receivedTasks.filter(
//     task => task?._id && !existingIds.has(task._id)
//   );
  
//   // Merge new tasks with existing ones (IMPORTANT: Use Immer's mutable syntax)
//   state.tasks.push(...uniqueNewTasks);
// })
.addCase(createTask.fulfilled, (state, action) => {
  state.status = 'succeeded';
  
  // Normalize the response to always be an array
  let receivedTasks = [];
  if (Array.isArray(action.payload)) {
    receivedTasks = action.payload;
  } else if (action.payload?.data) {
    receivedTasks = Array.isArray(action.payload.data) 
      ? action.payload.data 
      : [action.payload.data];
  } else if (action.payload) {
    receivedTasks = [action.payload];
  }

  // Filter out invalid tasks and duplicates
  const existingIds = new Set(state.tasks.map(t => t._id));
  const validNewTasks = receivedTasks.filter(
    task => task?._id && !existingIds.has(task._id)
  );

  // Add new tasks to state
  if (validNewTasks.length > 0) {
    state.tasks.push(...validNewTasks);
  }
})
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(filterTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(filterTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.filteredTasks = action.payload.data.tasks;
        state.currentView = 'filteredTasks'; // ✅ Switch view to filtered tasks
      })
      .addCase(filterTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchOrganizationTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrganizationTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Validate and sanitize payload
        if (!Array.isArray(action.payload.data.tasks)) {
          console.error('Invalid tasks payload:', action.payload.data.tasks);
          state.tasks = [];
          return;
        }
      
        state.tasks = action.payload.data.tasks.filter(task => 
          task?._id
        );
      })
      .addCase(fetchOrganizationTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Ensure tasks is always an array
        if (!Array.isArray(state.tasks)) {
          console.warn('Tasks state corrupted, resetting to array');
          state.tasks = [];
        }
      
        const updatedTask = action.payload.data || action.payload;
        
        if (!updatedTask?._id) {
          console.error('Invalid task update:', updatedTask);
          return;
        }
      
        // Update or add task
        const exists = state.tasks.some(t => t._id === updatedTask._id);
        state.tasks = exists
          ? state.tasks.map(t => t._id === updatedTask._id ? updatedTask : t)
          : [...state.tasks, updatedTask];
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = state.tasks.filter(task => task._id !== action.payload._id); // Use the correct identifier

      })
       // For getting tasks by assigned user
       .addCase(getTasksByAssignedUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTasksByAssignedUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Validate and sanitize payload
        if (!Array.isArray(action.payload?.data)) {
          console.error('Invalid tasks payload:', action.payload);
          state.tasks = [];
          return;
        }
        state.tasks = action.payload.data.filter(task => 
          task?._id 
        );
      })
      .addCase(getTasksByAssignedUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch assigned tasks';
      })
      
      .addCase(getTasksDoneByAssignedUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTasksDoneByAssignedUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        if (!Array.isArray(action.payload?.data)) {
          console.error('Invalid done tasks payload:', action.payload);
          state.tasks = [];
          return;
        }
      
        state.tasks = action.payload.data.filter(task => 
          task?._id && task?.status === 'done' // Ensure tasks are marked as done
        );
      })
      .addCase(getTasksDoneByAssignedUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch done tasks';
      })
      
      .addCase(getAllDoneTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllDoneTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        if (!Array.isArray(action.payload?.data)) {
          console.error('Invalid all done tasks payload:', action.payload);
          state.tasks = [];
          return;
        }
      
        state.tasks = action.payload.data.filter(task => 
          task?._id && task?.status === 'done' // Ensure all tasks are done
        );
      })
      .addCase(getAllDoneTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch all done tasks';
      })
      .addCase(bulkUpdateTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      
      .addCase(bulkUpdateTasks.fulfilled, (state, action) => {
        const results = action.payload;
        if (Array.isArray(results)) {
          results.forEach((result) => {
            if (result.status === 'success' && result.updatedTask) {
              const index = state.tasks.findIndex((task) => task._id === result.updatedTask._id);
              if (index !== -1) {
                // Merge only the updated fields with the existing task
                state.tasks[index] = {
                  ...state.tasks[index], // Keep existing fields
                  ...result.updatedTask, // Overwrite with updated fields
                  start: result.updatedTask.start_time || state.tasks[index].start, // Preserve existing start if not updated
                  end: result.updatedTask.end_time || state.tasks[index].end, // Preserve existing end if not updated
                };
              } else {
                // If the task doesn't exist in the state, add it
                state.tasks.push({
                  ...result.updatedTask,
                  start: result.updatedTask.start_time,
                  end: result.updatedTask.end_time,
                });
              }
            }
          });
        }
        state.status = 'succeeded';
      })
      .addCase(bulkUpdateTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update tasks';
      })
  },
});
export const { setTaskView,addMultipleTasksFromSocket ,resetFilteredTasks} = taskSlice.actions;

export default taskSlice.reducer;

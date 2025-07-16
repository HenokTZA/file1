
import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import authReducer from '../features/authSlice';
import taskReducer from '../features/taskSlice';
import notificationReducer from '../features/notificationSlice';
import userSlice from '../features/userSlice';
import resourceTypeReducer from '../features/resourceTypeSlice';
import resourceReducer from '../features/resourceSlice';
import teamReducer from '../features/teamSlice';
import calendarReducer from '../features/calendarSlice';
import { combineReducers } from 'redux';
import analyticsReducer from '../features/analyticsSlice'; // <-- Import the new reducer

// Define persist configuration for the auth slice
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist the auth slice
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  users:userSlice,
  resourceTypes: resourceTypeReducer,
  resources:resourceReducer,
  teams: teamReducer,
  notifications: notificationReducer,
  calendar: calendarReducer,
  analytics: analyticsReducer
});

// Wrap the root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tasks/fetchImageFile/fulfilled'],
        ignoredPaths: ['tasks.imageFiles']
      }
    })
});
window.Storage = store; // Expose store globally for setTimeout access

export const persistor = persistStore(store);

export default store;

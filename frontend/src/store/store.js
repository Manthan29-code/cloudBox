import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // sessionStorage instead of localStorage
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import folderReducer from './slices/folderSlice';
import fileReducer from './slices/fileSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  folder: folderReducer,
  file: fileReducer,
});

// Persist configuration
const persistConfig = {
  key: 'root', // Key for sessionStorage
  storage, // sessionStorage
  whitelist: ['auth', 'folder', 'file'], // Which reducers to persist (you can specify only 'auth' if needed)
  // blacklist: ['someReducer'], // Reducers you DON'T want to persist
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);



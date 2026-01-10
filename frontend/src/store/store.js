import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import folderReducer from './slices/folderSlice';
import fileReducer from './slices/fileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    folder: folderReducer,
    file: fileReducer,
  },
});



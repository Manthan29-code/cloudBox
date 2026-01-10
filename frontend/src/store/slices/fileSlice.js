import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

// Async Thunks

// Upload File
export const uploadFile = createAsyncThunk(
  'file/uploadFile',
  async (formData, { rejectWithValue }) => {
    try {
      // Note: formData should already contain 'file', 'folderId', and optional 'isPublic'
      const response = await api.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('File uploaded successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get Files by Folder
export const getFilesByFolder = createAsyncThunk(
  'file/getFilesByFolder',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/file/byFolder/${folderId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch files';
      // Don't toast on fetch error if it's just "empty" or similar non-critical issues,
      // but here we generally toast errors.
       if (error.response?.status !== 404) {
          toast.error(message);
       }
      return rejectWithValue(message);
    }
  }
);

// Delete File
export const deleteFile = createAsyncThunk(
  'file/deleteFile',
  async (fileId, { rejectWithValue }) => {
    try {
      await api.delete(`/file/${fileId}`);
      toast.success('File deleted successfully');
      return fileId; // Return only ID to filter out from state
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update File Metadata (Rename / Toggle Public)
export const updateFile = createAsyncThunk(
  'file/updateFile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/file/${id}`, data);
      toast.success('File updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get Single File Details (for preview/download if needed explicitly)
export const getFile = createAsyncThunk(
  'file/getFile',
  async (fileId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/file/${fileId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch file details';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  files: [],
  currentFile: null,
  isLoading: false,
  error: null,
};

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    clearFiles: (state) => {
      state.files = [];
      state.error = null;
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload File
      .addCase(uploadFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optimistic update: Add the new file to the list
        if (action.payload.file) {
          state.files.push(action.payload.file);
        }
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Files By Folder
      .addCase(getFilesByFolder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFilesByFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload.files || [];
      })
      .addCase(getFilesByFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete File
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = state.files.filter((file) => file._id !== action.payload);
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update File
      .addCase(updateFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFile.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedFile = action.payload.file;
        const index = state.files.findIndex((f) => f._id === updatedFile._id);
        if (index !== -1) {
          state.files[index] = updatedFile;
        }
      })
      .addCase(updateFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Single File
      .addCase(getFile.fulfilled, (state, action) => {
        state.currentFile = action.payload.file;
      });
  },
});

export const { clearFiles, setCurrentFile } = fileSlice.actions;
export default fileSlice.reducer;

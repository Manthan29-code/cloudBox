import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { toast } from 'react-toastify';

// Async Thunks

// Create Folder
export const createFolder = createAsyncThunk(
  'folder/createFolder',
  async (folderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/folder/', folderData);
      toast.success('Folder created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create folder';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get Root Folders
export const getRootFolders = createAsyncThunk(
  'folder/getRootFolders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/folder/');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch folders';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get Folder Contents (Children)
export const getFolderContents = createAsyncThunk(
  'folder/getFolderContents',
  async (folderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/folder/${folderId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch folder contents';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update Folder
export const updateFolder = createAsyncThunk(
  'folder/updateFolder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/folder/${id}`, data);
      toast.success('Folder updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update folder';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete Folder
export const deleteFolder = createAsyncThunk(
  'folder/deleteFolder',
  async ({ id, deleteContents = false }, { rejectWithValue }) => {
    try {
      // Assuming deleteContents needs to be passed as a query param based on API doc
      const response = await api.delete(`/folder/${id}`, {
        params: { deleteContents }
      });
      toast.success('Folder deleted successfully');
      return { id, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete folder';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  folders: [], // Current view folders
  currentFolder: null, // Check if we are in a subfolder
  viewFolderId: null, // The ID of the folder we are currently viewing (persists even if empty)
  path: [], // Breadcrumb path
  isLoading: false,
  error: null,
};

const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    },
    clearFolderState: (state) => {
      state.folders = [];
      state.currentFolder = null;
      state.viewFolderId = null;
      state.path = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Folder
      .addCase(createFolder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Logic to update UI immediately
        const createdFolder = action.payload.folder;
        // If we are at root (viewFolderId is null) and created folder has no parent
        if (!state.viewFolderId && !createdFolder.parentId) {
            state.folders.push(createdFolder);
        }
        // If we are in the parent of the new folder
        else if (state.viewFolderId && createdFolder.parentId === state.viewFolderId) {
            state.folders.push(createdFolder);
        }
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Root Folders
      .addCase(getRootFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.viewFolderId = null; // We are at root
      })
      .addCase(getRootFolders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.folders = action.payload.folders;
        state.currentFolder = null;
        state.path = []; // Reset path at root
      })
      .addCase(getRootFolders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Folder Contents
      .addCase(getFolderContents.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        // Store the ID we are trying to fetch
        state.viewFolderId = action.meta.arg;
      })

      .addCase(getFolderContents.fulfilled, (state, action) => {
        state.isLoading = false;
        // The API response for getting folder contents seems to return 'folders' array which are children? 
        // Let's re-read the doc.
        // Doc says: 200 Response: { success: true, folders: [...] }
        // Wait, does it return the current folder info?
        // Doc says: "Get Folders Inside a Parent"
        // It returns a list of folders.
        // What about breadcrumbs or current folder info? 
        // The example response shows folders array where each folder has a 'path' array.
        // AND each child folder has a 'parentId' object which contains _id and name.
        // BUT the API doc is slightly ambiguous if it returns the metadata of the *current* folder itself in the root of the response.
        // It seems it mainly returns the children. 
        // However, I can probably derive the path from the first child if it exists, OR I need to rely on what I know about the folder I clicked.
        // Ideally the API should return metadata of the folder requested.
        // Looking at the response: folders: [ { ... path: [...] } ]
        // I will trust the folders array is the children.
        
        state.folders = action.payload.folders;
        
        // We might need to handle 'currentFolder' and 'path' manually or based on one of the children if available.
        // If folders is empty, we might not know the name of the current folder if it wasn't passed.
        // Let's assume for now we set currentFolder BEFORE calling this or the API returns it.
        // Actually, looking at the doc Response 3:
        // folders: [ { ... parentId: { _id: "parent_id", name: "Parent Name" } } ]
        // Does parentId contain the info of the folder we just requested?
        // Yes, likely.
        
        if (action.payload.folders && action.payload.folders.length > 0) {
            const firstChild = action.payload.folders[0];
            // The API response structure in doc for parentId is an object inside the child?
            // "parentId": { "_id": "parent_id", "name": "Parent Name" }
            // This seems to be the parent of the child (which is the folder we requested).
            // So we can extract current folder info from there.
            if (firstChild.parentId && typeof firstChild.parentId === 'object') {
                 // That effectively is the current folder
                 // But wait, what if the folder is empty?
                 // If the folder is empty, this logic fails.
                 // We will need to store the current folder in Redux state when we navigate to it from the UI.
            }
        }
      })
      .addCase(getFolderContents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Folder
      .addCase(updateFolder.fulfilled, (state, action) => {
        // Update the folder in the list
        const index = state.folders.findIndex(f => f._id === action.payload.folder._id);
        if (index !== -1) {
          state.folders[index] = action.payload.folder;
        }
        // If we updated the current folder (e.g. rename), update currentFolder state too
        if (state.currentFolder && state.currentFolder._id === action.payload.folder._id) {
            state.currentFolder = action.payload.folder;
        }
      })

      // Delete Folder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(f => f._id !== action.payload.id);
      });
  },
});

export const { setCurrentFolder, clearFolderState } = folderSlice.actions;

export default folderSlice.reducer;

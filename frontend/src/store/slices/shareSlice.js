import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shareService from '../../services/shareService';
import { toast } from 'react-toastify';

// Async Thunks
export const createShare = createAsyncThunk(
    'share/create',
    async (shareData, { rejectWithValue }) => {
        try {
            const response = await shareService.createShare(shareData);
            toast.success('Share created successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create share';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const getMyShares = createAsyncThunk(
    'share/getMyShares',
    async (_, { rejectWithValue }) => {
        try {
            const response = await shareService.getMyShares();
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch your shares';
            // toast.error(message); // Optional: don't spam toasts on load
            return rejectWithValue(message);
        }
    }
);

export const getSharedWithMe = createAsyncThunk(
    'share/getSharedWithMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await shareService.getSharedWithMe();
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch shared items';
            // toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const accessShare = createAsyncThunk(
    'share/access',
    async (shareId, { rejectWithValue }) => {
        try {
            const response = await shareService.accessShare(shareId);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to access share';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    myShares: [],
    sharedWithMe: [],
    currentShare: null, // For the viewer page
    isLoading: false,
    error: null,
};

const shareSlice = createSlice({
    name: 'share',
    initialState,
    reducers: {
        clearCurrentShare: (state) => {
            state.currentShare = null;
            state.error = null;
        },
        clearShareErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Share
            .addCase(createShare.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createShare.fulfilled, (state, action) => {
                state.isLoading = false;
                // Optionally add the new share to myShares list immediately
                state.myShares = [action.payload, ...state.myShares];
            })
            .addCase(createShare.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get My Shares
            .addCase(getMyShares.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMyShares.fulfilled, (state, action) => {
                state.isLoading = false;
                state.myShares = action.payload;
            })
            .addCase(getMyShares.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Shared With Me
            .addCase(getSharedWithMe.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSharedWithMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sharedWithMe = action.payload;
            })
            .addCase(getSharedWithMe.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Access Share
            .addCase(accessShare.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentShare = null;
            })
            .addCase(accessShare.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentShare = action.payload;
            })
            .addCase(accessShare.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentShare = null;
            });
    },
});

export const { clearCurrentShare, clearShareErrors } = shareSlice.actions;
export default shareSlice.reducer;

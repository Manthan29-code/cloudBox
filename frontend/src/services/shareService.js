import api from '../utils/axios';

const shareService = {
    // Search users for sharing (Note: uses /user endpoint as per docs)
    searchUsers: async (query) => {
        if (!query || query.length < 2) return [];
        const response = await api.get(`/user?search=${encodeURIComponent(query)}`);
        return response.data;
    },

    // Create a new share
    createShare: async (shareData) => {
        const response = await api.post('/shares/create', shareData);
        return response.data;
    },

    // Get shares created by the current user
    getMyShares: async () => {
        const response = await api.get('/shares/my-shares');
        return response.data;
    },

    // Get shares shared with the current user
    getSharedWithMe: async () => {
        const response = await api.get('/shares/shared-with-me');
        return response.data;
    },

    // Validate a share link (public/lightweight check)
    validateShare: async (shareId) => {
        const response = await api.get(`/shares/validate/${shareId}`);
        return response.data;
    },

    // Access a shared resource (requires auth if not public, but for this app we assume auth)
    accessShare: async (shareId) => {
        const response = await api.get(`/shares/access/${shareId}`);
        return response.data;
    },

    // Get download URL for a shared resource
    downloadShare: async (shareId) => {
        const response = await api.get(`/shares/download/${shareId}`);
        return response.data;
    }
};

export default shareService;

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FaTimes, FaSearch, FaUserPlus, FaCalendarAlt } from 'react-icons/fa';
import { createShare } from '../../store/slices/shareSlice';
import shareService from '../../services/shareService';
import debounce from 'lodash/debounce';

const ShareModal = ({ isOpen, onClose, resourceId, resourceType }) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);

    // Search State
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Share Data State
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [permissions, setPermissions] = useState({ read: true, download: false });
    const [expiryType, setExpiryType] = useState('none'); // 'none', '7days', '1day', 'custom'
    const [customExpiry, setCustomExpiry] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStep(1);
            setQuery('');
            setSearchResults([]);
            setSelectedUsers([]);
            setPermissions({ read: true, download: false });
            setExpiryType('none');
        }
    }, [isOpen]);

    // Debounced search
    const performSearch = React.useCallback(
        debounce(async (searchQuery) => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await shareService.searchUsers(searchQuery);
                setSearchResults(results.data || []);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        performSearch(query);
    }, [query, performSearch]);

    const handleUserSelect = (user) => {
        if (!selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setQuery('');
        setSearchResults([]);
    };

    const handleUserRemove = (userId) => {
        setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
    };

    const handleCreateShare = async () => {
        if (selectedUsers.length === 0) return;

        const shareData = {
            resourceId,
            resourceType,
            allocatedTo: selectedUsers.map(u => u._id),
            permissions
        };

        if (expiryType === '7days') shareData.days = 7;
        if (expiryType === '1day') shareData.days = 1;
        if (expiryType === 'custom' && customExpiry) shareData.expiresAt = customExpiry;

        const result = await dispatch(createShare(shareData));
        if (createShare.fulfilled.match(result)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Share {resourceType}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">

                    {/* User Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add People</label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                            />
                        </div>

                        {/* Search Results */}
                        {query.length >= 2 && (
                            <div className="mt-2 border border-gray-200 rounded-xl max-h-40 overflow-y-auto shadow-sm">
                                {isSearching ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 text-sm">No users found</div>
                                ) : (
                                    searchResults.map(user => (
                                        <div
                                            key={user._id}
                                            onClick={() => handleUserSelect(user)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b last:border-0 border-gray-100"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-800 text-sm">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                            <FaUserPlus className="text-gray-400" />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Selected Users Chips */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedUsers.map(user => (
                                <div key={user._id} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    <span>{user.name}</span>
                                    <button onClick={() => handleUserRemove(user._id)} className="hover:text-gray-300"><FaTimes size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl flex-1 hover:border-black transition-colors">
                                <input
                                    type="checkbox"
                                    checked={permissions.read}
                                    disabled
                                    className="w-4 h-4 text-black rounded focus:ring-black"
                                />
                                <span className="text-sm font-medium">Read Only</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl flex-1 hover:border-black transition-colors">
                                <input
                                    type="checkbox"
                                    checked={permissions.download}
                                    onChange={(e) => setPermissions({ ...permissions, download: e.target.checked })}
                                    className="w-4 h-4 text-black rounded focus:ring-black"
                                />
                                <span className="text-sm font-medium">Allow Download</span>
                            </label>
                        </div>
                    </div>

                    {/* Expiration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Expiration</label>
                        <select
                            value={expiryType}
                            onChange={(e) => setExpiryType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                        >
                            <option value="none">Never</option>
                            <option value="1day">1 Day</option>
                            <option value="7days">7 Days</option>
                            <option value="custom">Custom Date</option>
                        </select>
                        {expiryType === 'custom' && (
                            <input
                                type="datetime-local"
                                value={customExpiry}
                                onChange={(e) => setCustomExpiry(e.target.value)}
                                className="mt-2 w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                            />
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateShare}
                        disabled={selectedUsers.length === 0}
                        className="px-5 py-2 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;

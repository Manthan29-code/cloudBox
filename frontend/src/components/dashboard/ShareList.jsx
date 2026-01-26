import React from 'react';
import { FaFile, FaFilePdf, FaFileWord, FaFileImage, FaExternalLinkAlt, FaDownload, FaEye, FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ShareList = ({ shares, type, onAccess }) => {
    const navigate = useNavigate();

    const getFileIcon = (resourceType, mimeType) => {
        if (resourceType === 'folder') return <FaFolder className="text-yellow-500" />;
        // Note: Backend might not send mimeType for shares list always, need to check if populated
        // Assuming resourceType 'file' for now
        return <FaFile className="text-gray-400" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    if (shares.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <div className="mb-4 text-6xl opacity-20">
                    <FaUserFriends />
                </div>
                <p className="text-xl font-medium">No shares found</p>
                <p className="text-sm">
                    {type === 'my-shares'
                        ? "You haven't shared any files yet."
                        : "No one has shared any files with you yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {type === 'my-shares' ? 'Shared With' : 'Shared By'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {shares.map((share) => (
                        <tr key={share._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                                        {/* Assuming backend populates resource details enough to know name */}
                                        <FaFile className="text-blue-500 text-xl" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {/* Handling both populated resource or fallback */}
                                            {share.resourceId?.originalName || share.resourceId?.name || "Unknown File"}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase">{share.resourceType}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                    {type === 'my-shares' ? (
                                        <div className="flex flex-wrap gap-1">
                                            {share.allocatedTo.map(user => (
                                                <span key={user._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    {user.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">{share.createdBy?.name}</div>
                                            <div className="text-sm text-gray-500 ml-1">({share.createdBy?.email})</div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                    {share.permissions.read && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Read</span>}
                                    {share.permissions.download && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Download</span>}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(share.expiresAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {type === 'shared-with-me' && (
                                    <button
                                        onClick={() => onAccess(share._id)}
                                        className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                    >
                                        <FaExternalLinkAlt /> Open
                                    </button>
                                )}
                                {/* For my-shares maybe show analytics or delete share? */}
                                {type === 'my-shares' && (
                                    <span className="text-gray-400 italic text-xs">Manage coming soon</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShareList;

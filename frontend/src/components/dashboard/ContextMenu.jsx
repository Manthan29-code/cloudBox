import React from 'react';
import { FaDownload, FaPen, FaGlobe, FaTrash, FaShareAlt } from 'react-icons/fa';

const ContextMenu = ({
    contextMenu,
    files,
    folders,
    handleDownload,
    startRenaming,
    handleToggleVisibility,
    handleDelete,
    handleShare
}) => {
    if (!contextMenu) return null;

    const item = (contextMenu.type === 'file' ? files : folders).find(i => i._id === contextMenu.id);

    return (
        <div
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-48 py-1 overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            {contextMenu.type === 'file' && (
                <button
                    onClick={(e) => handleDownload(e, item?.cloudUrl)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                    <FaDownload className="text-gray-400" /> Download
                </button>
            )}

            <button
                onClick={(e) => handleShare(e, item, contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaShareAlt className="text-gray-400" /> Share
            </button>

            <button
                onClick={(e) => startRenaming(e, item, contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaPen className="text-gray-400" /> Rename
            </button>
            <button
                onClick={(e) => handleToggleVisibility(e, item, contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaGlobe className="text-gray-400" /> Toggle Visibility
            </button>
            <button
                onClick={(e) => handleDelete(e, contextMenu.id, contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
                <FaTrash className="text-red-400" /> Delete
            </button>
        </div>
    );
};

export default ContextMenu;

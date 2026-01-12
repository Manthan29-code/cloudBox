import React from 'react';
import { FaFolderOpen, FaHome } from 'react-icons/fa';

const EmptyState = ({ folderId, setIsCreateModalOpen, setIsUploadModalOpen }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                {folderId ? <FaFolderOpen size={40} /> : <FaHome size={40} />}
            </div>
            <p className="text-lg font-medium text-gray-500">This folder is empty</p>
            <div className="flex gap-4">
                <button onClick={() => setIsCreateModalOpen(true)} className="text-black hover:underline font-medium">
                    Create Folder
                </button>
                {folderId && <span className="text-gray-300">|</span>}
                {folderId && (
                    <button onClick={() => setIsUploadModalOpen(true)} className="text-black hover:underline font-medium">
                        Upload File
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;

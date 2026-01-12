import React from 'react';
import { FaTimes } from 'react-icons/fa';
import FileStats from '../FileStats';

const StatsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl animate-fade-in">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg">Storage Details</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-4">
                    <FileStats />
                </div>
            </div>
        </div>
    );
};

export default StatsModal;

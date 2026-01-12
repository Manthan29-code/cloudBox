import React from 'react';
import { FaPlus, FaCloudUploadAlt, FaChartPie } from 'react-icons/fa';
import Breadcrumb from './Breadcrumb';

const Toolbar = ({
    breadcrumbs,
    folderId,
    setIsUploadModalOpen,
    setIsCreateModalOpen,
    setIsStatsModalOpen
}) => {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="flex gap-3">
                {/* Upload File Button - Only if in a folder */}
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    disabled={!folderId}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm border ${!folderId
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60 shadow-none'
                        : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-lg'
                        }`}
                    title={!folderId ? "Please open a folder to upload files" : "Upload file"}
                >
                    <FaCloudUploadAlt /> Upload File
                </button>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm"
                >
                    <FaPlus /> New Folder
                </button>

                {/* Mobile Stats Toggle */}
                <button
                    onClick={() => setIsStatsModalOpen(true)}
                    className="md:hidden flex items-center justify-center p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    title="Storage Stats"
                >
                    <FaChartPie size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;

import React from 'react';
import { FaHome, FaChartPie, FaFolderOpen } from 'react-icons/fa';

const Sidebar = ({ activeView, setActiveView, folderId, navigate }) => {
    return (
        <aside className="hidden md:flex w-64 flex-col gap-6 shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full">
                <div className="space-y-1">
                    <button
                        onClick={() => { setActiveView('files'); if (folderId) navigate('/dashboard'); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${activeView === 'files' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaHome /> My Drive
                    </button>

                    <button
                        onClick={() => setActiveView('stats')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-left ${activeView === 'stats' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <FaChartPie /> Storage Analysis
                    </button>

                    <div className="px-4 py-3 text-gray-400 text-sm font-medium flex items-center gap-3 cursor-not-allowed">
                        <span className="w-5 flex justify-center"><FaFolderOpen /></span> Shared (Coming Soon)
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

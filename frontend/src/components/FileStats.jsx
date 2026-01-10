import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserFileStats } from '../store/slices/fileSlice';
import { FaHdd, FaFilePdf, FaFileImage, FaFileAlt, FaChartPie } from 'react-icons/fa';

const FileStats = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state) => state.file);

  useEffect(() => {
    dispatch(getUserFileStats());
  }, [dispatch]);

  if (!stats || !stats.stats) return null;

  const { totalSize, totalFiles } = stats.stats;
  const breakdown = stats.mimeTypeBreakdown || [];

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simple icon mapping locally or reuse what you have in DashboardPage but smaller
  const getIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (mimeType.includes('image')) return <FaFileImage className="text-purple-500" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  // Assume a hypothetical limit of 1GB for the storage bar visualization (since API doesn't provide limit)
  const STORAGE_LIMIT = 1024 * 1024 * 1024 * 5; // 5 GB
  const usagePercentage = Math.min((totalSize / STORAGE_LIMIT) * 100, 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full animate-fade-in">
        <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
            <FaHdd className="text-black" /> Storage Usage
        </h3>
        
        {/* Progress Bar */}
        <div className="mb-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>{formatSize(totalSize)} used</span>
                <span>{formatSize(STORAGE_LIMIT)} total</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-black h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${usagePercentage}%` }}
                ></div>
            </div>
        </div>
        <p className="text-xs text-gray-400 mb-6 text-center">{totalFiles} files total</p>

        {/* Breakdown List */}
        <div className="space-y-3">
             {breakdown.length > 0 ? (
                 breakdown.slice(0, 4).map((type) => (
                    <div key={type._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate max-w-[120px]">
                            {getIcon(type._id)}
                            <span className="text-gray-600 truncate" title={type._id}>
                                {type._id.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                        </div>
                        <span className="text-gray-900 font-medium">{formatSize(type.totalSize)}</span>
                    </div>
                 ))
             ) : (
                 <p className="text-xs text-gray-400 text-center italic">No files available</p>
             )}
        </div>
        
        {breakdown.length > 4 && (
             <div className="mt-3 text-center">
                 <span className="text-xs text-black font-semibold cursor-pointer hover:underline">View All</span>
             </div>
        )}
    </div>
  );
};

export default FileStats;

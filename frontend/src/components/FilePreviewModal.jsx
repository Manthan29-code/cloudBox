import React from 'react';
import { FaTimes, FaDownload, FaFile, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaExternalLinkAlt } from 'react-icons/fa';

const FilePreviewModal = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FaFileImage className="text-6xl text-gray-700" />;
    if (mimeType === 'application/pdf') return <FaFilePdf className="text-6xl text-gray-700" />;
    if (mimeType?.includes('word')) return <FaFileWord className="text-6xl text-gray-700" />;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <FaFileExcel className="text-6xl text-gray-700" />;
    return <FaFile className="text-6xl text-gray-700" />;
  };

  const isImage = file.mimeType?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative animate-fade-in">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-gray-900 truncate max-w-md" title={file.originalName}>
            {file.originalName}
          </h3>
          <div className="flex items-center gap-2">
            <a 
                href={file.cloudUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                title="Open in new tab"
            >
                <FaExternalLinkAlt />
            </a>
            <button 
                onClick={onClose} 
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
            >
                <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
             {isImage ? (
                 <img 
                    src={file.cloudUrl} 
                    alt={file.originalName} 
                    className="max-w-full max-h-full object-contain rounded shadow-sm"
                 />
             ) : (
                 <div className="text-center p-10 bg-white rounded-xl shadow-sm">
                     <div className="flex justify-center mb-4">
                        {getFileIcon(file.mimeType)}
                     </div>
                     <p className="text-gray-500 mb-6">Preview not available for this file type.</p>
                     <a 
                        href={file.cloudUrl} 
                        download
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-black hover:bg-gray-800 shadow-md transition-all"
                     >
                        <FaDownload className="mr-2" /> Download File
                     </a>
                 </div>
             )}
        </div>

        {/* Footer / Details */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 shrink-0 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500">
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase">Size</span>
                <span className="font-medium text-gray-900">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase">Type</span>
                <span className="font-medium text-gray-900">{file.mimeType || 'Unknown'}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase">Uploaded</span>
                <span className="font-medium text-gray-900">{new Date(file.createdAt).toLocaleDateString()}</span>
            </div>
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-400 uppercase">Visibility</span>
                <span className={`font-medium ${file.isPublic ? 'text-green-600' : 'text-gray-900'}`}>{file.isPublic ? 'Public' : 'Private'}</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FilePreviewModal;

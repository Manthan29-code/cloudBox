import React, { useEffect } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import PDFViewer from './viewers/PDFViewer';
import DOCXViewer from './viewers/DOCXViewer';
import ImageViewer from './viewers/ImageViewer';

const FilePreviewModal = ({ isOpen, onClose, file }) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  // Determine file type
  const isImage = file.mimeType?.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf';
  const isDOCX = file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimeType?.includes('word') ||
    file.originalName?.endsWith('.docx');

  const handleDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = file.cloudUrl;
    link.download = file.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header Bar */}
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate" title={file.originalName}>
            {file.originalName}
          </h3>
          <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span className="hidden md:inline">{file.mimeType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            title="Download File"
          >
            <FaDownload />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <FaTimes size={24} />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-hidden">
        {isPDF && <PDFViewer fileUrl={file.cloudUrl} fileName={file.originalName} />}
        {isDOCX && <DOCXViewer fileUrl={file.cloudUrl} fileName={file.originalName} />}
        {isImage && <ImageViewer fileUrl={file.cloudUrl} fileName={file.originalName} />}

        {/* Fallback for unsupported file types */}
        {!isPDF && !isDOCX && !isImage && (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-white font-medium mb-4">Preview not available for this file type</p>
              <p className="text-gray-400 mb-6">Please download the file to view it</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <FaDownload className="mr-2" />
                Download File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</span>
            <span className={file.isPublic ? 'text-green-400' : 'text-gray-400'}>
              {file.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          <div className="text-gray-600">
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;

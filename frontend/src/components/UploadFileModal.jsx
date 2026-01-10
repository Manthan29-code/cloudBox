import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCloudUploadAlt, FaTimes, FaFile } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const UploadFileModal = ({ isOpen, onClose, onUpload, parentId }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { isLoading } = useSelector((state) => state.file);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = (data) => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folderId', parentId);
    if (data.isPublic) {
        formData.append('isPublic', 'true');
    }

    onUpload(formData).then(() => {
        reset();
        setSelectedFile(null);
        onClose();
    });
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 transform transition-all scale-100 relative">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaCloudUploadAlt className="text-gray-700" /> Upload File
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
             {/* File Input Area */}
             <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors group">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                    disabled={isLoading}
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                     {selectedFile ? (
                        <>
                            <FaFile className="text-4xl text-gray-700" />
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </>
                     ) : (
                        <>
                            <FaCloudUploadAlt className="text-4xl text-gray-400 group-hover:text-gray-600 transition-colors" />
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">Any file type up to 10MB</p>
                        </>
                     )}
                </div>
             </div>
             {!selectedFile && <p className="text-center text-xs text-red-500 h-4">Please select a file</p>}


            <div className="flex items-center mt-4">
              <input
                id="isPublic"
                type="checkbox"
                {...register('isPublic')}
                className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black focus:ring-2"
                disabled={isLoading}
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-700">
                Make Public
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors shadow-lg hover:shadow-xl flex items-center gap-2
                    ${!selectedFile || isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}
                `}
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;

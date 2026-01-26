import React from 'react';
import { FaFile, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaGlobe, FaEllipsisV } from 'react-icons/fa';

const FileGrid = ({
    files,
    onFileClick,
    onContextMenu,
    renamingId,
    submitRename,
    register,
    setRenamingId
}) => {

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <FaFileImage className="text-4xl text-purple-600 group-hover:scale-110 transition-transform" />;
        if (mimeType === 'application/pdf') return <FaFilePdf className="text-4xl text-red-500 group-hover:scale-110 transition-transform" />;
        if (mimeType?.includes('word')) return <FaFileWord className="text-4xl text-blue-500 group-hover:scale-110 transition-transform" />;
        if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <FaFileExcel className="text-4xl text-green-500 group-hover:scale-110 transition-transform" />;
        return <FaFile className="text-4xl text-gray-400 group-hover:scale-110 transition-transform" />;
    };

    return (
        <div>
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Files</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                    <div
                        key={file._id}
                        onClick={() => onFileClick(file)}
                        onContextMenu={(e) => onContextMenu(e, file._id, 'file')}
                        className="group relative p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center bg-white"
                    >
                        {/* File Preview / Icon */}
                        <div className="h-16 mb-3 flex items-center justify-center w-full overflow-hidden rounded-lg bg-gray-50">
                            {file.mimeType?.startsWith('image/') ? (
                                <img src={file.cloudUrl} alt={file.originalName} className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                getFileIcon(file.mimeType)
                            )}
                        </div>

                        {renamingId && renamingId.type === 'file' && renamingId.id === file._id ? (
                            <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()} className="w-full">
                                <input
                                    {...register('name', { required: true })}
                                    className="w-full text-center text-sm border-b border-black focus:outline-none bg-transparent"
                                    onBlur={() => setRenamingId(null)}
                                    autoFocus
                                />
                            </form>
                        ) : (
                            <div className="w-full px-1">
                                <h3 className="text-gray-900 font-medium text-sm truncate w-full" title={file.originalName}>
                                    {file.originalName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-2">
                                    <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                    {file.isPublic && <FaGlobe className="text-gray-400" title="Public" />}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={(e) => onContextMenu(e, file._id, 'file')}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 bg-white/80"
                        >
                            <FaEllipsisV size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileGrid;

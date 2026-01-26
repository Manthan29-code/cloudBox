import React from 'react';
import { FaFolder, FaEllipsisV, FaGlobe } from 'react-icons/fa';

const FolderGrid = ({
    folders,
    onNavigate,
    onContextMenu,
    renamingId,
    submitRename,
    register,
    setRenamingId
}) => {
    return (
        <div>
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Folders</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {folders.map((folder) => (
                    <div
                        key={folder._id}
                        onClick={() => onNavigate(folder)}
                        onContextMenu={(e) => onContextMenu(e, folder._id, 'folder')}
                        className="group relative p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center bg-white"
                    >
                        <div className="text-gray-800 mb-3 transform group-hover:scale-110 transition-transform">
                            <FaFolder size={48} />
                        </div>

                        {renamingId && renamingId.type === 'folder' && renamingId.id === folder._id ? (
                            <form onSubmit={submitRename} onClick={(e) => e.stopPropagation()} className="w-full">
                                <input
                                    {...register('name', { required: true })}
                                    className="w-full text-center text-sm border-b border-black focus:outline-none bg-transparent"
                                    onBlur={() => setRenamingId(null)}
                                    autoFocus
                                />
                            </form>
                        ) : (
                            <h3 className="text-gray-700 font-medium text-sm truncate w-full px-2 mt-1 flex items-center justify-center gap-1" title={folder.name}>
                                {folder.isPublic && <FaGlobe className="text-gray-400 text-xs flex-shrink-0" title="Public" />}
                                <span className="truncate">{folder.name}</span>
                            </h3>
                        )}
                        <button
                            onClick={(e) => onContextMenu(e, folder._id, 'folder')}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                        >
                            <FaEllipsisV size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderGrid;

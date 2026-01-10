import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRootFolders, getFolderContents, createFolder, deleteFolder, updateFolder, setCurrentFolder } from '../store/slices/folderSlice';
import { getFilesByFolder, deleteFile, updateFile, uploadFile } from '../store/slices/fileSlice';
import Navbar from '../components/Navbar';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadFileModal from '../components/UploadFileModal';
import FilePreviewModal from '../components/FilePreviewModal';
import { 
    FaFolder, FaFolderOpen, FaPlus, FaTrash, FaPen, FaEllipsisV, 
    FaHome, FaChevronRight, FaGlobe, FaFile, FaFileImage, 
    FaFilePdf, FaFileWord, FaFileExcel, FaDownload, FaCloudUploadAlt 
} from 'react-icons/fa';
import { useForm } from 'react-hook-form';

const DashboardPage = () => {
  const { folderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Folder State
  const { folders, isLoading: isFolderLoading, error: folderError, currentFolder } = useSelector((state) => state.folder);
  
  // File State
  const { files, isLoading: isFileLoading, error: fileError } = useSelector((state) => state.file);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Context Menu State: { id, type: 'folder' | 'file', x, y }
  const [contextMenu, setContextMenu] = useState(null); 
  const [renamingId, setRenamingId] = useState(null); // format: { type: 'folder'|'file', id: string }
  
  // Local form for renaming
  const { register, handleSubmit, reset, setFocus } = useForm();
  
  // Auth Check
  useEffect(() => {
    if (!user) {
        navigate('/login');
    }
  }, [user, navigate]);

  // Fetch Data
  useEffect(() => {
    if (user) { 
        if (folderId) {
            dispatch(getFolderContents(folderId));
            dispatch(getFilesByFolder(folderId));
        } else {
            dispatch(getRootFolders());
            dispatch(setCurrentFolder(null));
            // Root level files not supported typically based on prompt, so we might not fetch files or clear them
            // But if there were any, we'd need a root fetch. 
            // For now, assuming no root files as per prompt "root level file creation is not allowd"
        }
    }
  }, [dispatch, folderId, user]);

  if (!user) return null; 

  const handleCreateFolder = (data) => {
    dispatch(createFolder(data));
  };

  const handleUploadFile = (formData) => {
     return dispatch(uploadFile(formData));
  };

  const handleNavigate = (folder) => {
    dispatch(setCurrentFolder(folder));
    navigate(`/dashboard/${folder._id}`);
  };

  const handleDelete = (e, targetId, type) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'folder') {
          dispatch(deleteFolder({ id: targetId, deleteContents: true }));
      } else {
          dispatch(deleteFile(targetId));
      }
    }
    setContextMenu(null);
  };

  const startRenaming = (e, item, type) => {
    e.stopPropagation();
    setRenamingId({ type, id: item._id });
    reset({ name: type === 'folder' ? item.name : item.originalName });
    setContextMenu(null);
    setTimeout(() => {
        setFocus('name'); 
    }, 100);
  };

  const submitRename = (data) => {
    if (renamingId) {
       if (renamingId.type === 'folder') {
           dispatch(updateFolder({ id: renamingId.id, data: { name: data.name } }));
       } else {
           dispatch(updateFile({ id: renamingId.id, data: { originalName: data.name } }));
       }
      setRenamingId(null);
    }
  };

  const handleToggleVisibility = (e, item, type) => {
    e.stopPropagation();
    const newStatus = !item.isPublic;
    if (type === 'folder') {
        dispatch(updateFolder({ id: item._id, data: { isPublic: newStatus } }));
    } else {
        dispatch(updateFile({ id: item._id, data: { isPublic: newStatus } }));
    }
    setContextMenu(null);
  };

  const handleFileClick = (file) => {
      setPreviewFile(file);
      setIsFilePreviewOpen(true);
  };

  const handleDownload = (e, fileUrl) => {
    e.stopPropagation();
    // Create a temporary link to force download if needed, or just open
    window.open(fileUrl, '_blank');
    setContextMenu(null);
  };

  const openContextMenu = (e, id, type) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, type, x: e.pageX, y: e.pageY });
  };

  useEffect(() => {
    const handleClick = () => {
        setContextMenu(null);
        if (renamingId) setRenamingId(null); // Cancel rename on click away
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [renamingId]);

  // Breadcrumbs
  let breadcrumbs = [];
  if (folderId) {
      if (currentFolder && currentFolder.path) {
          breadcrumbs = [...currentFolder.path, { _id: currentFolder._id, name: currentFolder.name }];
      } else if (folders.length > 0 && folders[0].path) {
           breadcrumbs = folders[0].path;
      }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FaFileImage className="text-4xl text-purple-600 group-hover:scale-110 transition-transform" />;
    if (mimeType === 'application/pdf') return <FaFilePdf className="text-4xl text-red-500 group-hover:scale-110 transition-transform" />;
    if (mimeType?.includes('word')) return <FaFileWord className="text-4xl text-blue-500 group-hover:scale-110 transition-transform" />;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <FaFileExcel className="text-4xl text-green-500 group-hover:scale-110 transition-transform" />;
    return <FaFile className="text-4xl text-gray-400 group-hover:scale-110 transition-transform" />;
  };

  const isLoading = isFolderLoading || (folderId && isFileLoading);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full">
                <div className="space-y-1">
                    <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${!folderId ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FaHome /> My Drive
                    </Link>
                    <div className="px-4 py-3 text-gray-400 text-sm font-medium flex items-center gap-3 cursor-not-allowed">
                        <span className="w-5 flex justify-center"><FaFolderOpen /></span> Shared (Coming Soon)
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
            
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                    <Link to="/dashboard" className="hover:text-black font-medium flex items-center gap-1">
                        <FaHome /> Home
                    </Link>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb._id}>
                            <FaChevronRight className="text-gray-300 text-xs" />
                            <Link 
                                to={`/dashboard/${crumb._id}`}
                                className={`font-medium max-w-[150px] truncate ${index === breadcrumbs.length - 1 ? 'text-black font-bold' : 'hover:text-black'}`}
                            >
                                {crumb.name}
                            </Link>
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex gap-3">
                     {/* Upload File Button - Only if in a folder */}
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        disabled={!folderId}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm border 
                            ${!folderId 
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none' 
                                : 'bg-white text-black border-gray-200 hover:bg-gray-50 hover:shadow-lg'
                            }`}
                        title={!folderId ? "Open a folder to upload files" : "Upload file"}
                    >
                        <FaCloudUploadAlt /> Upload File
                    </button>

                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm"
                    >
                        <FaPlus /> New Folder
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 min-h-[500px]">
                {isLoading && folders.length === 0 && files.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-black rounded-full"></div>
                        <p>Loading content...</p>
                    </div>
                ) : (folderError || fileError) && folders.length === 0 && files.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-red-500 bg-red-50 rounded-xl p-8 border border-red-100">
                        <p>{folderError || fileError}</p>
                    </div>
                ) : folders.length === 0 && files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                             {folderId ? <FaFolderOpen size={40} /> : <FaHome size={40} />}
                         </div>
                        <p className="text-lg font-medium text-gray-500">This folder is empty</p>
                        <div className="flex gap-4">
                             <button onClick={() => setIsCreateModalOpen(true)} className="text-black hover:underline font-medium">Create Folder</button>
                             {folderId && <span className="text-gray-300">|</span>}
                             {folderId && (
                                <button onClick={() => setIsUploadModalOpen(true)} className="text-black hover:underline font-medium">Upload File</button>
                             )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        
                        {/* Folders Section */}
                        {folders.length > 0 && (
                            <div>
                                <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Folders</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {folders.map((folder) => (
                                        <div 
                                            key={folder._id}
                                            onClick={() => handleNavigate(folder)}
                                            onContextMenu={(e) => openContextMenu(e, folder._id, 'folder')}
                                            className="group relative p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center bg-white"
                                        >
                                            <div className="text-gray-800 mb-3 transform group-hover:scale-110 transition-transform">
                                                <FaFolder size={48} />
                                            </div>
                                            
                                            {renamingId && renamingId.type === 'folder' && renamingId.id === folder._id ? (
                                                <form onSubmit={handleSubmit(submitRename)} onClick={(e) => e.stopPropagation()} className="w-full">
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
                                                onClick={(e) => openContextMenu(e, folder._id, 'folder')}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                                            >
                                                <FaEllipsisV size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files Section */}
                        {files.length > 0 && (
                             <div>
                                <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Files</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {files.map((file) => (
                                        <div 
                                            key={file._id}
                                            onClick={() => handleFileClick(file)}
                                            onContextMenu={(e) => openContextMenu(e, file._id, 'file')}
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
                                                <form onSubmit={handleSubmit(submitRename)} onClick={(e) => e.stopPropagation()} className="w-full">
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
                                                onClick={(e) => openContextMenu(e, file._id, 'file')}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200 bg-white/80"
                                            >
                                                <FaEllipsisV size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </main>
      </div>

      {/* Modals */}
      <CreateFolderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateFolder}
        parentId={folderId} 
      />
      
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        parentId={folderId}
      />

      <FilePreviewModal
        isOpen={isFilePreviewOpen}
        onClose={() => setIsFilePreviewOpen(false)}
        file={previewFile}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-48 py-1 overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
             {contextMenu.type === 'file' && (
                 <button 
                    onClick={(e) => handleDownload(e, (contextMenu.type === 'file' ? files : folders).find(i => i._id === contextMenu.id)?.cloudUrl)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                    <FaDownload className="text-gray-400"/> Download
                </button>
             )}

            <button 
                onClick={(e) => startRenaming(e, (contextMenu.type === 'file' ? files : folders).find(i => i._id === contextMenu.id), contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaPen className="text-gray-400"/> Rename
            </button>
            <button 
                onClick={(e) => handleToggleVisibility(e, (contextMenu.type === 'file' ? files : folders).find(i => i._id === contextMenu.id), contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaGlobe className="text-gray-400"/> Toggle Visibility
            </button>
            <button 
                onClick={(e) => handleDelete(e, contextMenu.id, contextMenu.type)}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
                <FaTrash className="text-red-400"/> Delete
            </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

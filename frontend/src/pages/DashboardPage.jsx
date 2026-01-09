import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRootFolders, getFolderContents, createFolder, deleteFolder, updateFolder, setCurrentFolder } from '../store/slices/folderSlice';
import Navbar from '../components/Navbar';
import CreateFolderModal from '../components/CreateFolderModal';
import { FaFolder, FaFolderOpen, FaPlus, FaTrash, FaPen, FaEllipsisV, FaHome, FaChevronRight, FaGlobe } from 'react-icons/fa';
import { useForm } from 'react-hook-form';

const DashboardPage = () => {
  const { folderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { folders, isLoading, error, currentFolder } = useSelector((state) => state.folder);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { id, x, y }
  const [renamingId, setRenamingId] = useState(null);
  
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
    if (user) { // Only fetch if user exists
        if (folderId) {
            dispatch(getFolderContents(folderId));
        } else {
            dispatch(getRootFolders());
            dispatch(setCurrentFolder(null));
        }
    }
  }, [dispatch, folderId, user]);

  if (!user) return null; // Prevent flash

  const handleCreateFolder = (data) => {
    dispatch(createFolder(data));
  };

  const handleNavigate = (folder) => {
    dispatch(setCurrentFolder(folder));
    navigate(`/dashboard/${folder._id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this folder?')) {
      dispatch(deleteFolder({ id, deleteContents: true }));
    }
    setContextMenu(null);
  };

  const startRenaming = (e, folder) => {
    e.stopPropagation();
    setRenamingId(folder._id);
    reset({ name: folder.name });
    setContextMenu(null);
    // Timeout to allow render then focus
    setTimeout(() => {
        setFocus('name'); 
    }, 100);
  };

  const submitRename = (data) => {
    if (renamingId) {
      dispatch(updateFolder({ id: renamingId, data: { name: data.name } }));
      setRenamingId(null);
    }
  };

  const handleToggleVisibility = (e, folder) => {
    e.stopPropagation();
    // Use optional chaining or check property existence if API response structure varies
    const newStatus = !folder.isPublic;
    dispatch(updateFolder({ id: folder._id, data: { isPublic: newStatus } }));
    setContextMenu(null);
  };

  const openContextMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id, x: e.pageX, y: e.pageY });
  };

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Calculate Breadcrumbs 
  // This is tricky without full path API. We try our best from first child or stored state.
  let breadcrumbs = [];
  if (folderId) {
      if (currentFolder && currentFolder.path) {
          // If we have currentFolder state populated (e.g. from navigation)
          breadcrumbs = [...currentFolder.path, { _id: currentFolder._id, name: currentFolder.name }];
      } else if (folders.length > 0 && folders[0].path) {
          // Fallback to first child's path if available (works on refresh for non-empty folders)
           // The API response for child has 'path' which INCLUDES root but DOES NOT include the parent itself usually in these structures, 
           // OR it includes the full path to the child.
           // Doc says: "path": [{ "_id": "root_id", "name": "Root" }] for a child.
           // So the parent of the child is the current folder.
           // So breadcrumb is the child's path.
           // Wait, if I am in Folder A, and Folder A contains Folder B.
           // Folder B's path should be [Root, Folder A].
           // So if I take folders[0].path, that IS the breadcrumb to here!
           breadcrumbs = folders[0].path;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar handled by App layout */}
      
      <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full">
                <div className="space-y-1">
                    <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${!folderId ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <FaHome /> My Drive
                    </Link>
                    <div className="px-4 py-3 text-gray-400 text-sm font-medium flex items-center gap-3 cursor-not-allowed">
                        <span className="w-5 flex justify-center"><FaFolderOpen /></span> Shared (Coming Soon)
                    </div>
                    <div className="px-4 py-3 text-gray-400 text-sm font-medium flex items-center gap-3 cursor-not-allowed">
                         <span className="w-5 flex justify-center"><FaTrash /></span> Trash (Coming Soon)
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
            
            {/* Toolbar / Breadcrumbs */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Breadcrumbs */}
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
                    {folderId && breadcrumbs.length === 0 && <span className="text-gray-400 italic flex items-center gap-1"><FaChevronRight className="text-xs"/> ...</span>}
                </div>

                {/* Actions */}
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg text-sm"
                >
                    <FaPlus /> New Folder
                </button>
            </div>

            {/* Folder Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 min-h-[500px]">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-black rounded-full"></div>
                        <p>Loading your files...</p>
                    </div>
                ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-500 bg-red-50 rounded-xl p-8 border border-red-100">
                        <p>{error}</p>
                    </div>
                ) : folders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                            <FaFolderOpen size={40} />
                        </div>
                        <p className="text-lg font-medium text-gray-500">No folders here yet</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="text-black hover:underline font-medium">
                            Create one now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {folders.map((folder) => (
                            <div 
                                key={folder._id}
                                onClick={() => handleNavigate(folder)}
                                onContextMenu={(e) => openContextMenu(e, folder._id)}
                                className="group relative p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center bg-white"
                            >
                                <div className="text-yellow-400 mb-3 transform group-hover:scale-110 transition-transform">
                                    <FaFolder size={48} />
                                </div>
                                
                                {renamingId === folder._id ? (
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

                                {/* Context Menu Button (Visible on Hover/Mobile) */}
                                <button 
                                    onClick={(e) => openContextMenu(e, folder._id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-200"
                                >
                                    <FaEllipsisV size={12} />
                                </button>
                            </div>
                        ))}
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
        parentId={folderId} // Pass current folder ID as parent
      />

      {/* Context Menu */}
      {contextMenu && (
        <div 
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 w-48 py-1 overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
        >
            <button 
                onClick={(e) => startRenaming(e, folders.find(f => f._id === contextMenu.id))}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaPen className="text-gray-400"/> Rename
            </button>
            <button 
                onClick={(e) => handleToggleVisibility(e, folders.find(f => f._id === contextMenu.id))}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
                <FaGlobe className="text-gray-400"/> Toggle Visibility
            </button>
            <button 
                onClick={(e) => handleDelete(e, contextMenu.id)}
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

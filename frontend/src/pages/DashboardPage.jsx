import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getRootFolders, getFolderContents, createFolder, deleteFolder, updateFolder, setCurrentFolder } from '../store/slices/folderSlice';
import { getFilesByFolder, deleteFile, updateFile, uploadFile, clearFiles } from '../store/slices/fileSlice';
import { getMyShares, getSharedWithMe } from '../store/slices/shareSlice';
// import Navbar from '../components/Navbar';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadFileModal from '../components/UploadFileModal';
import FilePreviewModal from '../components/FilePreviewModal';
import FileStats from '../components/FileStats';
import Sidebar from '../components/dashboard/Sidebar';
import Toolbar from '../components/dashboard/Toolbar';
import EmptyState from '../components/dashboard/EmptyState';
import StatsModal from '../components/dashboard/StatsModal';
import ContextMenu from '../components/dashboard/ContextMenu';
import FolderGrid from '../components/dashboard/FolderGrid';
import FileGrid from '../components/dashboard/FileGrid';
import ShareList from '../components/dashboard/ShareList';
import ShareModal from '../components/dashboard/ShareModal';
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

    // Share State
    const { myShares, sharedWithMe, isLoading: isShareLoading } = useSelector((state) => state.share);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isFilePreviewOpen, setIsFilePreviewOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false); // Mobile Stats modal
    const [activeView, setActiveView] = useState('files'); // 'files' | 'stats' | 'my-shares' | 'shared-with-me'
    const [previewFile, setPreviewFile] = useState(null);

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareResource, setShareResource] = useState(null); // { resourceId, resourceType }

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

    // Fetch Data based on Active View and Folder ID
    useEffect(() => {
        if (user) {
            if (activeView === 'files') {
                if (folderId) {
                    dispatch(getFolderContents(folderId));
                    dispatch(getFilesByFolder(folderId));
                } else {
                    dispatch(getRootFolders()); // Restore root folder fetching
                    dispatch(setCurrentFolder(null));
                    dispatch(clearFiles());
                }
            } else if (activeView === 'my-shares') {
                dispatch(getMyShares());
            } else if (activeView === 'shared-with-me') {
                dispatch(getSharedWithMe());
            }
        }
    }, [dispatch, folderId, user, activeView]);


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
        setActiveView('files');
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

    const handleShare = (e, item, type) => {
        e.stopPropagation();
        setShareResource({
            resourceId: item._id,
            resourceType: type
        });
        setIsShareModalOpen(true);
        setContextMenu(null);
    };

    const handleAccessShare = (shareId) => {
        navigate(`/shares/${shareId}`);
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
    if (folderId && activeView === 'files') {
        if (currentFolder && currentFolder.path) {
            breadcrumbs = [...currentFolder.path, { _id: currentFolder._id, name: currentFolder.name }];
        } else if (folders.length > 0 && folders[0].path) {
            breadcrumbs = folders[0].path;
        }
    }

    const isLoading = isFolderLoading || (folderId && isFileLoading) || isShareLoading;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="flex flex-1 container mx-auto px-4 py-6 gap-6">

                {/* Sidebar */}
                <Sidebar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    folderId={folderId}
                    navigate={navigate}
                />

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0">

                    {/* Toolbar */}
                    {activeView === 'files' && (
                        <Toolbar
                            breadcrumbs={breadcrumbs}
                            folderId={folderId}
                            setIsUploadModalOpen={setIsUploadModalOpen}
                            setIsCreateModalOpen={setIsCreateModalOpen}
                            setIsStatsModalOpen={setIsStatsModalOpen}
                        />
                    )}

                    {/* Headers for other views */}
                    {activeView === 'my-shares' && <h1 className="text-2xl font-bold mb-4">My Shares</h1>}
                    {activeView === 'shared-with-me' && <h1 className="text-2xl font-bold mb-4">Shared with Me</h1>}
                    {activeView === 'stats' && <h1 className="text-2xl font-bold mb-4">Storage Analysis</h1>}


                    {/* Content Area */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1 min-h-[500px]">
                        {activeView === 'stats' ? (
                            <div className="h-full w-full">
                                <div className="h-full">
                                    <FileStats />
                                </div>
                            </div>
                        ) : activeView === 'my-shares' ? (
                            <ShareList shares={myShares} type="my-shares" />
                        ) : activeView === 'shared-with-me' ? (
                            <ShareList shares={sharedWithMe} type="shared-with-me" onAccess={handleAccessShare} />
                        ) : (
                            <>
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
                                    <EmptyState
                                        folderId={folderId}
                                        setIsCreateModalOpen={setIsCreateModalOpen}
                                        setIsUploadModalOpen={setIsUploadModalOpen}
                                    />
                                ) : (
                                    <div className="space-y-8">
                                        {folders.length > 0 && (
                                            <FolderGrid
                                                folders={folders}
                                                onNavigate={handleNavigate}
                                                onContextMenu={openContextMenu}
                                                renamingId={renamingId}
                                                submitRename={handleSubmit(submitRename)}
                                                register={register}
                                                setRenamingId={setRenamingId}
                                            />
                                        )}

                                        {files.length > 0 && (
                                            <FileGrid
                                                files={files}
                                                onFileClick={handleFileClick}
                                                onContextMenu={openContextMenu}
                                                renamingId={renamingId}
                                                submitRename={handleSubmit(submitRename)}
                                                register={register}
                                                setRenamingId={setRenamingId}
                                            />
                                        )}
                                    </div>
                                )}
                            </>
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

            <StatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
            />

            <FilePreviewModal
                isOpen={isFilePreviewOpen}
                onClose={() => setIsFilePreviewOpen(false)}
                file={previewFile}
            />

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                resourceId={shareResource?.resourceId}
                resourceType={shareResource?.resourceType}
            />

            {/* Context Menu */}
            <ContextMenu
                contextMenu={contextMenu}
                files={files}
                folders={folders}
                handleDownload={handleDownload}
                startRenaming={startRenaming}
                handleToggleVisibility={handleToggleVisibility}
                handleDelete={handleDelete}
                handleShare={handleShare}
            />
        </div>
    );
};

export default DashboardPage;

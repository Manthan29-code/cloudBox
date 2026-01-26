import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { accessShare, clearCurrentShare } from '../store/slices/shareSlice';
import PDFViewer from '../components/viewers/PDFViewer';
import DOCXViewer from '../components/viewers/DOCXViewer';
import { FaDownload, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const SharedResourcePage = () => {
    const { shareId } = useParams();
    const dispatch = useDispatch();
    const { currentShare, isLoading, error } = useSelector((state) => state.share);

    useEffect(() => {
        if (shareId) {
            dispatch(accessShare(shareId));
        }
        return () => {
            dispatch(clearCurrentShare());
        };
    }, [shareId, dispatch]);

    const handleDownload = () => {
        if (currentShare?.permissions?.download && currentShare?.cloudURL) {
            window.open(currentShare.cloudURL, '_blank');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-black rounded-full"></div>
                <p className="text-gray-500 font-medium">Accessing shared resource...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/dashboard" className="inline-block px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!currentShare) return null;

    const { resourceType, permissions, cloudURL, resourceId } = currentShare;
    // resourceId might be populated or just an ID strings depending on backend, but cloudURL is what matters for viewers.
    const fileName = resourceId?.originalName || "Shared Document";
    const mimeType = resourceId?.mimeType || "";
    // If backend doesn't send mimeType in accessShare response top level, we might need to rely on file extension or check if resourceId is populated full object

    // Helper to determine viewer
    // Note: The API response example shows `cloudURL` but doesn't explicitly show `mimeType` in `data`.
    // However, `resourceId` seems to be an object in some examples? 
    // "resourceId": "65a..." (string) in some, check API docs again.
    // API Docs Example:
    // "resourceId": "65a..."
    // "cloudURL": "..."
    // "resourceType": "file"

    // We might need to guess type from URL if mimeType isn't available.
    const isPDF = cloudURL?.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
    const isDOCX = cloudURL?.toLowerCase().endsWith('.docx') || mimeType.includes('wordprocessingml') || mimeType.includes('word');
    const isImage = cloudURL?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || mimeType.startsWith('image/');

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <FaArrowLeft />
                    </Link>
                    <div>
                        <h1 className="font-bold text-gray-800 truncate max-w-md" title={fileName}>
                            {fileName}
                        </h1>
                        <p className="text-xs text-gray-500">Shared with you</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {permissions.download && (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
                        >
                            <FaDownload /> Download
                        </button>
                    )}
                </div>
            </header>

            {/* Viewer Content */}
            <main className="flex-1 overflow-hidden relative">
                {isPDF ? (
                    <PDFViewer fileUrl={cloudURL} fileName={fileName} />
                ) : isDOCX ? (
                    <DOCXViewer fileUrl={cloudURL} fileName={fileName} />
                ) : isImage ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50 overflow-auto p-4">
                        <img src={cloudURL} alt={fileName} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                    </div>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-4">
                        <div className="text-6xl opacity-20">?</div>
                        <p>No preview available for this file type.</p>
                        {permissions.download && (
                            <button onClick={handleDownload} className="text-blue-600 hover:align-baseline underline">
                                Download to view
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SharedResourcePage;

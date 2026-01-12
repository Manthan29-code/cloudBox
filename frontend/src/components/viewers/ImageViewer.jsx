import React, { useState } from 'react';
import { FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

const ImageViewer = ({ fileUrl, fileName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scale, setScale] = useState(1.0);

    const handleImageLoad = () => {
        setIsLoading(false);
        setError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setError(true);
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 3.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    const resetZoom = () => {
        setScale(1.0);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-600 font-medium mb-4">Failed to load image</p>
                    <p className="text-sm text-gray-600">The image file may be corrupted or unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-900">
            {/* Zoom Controls */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-center gap-3 border-b border-gray-700">
                <button
                    onClick={zoomOut}
                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom Out"
                >
                    <FaSearchMinus />
                </button>

                <button
                    onClick={resetZoom}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium min-w-[80px]"
                    title="Reset Zoom"
                >
                    {Math.round(scale * 100)}%
                </button>

                <button
                    onClick={zoomIn}
                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    title="Zoom In"
                >
                    <FaSearchPlus />
                </button>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin h-12 w-12 border-4 border-gray-600 border-t-white rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading image...</p>
                    </div>
                )}

                <img
                    src={fileUrl}
                    alt={fileName}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="max-w-full h-auto shadow-2xl transition-transform duration-200"
                    style={{
                        transform: `scale(${scale})`,
                        display: isLoading ? 'none' : 'block',
                    }}
                />
            </div>
        </div>
    );
};

export default ImageViewer;

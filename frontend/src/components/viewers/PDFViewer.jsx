// import React, { useState, useEffect } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import { FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa';

// // Import PDF worker configuration
// import '../../utils/pdfWorker';

// const PDFViewer = ({ fileUrl, fileName }) => {
//     const [numPages, setNumPages] = useState(null);
//     const [pageNumber, setPageNumber] = useState(1);
//     const [scale, setScale] = useState(1.0);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [pdfBlob, setPdfBlob] = useState(null);

//     // Fetch PDF as blob to avoid CORS issues
//     useEffect(() => {
//         const fetchPDF = async () => {
//             try {
//                 setIsLoading(true);
//                 setPdfBlob(null); // Clear previous blob
//                 setError(null); // Clear previous error

//                 const response = await fetch(fileUrl);

//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch PDF: ${response.status}`);
//                 }

//                 const blob = await response.blob();
//                 setPdfBlob(blob);
//                 // The isLoading will be set to false by onDocumentLoadSuccess once the PDF is rendered
//             } catch (err) {
//                 console.error('Error fetching PDF:', err);
//                 setError('Failed to load PDF. Please try downloading the file instead.');
//                 setIsLoading(false); // Set to false on fetch error
//             }
//         };

//         if (fileUrl) {
//             fetchPDF();
//         }
//     }, [fileUrl]);

//     const onDocumentLoadSuccess = ({ numPages }) => {
//         setNumPages(numPages);
//         setIsLoading(false);
//         setError(null);
//     };

//     const onDocumentLoadError = (error) => {
//         console.error('Error loading PDF:', error);
//         setError('Failed to load PDF. The file may be corrupted.');
//         setIsLoading(false);
//     };

//     const goToPrevPage = () => {
//         setPageNumber((prev) => Math.max(prev - 1, 1));
//     };

//     const goToNextPage = () => {
//         setPageNumber((prev) => Math.min(prev + 1, numPages));
//     };

//     const zoomIn = () => {
//         setScale((prev) => Math.min(prev + 0.2, 3.0));
//     };

//     const zoomOut = () => {
//         setScale((prev) => Math.max(prev - 0.2, 0.5));
//     };

//     const fitToWidth = () => {
//         setScale(1.0);
//     };

//     if (error) {
//         return (
//             <div className="flex items-center justify-center h-full">
//                 <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
//                     <p className="text-red-600 font-medium mb-4">{error}</p>
//                     <p className="text-sm text-gray-600">Please try downloading the file instead.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col h-full bg-gray-900">
//             {/* Controls Bar */}
//             <div className="bg-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3 border-b border-gray-700">
//                 {/* Page Navigation */}
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={goToPrevPage}
//                         disabled={pageNumber <= 1}
//                         className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                         title="Previous Page"
//                     >
//                         <FaChevronLeft />
//                     </button>

//                     <span className="text-white text-sm font-medium px-3">
//                         Page {pageNumber} of {numPages || '...'}
//                     </span>

//                     <button
//                         onClick={goToNextPage}
//                         disabled={pageNumber >= numPages}
//                         className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//                         title="Next Page"
//                     >
//                         <FaChevronRight />
//                     </button>
//                 </div>

//                 {/* Zoom Controls */}
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={zoomOut}
//                         className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                         title="Zoom Out"
//                     >
//                         <FaSearchMinus />
//                     </button>

//                     <span className="text-white text-sm font-medium px-3 min-w-[60px] text-center">
//                         {Math.round(scale * 100)}%
//                     </span>

//                     <button
//                         onClick={zoomIn}
//                         className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                         title="Zoom In"
//                     >
//                         <FaSearchPlus />
//                     </button>

//                     <button
//                         onClick={fitToWidth}
//                         className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                         title="Fit to Width"
//                     >
//                         <FaExpand />
//                     </button>
//                 </div>
//             </div>

//             {/* PDF Document Container */}
//             <div className="flex-1 overflow-auto bg-gray-900 flex items-start justify-center p-4">
//                 {isLoading && (
//                     <div className="flex flex-col items-center justify-center py-20">
//                         <div className="animate-spin h-12 w-12 border-4 border-gray-600 border-t-white rounded-full mb-4"></div>
//                         <p className="text-gray-400">Loading PDF...</p>
//                     </div>
//                 )}

//                 {pdfBlob && (
//                     <Document
//                         file={pdfBlob}
//                         onLoadSuccess={onDocumentLoadSuccess}
//                         onLoadError={onDocumentLoadError}
//                         loading=""
//                         options={{
//                             cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
//                             cMapPacked: true,
//                             standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
//                         }}
//                         className="flex flex-col items-center gap-4"
//                     >
//                         {/* Show all pages */}
//                         {!isLoading && numPages && (
//                             Array.from(new Array(numPages), (el, index) => (
//                                 <div key={`page_${index + 1}`} className="shadow-2xl mb-4">
//                                     <Page
//                                         pageNumber={index + 1}
//                                         scale={scale}
//                                         renderTextLayer={true}
//                                         renderAnnotationLayer={true}
//                                         className="bg-white"
//                                     />
//                                 </div>
//                             ))
//                         )}
//                     </Document>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default PDFViewer;


//cloude
import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa';

// Import react-pdf CSS for text and annotation layers
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Import PDF worker configuration
import '../../utils/pdfWorker';

const PDFViewer = ({ fileUrl, fileName }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    // Memoize options to prevent unnecessary reloads
    const documentOptions = useMemo(() => ({
        cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }), []);

    // Fetch PDF and create object URL to avoid CORS and ArrayBuffer issues
    useEffect(() => {
        let objectUrl = null;

        const fetchPDF = async () => {
            try {
                setIsLoading(true);
                setPdfUrl(null);
                setError(null);

                // Direct fetch from Cloudinary
                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch PDF: ${response.status}`);
                }

                const blob = await response.blob();

                if (blob.size === 0) {
                    throw new Error('PDF file is empty');
                }

                // Create object URL from blob - this is stable and won't be garbage collected
                objectUrl = URL.createObjectURL(blob);
                setPdfUrl(objectUrl);

            } catch (err) {
                console.error('Error fetching PDF:', err);
                setError(err.message || 'Failed to load PDF');
                setIsLoading(false);
            }
        };

        if (fileUrl) {
            fetchPDF();
        }

        // Cleanup: revoke object URL when component unmounts or fileUrl changes
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fileUrl]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF. The file may be corrupted.');
        setIsLoading(false);
    };

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 3.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    const fitToWidth = () => {
        setScale(1.0);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <p className="text-sm text-gray-600 mb-4">Please try downloading the file instead.</p>
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Download PDF
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-900">
            {/* Controls Bar */}
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronLeft />
                    </button>

                    <span className="text-white text-sm font-medium px-3">
                        Page {pageNumber} of {numPages || '...'}
                    </span>

                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <FaChevronRight />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <FaSearchMinus />
                    </button>

                    <span className="text-white text-sm font-medium px-3 min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={zoomIn}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <FaSearchPlus />
                    </button>

                    <button
                        onClick={fitToWidth}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <FaExpand />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-900 flex items-start justify-center p-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-gray-600 border-t-white rounded-full mb-4"></div>
                        <p className="text-gray-400">Loading PDF...</p>
                    </div>
                )}

                {pdfUrl && (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading=""
                        options={documentOptions}
                        className="flex flex-col items-center gap-4"
                    >
                        {!isLoading && numPages && (
                            Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_${index + 1}`} className="shadow-2xl mb-4">
                                    <Page
                                        pageNumber={index + 1}
                                        scale={scale}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        className="bg-white"
                                    />
                                </div>
                            ))
                        )}
                    </Document>
                )}
            </div>
        </div>
    );
};

export default PDFViewer;
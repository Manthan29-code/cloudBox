import React, { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import styles from './DOCXViewer.module.css';

const DOCXViewer = ({ fileUrl, fileName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadDocx = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch the DOCX file from Cloudinary
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch document');
                }

                const blob = await response.blob();

                // Clear previous content
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                // Render DOCX to the container
                await renderAsync(blob, containerRef.current, null, {
                    className: 'docx-preview-container',
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    ignoreLastRenderedPageBreak: false,
                    experimental: false,
                    trimXmlDeclaration: true,
                    useBase64URL: false,
                    useMathMLPolyfill: false,
                    renderChanges: false,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderEndnotes: true,
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading DOCX:', err);
                setError('Failed to load document. The file may be corrupted or in an unsupported format.');
                setIsLoading(false);
            }
        };

        if (fileUrl) {
            loadDocx();
        }
    }, [fileUrl]);

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorBox}>
                    <p className={styles.errorTitle}>{error}</p>
                    <p className={styles.errorMessage}>Please try downloading the file instead.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isLoading && (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Loading document...</p>
                </div>
            )}

            {/* DOCX Container - Responsive Design */}
            <div className={styles.contentWrapper}>
                <div className={styles.documentContainer}>
                    <div
                        ref={containerRef}
                        className={styles.docxWrapper}
                    />
                </div>
            </div>
        </div>
    );
};

export default DOCXViewer;

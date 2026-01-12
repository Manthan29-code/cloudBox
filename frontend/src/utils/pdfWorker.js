// PDF.js worker configuration for react-pdf
import { pdfjs } from 'react-pdf';

// Use unpkg CDN which has all PDF.js versions (cdnjs sometimes missing versions)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default pdfjs;

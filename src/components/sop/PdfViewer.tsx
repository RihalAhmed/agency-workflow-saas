"use client";

import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { SopSheet } from "./SopSheet";
import { Loader2, AlertCircle } from "lucide-react";

// Set worker source for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    setError(err.message || "Failed to load document");
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-4">
      {error && (
        <SopSheet className="flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="font-medium text-center">Failed to load document</p>
          <p className="text-sm opacity-80">{error}</p>
        </SopSheet>
      )}

      {!error && (
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <SopSheet className="flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading PDF...</p>
            </SopSheet>
          }
        >
          {numPages && Array.from(new Array(numPages), (el, index) => (
            <LazyPdfPage key={`page_${index + 1}`} pageNumber={index + 1} containerWidth={containerWidth} />
          ))}
        </Document>
      )}
    </div>
  );
}

function LazyPdfPage({ pageNumber, containerWidth }: { pageNumber: number, containerWidth: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || isVisible) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { rootMargin: '800px' });
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [isVisible]);

  // The container already has padding from the parent SopViewer, so we can use the full containerWidth
  // to maximize the size and readability of the PDF text.
  const pageWidth = containerWidth > 0 ? containerWidth : undefined;

  return (
    <div ref={containerRef} className="w-full flex justify-center mb-8">
      {isVisible ? (
        <div className="shadow-lg ring-1 ring-black/5 bg-white text-black">
          <Page 
            pageNumber={pageNumber} 
            width={pageWidth}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            loading={
              <div className="w-full h-[800px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              </div>
            }
          />
        </div>
      ) : (
        <div 
          className="shadow-sm ring-1 ring-black/5 bg-white flex flex-col items-center justify-center text-slate-300"
          style={{ width: pageWidth ? `${pageWidth}px` : '100%', height: '800px' }}
        >
          <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-20" />
          <span className="text-sm font-medium">Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
}

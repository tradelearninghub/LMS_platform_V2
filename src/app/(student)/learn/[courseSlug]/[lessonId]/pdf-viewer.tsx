"use client";

import { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPdfJs = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.pdfjsLib) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve();
          } else {
            reject(new Error("PDF.js failed to load"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load PDF viewer library"));
        document.body.appendChild(script);
      });
    };

    const renderPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadPdfJs();
        if (!isMounted) return;

        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        setNumPages(pdf.numPages);
        if (canvasContainerRef.current) {
          canvasContainerRef.current.innerHTML = "";
        }

        // Render each page to a canvas for native mobile and desktop scrolling
        for (let i = 1; i <= pdf.numPages; i++) {
          if (!isMounted) return;
          const page = await pdf.getPage(i);

          const containerWidth = canvasContainerRef.current?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 600);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(containerWidth - 16, 800);
          const scale = targetWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale: Math.max(scale, 1) });

          const canvas = document.createElement("canvas");
          canvas.className = "max-w-full h-auto mx-auto shadow-sm rounded-lg mb-4 bg-white block border border-slate-200";
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context && canvasContainerRef.current) {
            canvasContainerRef.current.appendChild(canvas);
            await page.render({ canvasContext: context, viewport }).promise;
          }
        }
        setLoading(false);
      } catch (err: any) {
        console.error("PDF canvas render error:", err);
        if (isMounted) {
          setError("Rendering via fallback viewer");
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Scroll listener for progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / totalScroll) * 100));
        setScrollProgress(progress);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full border rounded-xl overflow-hidden bg-card shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Scroll Progress Bar */}
      <div className="w-full bg-border h-1.5 relative">
        <div
          className="bg-primary h-full transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header bar with security notice */}
      <div className="px-4 py-3 bg-muted/40 border-b flex items-center justify-between text-xs text-muted-foreground select-none flex-wrap gap-2">
        <span className="font-semibold text-foreground truncate max-w-xs">{title}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-medium">
          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Protected Content • {numPages > 0 ? `${numPages} Pages` : "PDF Document"}
        </span>
      </div>

      {/* Embedded PDF Viewer Container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[500px] max-h-[80vh] overflow-y-auto relative bg-slate-100 p-2 sm:p-4 select-none"
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Rendering PDF document...</p>
          </div>
        )}

        {/* Canvas container for cross-device mobile & desktop rendering */}
        <div ref={canvasContainerRef} className="w-full max-w-3xl mx-auto" />

        {/* Fallback viewer if PDF.js is unavailable */}
        {error && (
          <div className="w-full h-full min-h-[500px]">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-[600px] border-0 rounded-lg bg-white"
              title={title}
            />
          </div>
        )}
      </div>

      {/* Mobile helper action */}
      <div className="px-4 py-2.5 bg-slate-50 border-t flex items-center justify-between text-xs text-slate-600">
        <span>Protected PDF Access</span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <span>Open Full View</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  );
}

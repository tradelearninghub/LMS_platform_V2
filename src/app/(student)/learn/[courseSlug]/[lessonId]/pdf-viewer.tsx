"use client";

import { useEffect, useRef, useState } from "react";

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

export function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll listener to update progress bar
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

  // Prevent right-click / context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-card" onContextMenu={handleContextMenu}>
      {/* Scroll Progress Bar */}
      <div className="w-full bg-border h-2 relative">
        <div
          className="bg-accent h-full transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Header bar with security notice */}
      <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between text-xs text-muted-foreground select-none">
        <span className="font-medium truncate text-foreground">{title} (Protected PDF)</span>
        <span className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Protected content • Printing & downloads disabled
        </span>
      </div>

      {/* Embedded PDF Viewer */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[600px] h-[75vh] overflow-y-auto relative bg-neutral-900 select-none"
        style={{
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}
      >
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    </div>
  );
}

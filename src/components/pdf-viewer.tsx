"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { PreviewThumbnails } from "./preview-thumbnails";
import { Skeleton } from "./ui/skeleton";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

interface PDFViewerProps {
  file: string;
  pageNumber: number;
  numPages: number;
  onLoadSuccess: (numPages: number) => void;
  onPageChange: (page: number) => void;
}

function PDFSkeleton({ containerWidth }: { containerWidth: number }) {
  const slideWidth = containerWidth ? containerWidth - 32 : 600;
  const slideHeight = slideWidth * 0.75; // 4:3 aspect ratio
  const thumbnailWidth = 120;
  const thumbnailHeight = thumbnailWidth * 0.75;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main slide skeleton */}
      <Skeleton
        className="rounded-lg"
        style={{ width: slideWidth, height: slideHeight }}
      />

      {/* Thumbnail skeletons */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="rounded"
            style={{ width: thumbnailWidth, height: thumbnailHeight }}
          />
        ))}
      </div>
    </div>
  );
}

export function PDFViewer({
  file,
  pageNumber,
  numPages,
  onLoadSuccess,
  onPageChange,
}: PDFViewerProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    });
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function handleDocumentLoadSuccess({ numPages }: { numPages: number }) {
    onLoadSuccess(numPages);
  }

  if (!isClient) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full min-h-0 overflow-auto flex flex-col items-center bg-stone-50 p-4 gap-4"
      >
        <PDFSkeleton containerWidth={containerWidth} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-0 overflow-auto flex flex-col items-center bg-stone-50 p-4 gap-4"
    >
      {/* Current Slide */}
      <Document
        file={file}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={<PDFSkeleton containerWidth={containerWidth} />}
        error={<div className="text-red-500 text-sm">Failed to load PDF</div>}
      >
        <Page
          pageNumber={pageNumber}
          width={containerWidth ? containerWidth - 32 : undefined}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<PDFSkeleton containerWidth={containerWidth} />}
        />
      </Document>

      <PreviewThumbnails
        file={file}
        pageNumber={pageNumber}
        numPages={numPages}
        containerWidth={containerWidth}
        onPageChange={onPageChange}
      />
    </div>
  );
}

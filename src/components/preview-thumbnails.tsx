"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

interface PreviewThumbnailsProps {
  file: string;
  pageNumber: number;
  numPages: number;
  containerWidth: number;
  onPageChange: (page: number) => void;
}

export function PreviewThumbnails({
  file,
  pageNumber,
  numPages,
  containerWidth,
  onPageChange,
}: PreviewThumbnailsProps) {
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  const previewPages = [pageNumber - 1, pageNumber + 1, pageNumber + 2];
  const thumbnailWidth = containerWidth ? (containerWidth - 48) / 3 : 100;

  function handlePageLoadSuccess(page: number) {
    setLoadedPages((prev) => new Set(prev).add(page));
  }

  if (numPages <= 1) {
    return null;
  }

  return (
    <div className="flex gap-2 pt-3 border-t border-stone-200 w-full">
      {previewPages.map((previewPage, index) => {
        const isValidPage = previewPage >= 1 && previewPage <= numPages;

        if (!isValidPage) {
          return (
            <div
              key={`placeholder-${index}`}
              className="flex-1 rounded border border-dashed border-stone-200 bg-stone-100"
              style={{ aspectRatio: "16/9" }}
            />
          );
        }

        const isLoaded = loadedPages.has(previewPage);

        return (
          <button
            key={previewPage}
            onClick={() => onPageChange(previewPage)}
            className="relative group flex-1 rounded border border-stone-300 hover:border-stone-400 overflow-hidden transition-colors bg-white"
          >
            {!isLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-stone-100 z-10"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
                  <span className="text-xs text-stone-400">Loading</span>
                </div>
              </div>
            )}
            <Document file={file}>
              <Page
                pageNumber={previewPage}
                width={thumbnailWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={() => handlePageLoadSuccess(previewPage)}
              />
            </Document>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <span className="absolute bottom-1 right-1 text-xs bg-stone-800/70 text-white px-1.5 py-0.5 rounded">
              {previewPage}
            </span>
          </button>
        );
      })}
    </div>
  );
}

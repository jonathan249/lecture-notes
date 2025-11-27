"use client";

import Link from "next/link";
import { ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportNotesToPDF } from "@/lib/export-notes";

interface HeaderProps {
  pageNumber: number;
  numPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  lectureName?: string;
  notes?: Record<number, string>;
  onExport?: () => void;
}

export function Header({
  pageNumber,
  numPages,
  onPageChange,
  className,
  lectureName,
  notes,
}: HeaderProps) {
  function goToPrevPage() {
    onPageChange(Math.max(pageNumber - 1, 1));
  }

  function goToNextPage() {
    onPageChange(Math.min(pageNumber + 1, numPages));
  }

  async function handleExport() {
    if (!notes) return;
    await exportNotesToPDF({
      notes,
      lectureName: lectureName || "Lecture Notes",
      className,
      numPages,
    });
  }

  return (
    <header className="flex-none flex items-center px-4 py-3 bg-stone-100 border-b border-stone-200">
      {/* Left section - Breadcrumb */}
      <div className="flex items-center gap-1 text-sm min-w-0 shrink-0">
        <Link
          href="/"
          className="text-stone-500 hover:text-stone-700 transition-colors"
        >
          Classes
        </Link>
        {className && (
          <>
            <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-stone-500 truncate max-w-[200px]">
              {className}
            </span>
          </>
        )}
        {lectureName && (
          <>
            <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
            <span className="text-stone-700 font-medium truncate max-w-[150px]">
              {lectureName}
            </span>
          </>
        )}
      </div>

      {/* Center section - PDF controls */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
        >
          ← Prev
        </Button>
        <span className="text-sm text-stone-600">
          Slide {pageNumber} of {numPages || "–"}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
        >
          Next →
        </Button>
      </div>

      {/* Right section - Export button */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {notes && (
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export Notes
          </Button>
        )}
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { Header } from "@/components/header";
import { PDFViewer } from "@/components/pdf-viewer";
import { Note } from "@/components/note";
import { AIChat } from "@/components/ai-chat";
import { getLecture, getClass, updateLecture } from "@/lib/db";
import type { Lecture, Class } from "@/types";

interface LecturePageProps {
  params: Promise<{
    classId: string;
    lectureId: string;
  }>;
}

export default function LecturePage({ params }: LecturePageProps) {
  const { classId, lectureId } = use(params);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [lectureData, classInfo] = await Promise.all([
          getLecture(lectureId),
          getClass(classId),
        ]);
        if (lectureData) {
          setLecture(lectureData);
          setNotes(lectureData.notes || {});
        }
        if (classInfo) {
          setClassData(classInfo);
        }
      } catch (error) {
        console.error("Failed to load lecture:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [classId, lectureId]);

  async function handleNoteChange(content: string) {
    const updatedNotes = { ...notes, [pageNumber]: content };
    setNotes(updatedNotes);

    // Persist to IndexedDB
    if (lecture) {
      try {
        await updateLecture(lecture.id, { notes: updatedNotes });
      } catch (error) {
        console.error("Failed to save note:", error);
      }
    }
  }

  if (isLoading) {
    return (
      <main className="h-screen w-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-500">Loading lecture...</p>
      </main>
    );
  }

  if (!lecture) {
    return (
      <main className="h-screen w-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-500">Lecture not found</p>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-stone-100 text-stone-900 flex flex-col">
      <Header
        pageNumber={pageNumber}
        numPages={numPages}
        onPageChange={setPageNumber}
        className={classData?.name}
        lectureName={lecture.name}
        notes={notes}
      />
      <div className="flex-1 min-h-0 grid grid-cols-2">
        <PDFViewer
          file={lecture.pdfUrl}
          pageNumber={pageNumber}
          numPages={numPages}
          onLoadSuccess={setNumPages}
          onPageChange={setPageNumber}
        />
        <Note
          content={notes[pageNumber] || ""}
          onChange={handleNoteChange}
          pageNumber={pageNumber}
        />
      </div>

      <AIChat
        className={classData?.name}
        lectureName={lecture.name}
        currentSlide={pageNumber}
        totalSlides={numPages}
        currentNote={notes[pageNumber]}
        allNotes={notes}
      />
    </main>
  );
}

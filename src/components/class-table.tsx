"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EllipsisVertical, Plus, Trash2 } from "lucide-react";
import { CreateClassModal } from "@/components/create-class-modal";
import { CreateLectureModal } from "@/components/create-lecture-modal";
import { getAllClasses, getLecturesByClass, deleteClass } from "@/lib/db";
import type { Class, Lecture } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ClassTableProps {
  initialClasses?: Class[];
}

export function ClassTable({ initialClasses = [] }: ClassTableProps) {
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(initialClasses.length === 0);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Record<string, Lecture[]>>({});
  const [loadingLectures, setLoadingLectures] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  useEffect(() => {
    if (initialClasses.length === 0) {
      loadClasses();
    }
  }, [initialClasses.length]);

  async function loadClasses() {
    try {
      const data = await getAllClasses();
      setClasses(
        data.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
    } catch (error) {
      console.error("Failed to load classes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClassToggle(classId: string) {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classId);

    // Load lectures if not already loaded
    if (!lectures[classId]) {
      setLoadingLectures(classId);
      try {
        const classLectures = await getLecturesByClass(classId);
        setLectures((prev) => ({ ...prev, [classId]: classLectures }));
      } catch (error) {
        console.error("Failed to load lectures:", error);
      } finally {
        setLoadingLectures(null);
      }
    }
  }

  function handleClassCreated(newClass: Class) {
    setClasses((prev) => [newClass, ...prev]);
  }

  function handleLectureCreated(classId: string, newLecture: Lecture) {
    setLectures((prev) => ({
      ...prev,
      [classId]: [...(prev[classId] || []), newLecture],
    }));
  }

  async function handleDeleteClass() {
    if (!classToDelete) return;

    try {
      await deleteClass(classToDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      // Clean up lectures state
      setLectures((prev) => {
        const newLectures = { ...prev };
        delete newLectures[classToDelete.id];
        return newLectures;
      });
      // Close expanded if it was the deleted class
      if (expandedClassId === classToDelete.id) {
        setExpandedClassId(null);
      }
    } catch (error) {
      console.error("Failed to delete class:", error);
    } finally {
      setClassToDelete(null);
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-stone-900">
            Lecture Notes
          </h1>
          <CreateClassModal onClassCreated={handleClassCreated} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto py-6">
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-12 text-center text-stone-500">
              <p>Loading classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="px-4 py-12 text-center text-stone-500">
              <p>No classes yet. Create your first class to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50 hover:bg-stone-50">
                  <TableHead>Class Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => {
                  const classLectures = lectures[cls.id] || [];
                  const isExpanded = expandedClassId === cls.id;
                  const isLoadingLectures = loadingLectures === cls.id;

                  return (
                    <>
                      <TableRow
                        key={cls.id}
                        className="cursor-pointer"
                        onClick={() => handleClassToggle(cls.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium hover:text-purple-500">
                              {cls.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-stone-600">
                          {cls.year}
                        </TableCell>
                        <TableCell className="text-stone-500">
                          {cls.updatedAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <EllipsisVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <CreateLectureModal
                                classId={cls.id}
                                onLectureCreated={(lecture) =>
                                  handleLectureCreated(cls.id, lecture)
                                }
                                trigger={
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Lecture
                                  </DropdownMenuItem>
                                }
                              />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={() => setClassToDelete(cls)}
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-600 focus:text-red-600" />
                                Delete Class
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Lectures Row */}
                      <TableRow
                        key={`${cls.id}-lectures`}
                        className={`hover:bg-transparent border-0 ${
                          isExpanded ? "" : "hidden"
                        }`}
                      >
                        <TableCell colSpan={4} className="p-0">
                          <div className="bg-stone-50 border-t border-stone-100">
                            {isLoadingLectures ? (
                              <div className="p-4 text-sm text-stone-500">
                                Loading lectures...
                              </div>
                            ) : classLectures.length === 0 ? (
                              <div className="p-4 text-sm text-stone-500">
                                No lectures yet. Add your first lecture.
                              </div>
                            ) : (
                              <ul className="py-1">
                                {classLectures.map((lecture) => (
                                  <li key={lecture.id}>
                                    <Link
                                      href={`/class/${cls.id}/lecture/${lecture.id}`}
                                      className="flex items-center gap-2 px-6 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-purple-600 transition-colors group"
                                    >
                                      <span className="group-hover:underline">
                                        {lecture.name}
                                      </span>
                                      <span className="text-stone-400 ">
                                        Updated:{" "}
                                        {new Date(
                                          lecture.updatedAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!classToDelete}
        onOpenChange={() => setClassToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{classToDelete?.name}&quot;?
              This will also delete all lectures in this class. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

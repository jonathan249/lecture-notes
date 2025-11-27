"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLecture } from "@/lib/db";
import type { Lecture } from "@/types";

interface CreateLectureModalProps {
  classId: string;
  onLectureCreated?: (newLecture: Lecture) => void;
  trigger?: React.ReactNode;
}

export function CreateLectureModal({
  classId,
  onLectureCreated,
  trigger,
}: CreateLectureModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !pdfFile) return;

    setIsSubmitting(true);
    try {
      // Convert file to base64 data URL for IndexedDB storage
      const pdfDataUrl = await fileToDataUrl(pdfFile);

      const newLecture = await createLecture({
        classId,
        name: name.trim(),
        pdfUrl: pdfDataUrl,
        notes: {},
      });

      setName("");
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setOpen(false);
      onLectureCreated?.(newLecture);
    } catch (error) {
      console.error("Failed to create lecture:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" variant="outline">
            + New Lecture
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
            <DialogDescription>
              Upload a PDF and give your lecture a name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lecture-name">Lecture Name</Label>
              <Input
                id="lecture-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Week 1 - Introduction"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <Input
                id="pdf-file"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                className="cursor-pointer"
              />
              {pdfFile && (
                <p className="text-xs text-stone-500">
                  Selected: {pdfFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !pdfFile}
            >
              {isSubmitting ? "Uploading..." : "Create Lecture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

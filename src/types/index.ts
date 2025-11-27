export interface Class {
  id: string;
  name: string;
  year: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecture {
  id: string;
  classId: string;
  name: string;
  pdfUrl: string;
  notes: Record<number, string>;
  createdAt: Date;
  updatedAt: Date;
}

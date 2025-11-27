import type { Class, Lecture } from "@/types";

const DB_NAME = "lecture-notes-db";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Classes store
      if (!database.objectStoreNames.contains("classes")) {
        const classStore = database.createObjectStore("classes", {
          keyPath: "id",
        });
        classStore.createIndex("name", "name", { unique: false });
        classStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Lectures store
      if (!database.objectStoreNames.contains("lectures")) {
        const lectureStore = database.createObjectStore("lectures", {
          keyPath: "id",
        });
        lectureStore.createIndex("classId", "classId", { unique: false });
        lectureStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

// Class operations
export async function createClass(
  data: Omit<Class, "id" | "createdAt" | "updatedAt">
): Promise<Class> {
  const database = await getDB();
  const newClass: Class = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["classes"], "readwrite");
    const store = transaction.objectStore("classes");
    const request = store.add(newClass);

    request.onsuccess = () => resolve(newClass);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllClasses(): Promise<Class[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["classes"], "readonly");
    const store = transaction.objectStore("classes");
    const request = store.getAll();

    request.onsuccess = () => {
      const classes = request.result.map((cls: Class) => ({
        ...cls,
        createdAt: new Date(cls.createdAt),
        updatedAt: new Date(cls.updatedAt),
      }));
      resolve(classes);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getClass(id: string): Promise<Class | undefined> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["classes"], "readonly");
    const store = transaction.objectStore("classes");
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve({
          ...request.result,
          createdAt: new Date(request.result.createdAt),
          updatedAt: new Date(request.result.updatedAt),
        });
      } else {
        resolve(undefined);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteClass(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["classes"], "readwrite");
    const store = transaction.objectStore("classes");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Lecture operations
export async function createLecture(
  data: Omit<Lecture, "id" | "createdAt" | "updatedAt">
): Promise<Lecture> {
  const database = await getDB();
  const newLecture: Lecture = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["lectures"], "readwrite");
    const store = transaction.objectStore("lectures");
    const request = store.add(newLecture);

    request.onsuccess = () => resolve(newLecture);
    request.onerror = () => reject(request.error);
  });
}

export async function getLecturesByClass(classId: string): Promise<Lecture[]> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["lectures"], "readonly");
    const store = transaction.objectStore("lectures");
    const index = store.index("classId");
    const request = index.getAll(classId);

    request.onsuccess = () => {
      const lectures = request.result.map((lecture: Lecture) => ({
        ...lecture,
        createdAt: new Date(lecture.createdAt),
        updatedAt: new Date(lecture.updatedAt),
      }));
      resolve(lectures);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getLecture(id: string): Promise<Lecture | undefined> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["lectures"], "readonly");
    const store = transaction.objectStore("lectures");
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve({
          ...request.result,
          createdAt: new Date(request.result.createdAt),
          updatedAt: new Date(request.result.updatedAt),
        });
      } else {
        resolve(undefined);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function updateLecture(
  id: string,
  data: Partial<Omit<Lecture, "id" | "createdAt">>
): Promise<Lecture> {
  const database = await getDB();
  const existing = await getLecture(id);

  if (!existing) {
    throw new Error("Lecture not found");
  }

  const updated: Lecture = {
    ...existing,
    ...data,
    updatedAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["lectures"], "readwrite");
    const store = transaction.objectStore("lectures");
    const request = store.put(updated);

    request.onsuccess = () => resolve(updated);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLecture(id: string): Promise<void> {
  const database = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["lectures"], "readwrite");
    const store = transaction.objectStore("lectures");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * IndexedDB helper for storing and retrieving program document blobs.
 * Enables persistent local storage of PDFs, presentations, images, and files
 * without size limitations of localStorage.
 */

const DB_NAME = 'GoldenMondayDocStorage_v1';
const STORE_NAME = 'document_blobs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocumentBlob(id: string, file: Blob | File): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save blob to IndexedDB:', err);
  }
}

export async function getDocumentBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteDocumentBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete blob from IndexedDB:', err);
  }
}

export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 ባይት';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['ባይት', 'ኪ.ባ (KB)', 'ሜ.ባ (MB)', 'ጊ.ባ (GB)'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function detectDocType(fileName: string, mime?: string): 'pdf' | 'presentation' | 'word' | 'excel' | 'image' | 'link' | 'other' {
  const name = fileName.toLowerCase();
  if (name.endsWith('.pdf') || mime?.includes('pdf')) return 'pdf';
  if (name.endsWith('.pptx') || name.endsWith('.ppt') || mime?.includes('presentation') || mime?.includes('powerpoint')) return 'presentation';
  if (name.endsWith('.docx') || name.endsWith('.doc') || mime?.includes('word') || mime?.includes('document')) return 'word';
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || mime?.includes('spreadsheet') || mime?.includes('excel')) return 'excel';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp') || mime?.includes('image')) return 'image';
  return 'other';
}

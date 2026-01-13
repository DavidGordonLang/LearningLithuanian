// src/utils/ttsCache.js

const DB_NAME = "zodis_tts_cache_v1";
const STORE = "audio";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "key" });
          store.createIndex("ts", "ts", { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export function isIDBAvailable() {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

export async function ttsIdbGet(key) {
  if (!isIDBAvailable()) return null;

  const db = await openDB();
  try {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    const item = await new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    await txDone(tx);
    return item?.blob || null;
  } finally {
    try {
      db.close();
    } catch {}
  }
}

export async function ttsIdbSet(key, blob, { maxEntries = 200 } = {}) {
  if (!isIDBAvailable()) return;

  const db = await openDB();
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    const item = {
      key,
      blob,
      ts: Date.now(),
      size: blob?.size || 0,
    };

    await new Promise((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await txDone(tx);

    // Prune in a separate transaction (keep it simple + reliable)
    await pruneOldest(db, { maxEntries });
  } finally {
    try {
      db.close();
    } catch {}
  }
}

async function pruneOldest(db, { maxEntries }) {
  if (!maxEntries || maxEntries <= 0) return;

  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const idx = store.index("ts");

  const keys = await new Promise((resolve, reject) => {
    const out = [];
    const req = idx.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return resolve(out);
      out.push(cursor.primaryKey);
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });

  // If within limit, no deletions
  const excess = keys.length - maxEntries;
  if (excess <= 0) {
    await txDone(tx);
    return;
  }

  // Oldest first (index is ascending by ts)
  const toDelete = keys.slice(0, excess);

  for (const k of toDelete) {
    await new Promise((resolve, reject) => {
      const req = store.delete(k);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  await txDone(tx);
}

// src/stores/phraseStore.js
import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

/* --------------------------- Helpers --------------------------- */
const loadRows = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const saveRows = (rows) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows));
  } catch (err) {
    console.error("Failed saving rows", err);
  }
};

const ensureIdTs = (r) => {
  const out = { ...r };
  if (!out._id || typeof out._id !== "string") out._id = Math.random().toString(36).slice(2);
  if (!out._ts || typeof out._ts !== "number") out._ts = Date.now();
  return out;
};

/* ------------------------ Zustand Store ------------------------ */

export const usePhraseStore = create((set, get) => ({
  // initial state
  phrases: loadRows(),

  // ensure each row has an ID and timestamp
  _migrateRows: () => {
    const rows = get().phrases || [];
    let changed = false;

    const migrated = rows.map((r) => {
      const beforeId = r?._id;
      const beforeTs = r?._ts;
      const next = ensureIdTs(r);
      if (beforeId !== next._id || beforeTs !== next._ts) changed = true;
      return next;
    });

    if (changed) {
      set({ phrases: migrated });
      saveRows(migrated);
    }
  },

  // replace entire list
  setPhrases: (update) => {
    set((state) => {
      const next = typeof update === "function" ? update(state.phrases) : update;
      const safe = Array.isArray(next) ? next : [];
      saveRows(safe);
      return { phrases: safe };
    });
  },

  // add entry
  addPhrase: (row) =>
    set((state) => {
      const safeRow = ensureIdTs(row);
      const next = [safeRow, ...state.phrases];
      saveRows(next);
      return { phrases: next };
    }),

  // update a phrase by index (existing behaviour)
  saveEditedPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) =>
        i === index ? { ...ensureIdTs(r), ...updated, _ts: r._ts || Date.now() } : r
      );
      saveRows(next);
      return { phrases: next };
    }),

  // remove phrase by index
  removePhrase: (index) =>
    set((state) => {
      const next = state.phrases.filter((_, i) => i !== index);
      saveRows(next);
      return { phrases: next };
    }),

  // PATCH by _id (for async enrich)
  patchPhraseById: (id, patch) =>
    set((state) => {
      if (!id) return { phrases: state.phrases };

      const next = state.phrases.map((r) => {
        if ((r?._id ?? null) !== id) return r;
        return { ...r, ...patch };
      });

      saveRows(next);
      return { phrases: next };
    }),
}));

// Run migration on startup
usePhraseStore.getState()._migrateRows();

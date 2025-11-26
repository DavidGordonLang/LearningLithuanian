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

/* ------------------------ Zustand Store ------------------------ */

export const usePhraseStore = create((set, get) => ({
  // initial state
  phrases: loadRows(),

  // ensure each row has an ID and timestamp
  _migrateRows: () => {
    const rows = get().phrases || [];
    let changed = false;

    const migrated = rows.map((r) => {
      if (!r._id || typeof r._id !== "string") {
        changed = true;
        return {
          ...r,
          _id: Math.random().toString(36).slice(2),
          _ts: r._ts || Date.now(),
        };
      }
      return r;
    });

    if (changed) {
      set({ phrases: migrated });
      saveRows(migrated);
    }
  },

  // replace entire list
  setPhrases: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.phrases) : update;
      return { phrases: next };
    });
    saveRows(get().phrases);
  },

  // add entry
  addPhrase: (row) =>
    set((state) => {
      const next = [row, ...state.phrases];
      saveRows(next);
      return { phrases: next };
    }),

  // update a phrase by index
  saveEditedPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) =>
        i === index
          ? { ...updated, _ts: r._ts || Date.now() }
          : r
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
}));

// Run migration on startup
usePhraseStore.getState()._migrateRows();

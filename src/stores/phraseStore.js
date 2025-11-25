// src/stores/phraseStore.js
import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

// --------------------------------------
// Helpers
// --------------------------------------
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

// --------------------------------------
// Store
// --------------------------------------
export const usePhraseStore = create((set, get) => {
  const store = {
    // Initial data
    phrases: loadRows(),

    // Auto-migrate missing IDs / timestamps
    _migrateRows: () => {
      const rows = get().phrases;
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

      if (changed) set({ phrases: migrated });
    },

    // Persist to localStorage
    _persist: () => {
      saveRows(get().phrases);
    },

    // Replace full list
    setPhrases: (update) => {
      set((state) => {
        const next =
          typeof update === "function"
            ? update(state.phrases)
            : update;
        return { phrases: next };
      });
      get()._persist();
    },

    // Add a new phrase
    addPhrase: (row) =>
      set((state) => ({
        phrases: [row, ...state.phrases],
      })),

    // Delete a phrase by index
    removePhrase: (index) =>
      set((state) => ({
        phrases: state.phrases.filter((_, i) => i !== index),
      })),

    // Save edits to a phrase
    saveEditedPhrase: (index, updated) =>
      set((state) => {
        const next = state.phrases.map((r, i) =>
          i === index ? { ...updated, _ts: r._ts || Date.now() } : r
        );
        return { phrases: next };
      }),
  };

  // Run migration immediately
  store._migrateRows();

  return store;
});

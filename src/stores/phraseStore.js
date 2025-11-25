import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

// --- Helpers ---
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

// --- Zustand store ---
export const usePhraseStore = create((set, get) => ({
  // Initial state
  phrases: loadRows(),

  // Persist helper
  _persist: () => {
    saveRows(get().phrases);
  },

  // Replace the entire phrase list
  setPhrases: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.phrases) : update;
      return { phrases: next };
    });
    get()._persist();
  },

  // Add a single phrase (Step 8A)
  addPhrase: (row) =>
    set((state) => ({
      phrases: [row, ...state.phrases],
    })),

  // Edit a phrase by index (Step 8B)
  editPhrase: (index, updated) =>
    set((state) => {
      const next = state.phrases.map((r, i) =>
        i === index ? updated : r
      );
      return { phrases: next };
    }),
}));

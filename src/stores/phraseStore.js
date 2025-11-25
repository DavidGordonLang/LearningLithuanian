import { create } from "zustand";

const LS_KEY = "lt_phrasebook_v3";

// --- Helpers moved from App.jsx ---
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
  rows: loadRows(),

  // Save to localStorage whenever rows change
  _persist: () => {
    const rows = get().rows;
    saveRows(rows);
  },

  // Replace the entire phrase list
  setRows: (update) => {
    set((state) => {
      const next =
        typeof update === "function" ? update(state.rows) : update;
      return { rows: next };
    });
    get()._persist();
  },
}));

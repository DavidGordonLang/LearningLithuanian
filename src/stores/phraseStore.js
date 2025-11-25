import { create } from "zustand";

// Phrase store — will hold all Lithuanian/English phrases.
// This is the skeleton; we will wire in real logic after the UI shell is stable.

export const usePhraseStore = create((set) => ({
  phrases: [],

  // --- Actions (empty for now, we fill them step by step) ---
  setPhrases: (list) =>
    set({
      phrases: Array.isArray(list) ? list : [],
    }),

  addPhrase: () => {},
  updatePhrase: () => {},
  deletePhrase: () => {},
}));

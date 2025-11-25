import { create } from "zustand";

// Quiz store — tracks active quiz, progress, answers, streak.
// Empty skeleton for now. We'll wire in real logic after the UI foundation is stable.

export const useQuizStore = create((set) => ({
  quizItems: [],
  currentIndex: 0,
  streak: 0,
  mode: "lt-en", // "lt-en", "en-lt", "mixed"

  // --- ACTIONS ---
  startQuiz: (items, mode = "lt-en") =>
    set({
      quizItems: Array.isArray(items) ? items : [],
      currentIndex: 0,
      mode,
    }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.quizItems.length),
    })),

  incrementStreak: () =>
    set((state) => ({
      streak: state.streak + 1,
    })),

  resetStreak: () => set({ streak: 0 }),
}));

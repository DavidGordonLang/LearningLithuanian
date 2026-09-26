// src/stores/gameStore.js
//
// Tracks XP, streak, and lesson completion progress.
// Syncs to Supabase `user_game` table (same pattern as settingsStore).
// Initialised via authStore on login, reset on logout.

import { create } from "zustand";
import { supabase } from "../supabaseClient";

import { CURRICULUM_ID, curriculumLessons, emptyGameData, sanitiseGameData, validAttempt } from "../lib/curriculumProgress.js";
import { learningUpdateGuard } from "../lib/learningUpdateGuard.js";
import { createGamePersistence } from "../lib/gamePersistence.js";

// ─── XP rewards ───────────────────────────────────────────────────────────────

const XP_REWARDS = {
  translate: 5,
  save_phrase: 10,
  training_session: 15,
  perfect_session: 25,
  complete_lesson: 30,
  daily_streak: 20,
};

// ─── Level thresholds ─────────────────────────────────────────────────────────
// XP needed to reach level n: floor(100 × 1.1^(n-1))

function xpForLevel(n) {
  return Math.floor(100 * Math.pow(1.1, n - 1));
}

function levelFromTotalXP(totalXP) {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (accumulated + needed > totalXP) break;
    accumulated += needed;
    level++;
  }
  return { level, xpIntoLevel: totalXP - accumulated, xpForThisLevel: xpForLevel(level) };
}

// ─── Streak helpers ───────────────────────────────────────────────────────────

function todayDateString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round(Math.abs((d2 - d1) / (1000 * 60 * 60 * 24)));
}

// ─── Default state ────────────────────────────────────────────────────────────

const defaultData = emptyGameData;
function nextResetEpoch(previous) {
  const next = Math.max(Date.now(), (Number.parseInt(previous, 10) || 0) + 1);
  return `${next.toString().padStart(16,"0")}:${crypto.randomUUID()}`;
}
function browserStorage() { try { return globalThis.localStorage; } catch { return null; } }

// Dependency injection keeps real store transitions testable without a remote account.
export function createGameStore({ client = supabase, storage = browserStorage() } = {}) {
  let persistence;
  const store = create((set, get) => ({
  ...defaultData(),
  loading: false,
  syncStatus: "idle",
  localSaveFailed: false,
  _loadedForUserId: null,
  _activeUserId: null,

  // ── Derived (computed on read) ──────────────────────────────────────────────

  getLevelInfo: () => levelFromTotalXP(get().totalXP),

  // ── Init / reset ────────────────────────────────────────────────────────────

  ensureLoadedForUser: (userId) => {
    if (!userId) return;
    if (get()._activeUserId !== userId) {
      persistence.reset();
      set({ ...defaultData(), _activeUserId: userId, _loadedForUserId: null, loading: true });
    }
    return persistence.load(userId);
  },
  retrySync: () => persistence.retry(),
  reset: () => {
    persistence.reset();
    set({ ...defaultData(), loading: false, syncStatus: "idle", localSaveFailed: false, _loadedForUserId: null, _activeUserId: null });
  },

  resetLessonProgress: async (userId) => {
    if (!userId || get()._loadedForUserId !== userId) return false;

    set({
      resetEpoch: nextResetEpoch(get().resetEpoch),
      completedLessonIds: [],
      seenModuleCompleteIds: [],
      seenSectionCompleteIds: [],
      lessonMetrics: {},
      lessonProgress: {},
    });

    await get()._save(userId);
    if (get().localSaveFailed && get().syncStatus !== "saved") throw new Error("Progress is not safely saved. Keep this page open and retry sync.");
    return true;
  },

  resetAllProgress: async (userId) => {
    if (!userId || get()._loadedForUserId !== userId) return false;

    set({
      ...defaultData(),
      resetEpoch: nextResetEpoch(get().resetEpoch),
      loading: false,
      _loadedForUserId: userId,
    });

    await get()._save(userId);
    if (get().localSaveFailed && get().syncStatus !== "saved") throw new Error("Progress is not safely saved. Keep this page open and retry sync.");
    return true;
  },

  // ── Persistence ─────────────────────────────────────────────────────────────

  _save: (userId) => {
    if (!userId || get()._loadedForUserId !== userId) return Promise.resolve(false);
    return persistence.save(userId);
  },

  // ── XP ──────────────────────────────────────────────────────────────────────

  earnXP: (action, userId) => {
    if (!userId || get()._loadedForUserId !== userId) return { xpGained: 0 };
    const reward = XP_REWARDS[action] ?? 0;
    if (!reward) return { xpGained: 0 };

    const prevTotal = get().totalXP;
    const newTotal = prevTotal + reward;

    const prevLevel = levelFromTotalXP(prevTotal).level;
    const newLevel = levelFromTotalXP(newTotal).level;
    const leveledUp = newLevel > prevLevel;

    set({ totalXP: newTotal });
    get()._save(userId);

    return { xpGained: reward, leveledUp, newLevel };
  },

  // ── Streak ──────────────────────────────────────────────────────────────────

  recordActivity: (userId) => {
    if (!userId || get()._loadedForUserId !== userId) return;
    const today = todayDateString();
    const { lastActivityDate, streakDays, graceUsedThisWeek } = get();

    if (lastActivityDate === today) {
      // Already recorded today — no change
      return;
    }

    let newStreak = streakDays;
    let newGrace = graceUsedThisWeek;

    if (!lastActivityDate) {
      // First ever activity
      newStreak = 1;
    } else {
      const gap = daysBetween(lastActivityDate, today);

      if (gap === 1) {
        // Consecutive day
        newStreak = streakDays + 1;
      } else if (gap === 2 && !graceUsedThisWeek) {
        // One missed day — use grace period
        newStreak = streakDays + 1;
        newGrace = true;
      } else {
        // Streak broken
        newStreak = 1;
        newGrace = false;
      }
    }

    // Reset grace used flag on Monday
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 1) newGrace = false;

    set({
      streakDays: newStreak,
      lastActivityDate: today,
      graceUsedThisWeek: newGrace,
    });

    get()._save(userId);
  },

  // ── Lesson completion ────────────────────────────────────────────────────────

  completeLesson: (lessonId, userId, metrics = null) => {
    if (!userId || get()._loadedForUserId !== userId) return { wasAlreadyComplete: false };
    if (!curriculumLessons[lessonId]) return { wasAlreadyComplete: false };

    const current = get().completedLessonIds;
    const wasAlreadyComplete = current.includes(lessonId);
    const currentProgress = get().lessonProgress || {};
    const nextLessonProgress = { ...currentProgress };
    const hadProgress = Object.prototype.hasOwnProperty.call(nextLessonProgress, lessonId);
    if (hadProgress) delete nextLessonProgress[lessonId];

    const currentMetrics = get().lessonMetrics || {};
    let nextLessonMetrics = currentMetrics;
    let addedMetrics = false;

    if (!currentMetrics[lessonId] && metrics) {
      const scoreableBlocks = Math.max(0, Number(metrics?.scoreableBlocks) || 0);
      const wrongBlocks = Math.max(0, Math.min(Number(metrics?.wrongBlocks) || 0, scoreableBlocks));
      const accuracyPct = scoreableBlocks > 0
        ? Math.round(((scoreableBlocks - wrongBlocks) / scoreableBlocks) * 100)
        : null;

      nextLessonMetrics = {
        ...currentMetrics,
        [lessonId]: {
          wrongBlocks,
          scoreableBlocks,
          accuracyPct,
          completedAt: Date.now(),
        },
      };
      addedMetrics = true;
    }

    if (!wasAlreadyComplete) {
      set({
        completedLessonIds: [...current, lessonId],
        lessonMetrics: nextLessonMetrics,
        lessonProgress: nextLessonProgress,
      });
      get().recordActivity(userId);
      get()._save(userId);
    } else if (hadProgress || addedMetrics) {
      set({
        lessonMetrics: nextLessonMetrics,
        lessonProgress: nextLessonProgress,
      });
      get()._save(userId);
    }

    return { wasAlreadyComplete };
  },

  isLessonComplete: (lessonId) => {
    return get().completedLessonIds.includes(lessonId);
  },

  setLessonProgress: (lessonId, blockId, blockIndex, userId, attempt = {}) => {
    if (!userId || get()._loadedForUserId !== userId || !lessonId) return;
    if (get().completedLessonIds.includes(lessonId)) return; // reviews do not become resume candidates
    const record = validAttempt(curriculumLessons[lessonId], {
      curriculumId: CURRICULUM_ID, blockId, updatedAt: Date.now(),
      completedBlockIds: Object.keys(attempt.completedBlockIds || {}),
      wrongBlockIds: Object.keys(attempt.wrongBlockIds || {}),
    });
    if (!record) return;
    const previous = get().lessonProgress[lessonId];
    if (!attempt.touch && previous?.blockId === record.blockId && JSON.stringify(previous.completedBlockIds) === JSON.stringify(record.completedBlockIds) && JSON.stringify(previous.wrongBlockIds) === JSON.stringify(record.wrongBlockIds)) return;
    set({ lessonProgress: { ...get().lessonProgress, [lessonId]: record } });
    get()._save(userId);
  },

  getLessonProgress: (lessonId) => {
    if (!lessonId) return null;
    return get().lessonProgress?.[lessonId] || null;
  },

  // Lesson scoring metrics are written atomically by completeLesson().

  // ── Lesson XP (best-score) ──────────────────────────────────────────────────
  //
  // Awards XP for a lesson attempt. On first completion, awards full amount.
  // On replay, only awards the positive delta if new score beats previous best.
  // Never deducts XP — worst case is no change.

  earnLessonXP: (lessonId, xpThisAttempt, userId) => {
    if (!userId || get()._loadedForUserId !== userId) return { xpGained: 0 };
    if (!curriculumLessons[lessonId] || !xpThisAttempt) return { xpGained: 0 };

    const { lessonXP, totalXP } = get();
    const previousBest = lessonXP[lessonId] || 0;

    if (xpThisAttempt <= previousBest) {
      // No improvement — no XP change
      return { xpGained: 0 };
    }

    const delta = xpThisAttempt - previousBest;
    const newTotal = totalXP + delta;

    const prevLevel = levelFromTotalXP(totalXP).level;
    const newLevel = levelFromTotalXP(newTotal).level;
    const leveledUp = newLevel > prevLevel;

    set({
      totalXP: newTotal,
      lessonXP: { ...lessonXP, [lessonId]: xpThisAttempt },
    });

    get()._save(userId);

    return { xpGained: delta, leveledUp, newLevel };
  },

  getLessonBestXP: (lessonId) => {
    return get().lessonXP[lessonId] || 0;
  },

  // ── Module celebration ───────────────────────────────────────────────────────

  markModuleCompleteSeen: (moduleId, userId) => {
    if (!userId || get()._loadedForUserId !== userId) return;
    if (!moduleId) return;
    const current = get().seenModuleCompleteIds;
    if (current.includes(moduleId)) return;
    set({ seenModuleCompleteIds: [...current, moduleId] });
    get()._save(userId);
  },

  hasSeenModuleComplete: (moduleId) => {
    return get().seenModuleCompleteIds.includes(moduleId);
  },

  markSectionCompleteSeen: (sectionId, userId) => {
    if (!userId || get()._loadedForUserId !== userId) return;
    if (!sectionId) return;
    const current = get().seenSectionCompleteIds;
    if (current.includes(sectionId)) return;
    set({ seenSectionCompleteIds: [...current, sectionId] });
    get()._save(userId);
  },

  hasSeenSectionComplete: (sectionId) => {
    return get().seenSectionCompleteIds.includes(sectionId);
  },
}));
  persistence = createGamePersistence({ client, storage,
    getData: () => sanitiseGameData(store.getState()),
    applyData: (data, userId) => {
      if (store.getState()._activeUserId === userId) store.setState({ ...data, _loadedForUserId: userId });
    },
    onStatus: meta => store.setState({ ...meta, loading: meta.syncStatus === "loading" }),
  });
  return store;
}
export const useGameStore = createGameStore();
useGameStore.subscribe(s => learningUpdateGuard.setUnsafe(s.localSaveFailed && !["saved", "idle"].includes(s.syncStatus)));
if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void useGameStore.getState().retrySync(); });
  window.addEventListener("focus", () => { if (["offline", "load-error"].includes(useGameStore.getState().syncStatus)) void useGameStore.getState().retrySync(); });
}

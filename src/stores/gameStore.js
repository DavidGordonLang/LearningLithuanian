// src/stores/gameStore.js
//
// Tracks XP, streak, and lesson completion progress.
// Syncs to Supabase `user_game` table (same pattern as settingsStore).
// Initialised via authStore on login, reset on logout.

import { create } from "zustand";
import { supabase } from "../supabaseClient";

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

function defaultData() {
  return {
    totalXP: 0,
    streakDays: 0,
    lastActivityDate: null,   // "YYYY-MM-DD"
    graceUsedThisWeek: false,
    completedLessonIds: [],   // array of lesson id strings
    seenModuleCompleteIds: [], // module ids where celebration has already shown
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create((set, get) => ({
  // Persisted data
  totalXP: 0,
  streakDays: 0,
  lastActivityDate: null,
  graceUsedThisWeek: false,
  completedLessonIds: [],
  seenModuleCompleteIds: [],

  // Meta
  loading: false,
  _loadedForUserId: null,

  // ── Derived (computed on read) ──────────────────────────────────────────────

  getLevelInfo: () => levelFromTotalXP(get().totalXP),

  // ── Init / reset ────────────────────────────────────────────────────────────

  ensureLoadedForUser: async (userId) => {
    if (!userId) return;
    if (get()._loadedForUserId === userId) return;

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from("user_game")
        .select("data")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows — first time user, that's fine
        console.error("gameStore load error:", error);
      }

      const saved = data?.data || {};
      const merged = { ...defaultData(), ...saved };

      set({
        totalXP: merged.totalXP ?? 0,
        streakDays: merged.streakDays ?? 0,
        lastActivityDate: merged.lastActivityDate ?? null,
        graceUsedThisWeek: merged.graceUsedThisWeek ?? false,
        completedLessonIds: Array.isArray(merged.completedLessonIds) ? merged.completedLessonIds : [],
        seenModuleCompleteIds: Array.isArray(merged.seenModuleCompleteIds) ? merged.seenModuleCompleteIds : [],
        loading: false,
        _loadedForUserId: userId,
      });
    } catch (err) {
      console.error("gameStore ensureLoadedForUser failed:", err);
      set({ loading: false, _loadedForUserId: userId });
    }
  },

  reset: () => {
    set({
      ...defaultData(),
      loading: false,
      _loadedForUserId: null,
    });
  },

  // ── Persistence ─────────────────────────────────────────────────────────────

  _save: async (userId) => {
    if (!userId) return;
    const { totalXP, streakDays, lastActivityDate, graceUsedThisWeek, completedLessonIds, seenModuleCompleteIds } = get();
    const payload = { totalXP, streakDays, lastActivityDate, graceUsedThisWeek, completedLessonIds, seenModuleCompleteIds };

    try {
      await supabase
        .from("user_game")
        .upsert({ user_id: userId, data: payload, updated_at: new Date().toISOString() },
          { onConflict: "user_id" });
    } catch (err) {
      console.error("gameStore _save failed:", err);
    }
  },

  // ── XP ──────────────────────────────────────────────────────────────────────

  earnXP: (action, userId, overrideAmount = null) => {
    const reward = overrideAmount !== null ? overrideAmount : (XP_REWARDS[action] ?? 0);
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

  completeLesson: (lessonId, userId) => {
    if (!lessonId) return { wasAlreadyComplete: false };

    const current = get().completedLessonIds;
    const wasAlreadyComplete = current.includes(lessonId);

    if (!wasAlreadyComplete) {
      set({ completedLessonIds: [...current, lessonId] });
      get().recordActivity(userId);
      get()._save(userId);
    }

    return { wasAlreadyComplete };
  },

  isLessonComplete: (lessonId) => {
    return get().completedLessonIds.includes(lessonId);
  },

  // ── Module celebration ───────────────────────────────────────────────────────

  markModuleCompleteSeen: (moduleId, userId) => {
    if (!moduleId) return;
    const current = get().seenModuleCompleteIds;
    if (current.includes(moduleId)) return;
    set({ seenModuleCompleteIds: [...current, moduleId] });
    get()._save(userId);
  },

  hasSeenModuleComplete: (moduleId) => {
    return get().seenModuleCompleteIds.includes(moduleId);
  },
}));

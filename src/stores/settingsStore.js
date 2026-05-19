// src/stores/settingsStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

const TABLE_NAME = "user_settings";

/**
 * Defaults
 * Keep these stable; add new keys here with safe defaults.
 */
const DEFAULTS = {
  phoneticsMode: "en",      // "en" | "ipa"
  speakerGender: "male",    // "male" | "female"
  userName: "",
  fromCountryCode: "",
  livesInCountryCode: "",
  dateOfBirth: "",          // ISO date string e.g. "1990-06-15"
  profileOnboardingVersion: 0,
  themeMode: "auto",        // "auto" | "light" | "dark"
};

function mergeDefaults(data) {
  return { ...DEFAULTS, ...(data || {}) };
}

function sanitizeName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeCountryCode(value) {
  return String(value || "").trim();
}

function sanitizeDob(value) {
  const s = String(value || "").trim();
  // Accept YYYY-MM-DD only
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function derive(data) {
  const merged = mergeDefaults(data);
  const pm = merged.phoneticsMode === "ipa" ? "ipa" : "en";
  const sg = merged.speakerGender === "female" ? "female" : "male";
  const userName = sanitizeName(merged.userName);
  const fromCountryCode = sanitizeCountryCode(merged.fromCountryCode);
  const livesInCountryCode = sanitizeCountryCode(merged.livesInCountryCode);
  const dateOfBirth = sanitizeDob(merged.dateOfBirth);
  const profileOnboardingVersion = Number.isFinite(Number(merged.profileOnboardingVersion))
    ? Number(merged.profileOnboardingVersion)
    : 0;
  const themeMode = ["auto", "light", "dark"].includes(merged.themeMode) ? merged.themeMode : "auto";

  return {
    phoneticsMode: pm,
    speakerGender: sg,
    userName,
    fromCountryCode,
    livesInCountryCode,
    dateOfBirth,
    profileOnboardingVersion,
    themeMode,
  };
}

/**
 * Settings store
 *
 * - `data` is the persisted JSON payload in Supabase.
 * - We also mirror commonly used values at the top level (e.g. `phoneticsMode`, `speakerGender`)
 *   so views can read primitives easily.
 * - `setSetting` remains the single write path.
 */
export const useSettingsStore = create((set, get) => ({
  loading: true,
  error: null,

  // persisted blob from Supabase
  data: { ...DEFAULTS },

  // derived mirrors (UI-friendly)
  ...derive(DEFAULTS),

  /* -------------------- Internal -------------------- */
  _loadedForUserId: null,

  /* -------------------- Load / init -------------------- */
  ensureLoadedForUser: async (userId) => {
    if (!userId) return;

    // Prevent refetch loops
    if (get()._loadedForUserId === userId) {
      const d = mergeDefaults(get().data);
      set({ data: d, ...derive(d), loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data: row, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .single();

      // If row does not exist, create it (new user)
      if (error && (error.code === "PGRST116" || error.details?.includes("0 rows"))) {
        const defaults = { ...DEFAULTS };
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert([{ user_id: userId, data: defaults }]);

        if (insertError) throw insertError;

        set({
          data: defaults,
          ...derive(defaults),
          loading: false,
          error: null,
          _loadedForUserId: userId,
        });
        return;
      }

      if (error) throw error;

      const merged = mergeDefaults(row?.data);

      // If defaults introduced new keys, write them back once.
      const needsWriteBack =
        JSON.stringify(merged) !== JSON.stringify(row?.data || {});

      set({
        data: merged,
        ...derive(merged),
        loading: false,
        error: null,
        _loadedForUserId: userId,
      });

      if (needsWriteBack) {
        // fire-and-forget
        supabase
          .from(TABLE_NAME)
          .update({ data: merged, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    } catch (e) {
      console.error("Settings load error:", e);
      set({
        data: { ...DEFAULTS },
        ...derive(DEFAULTS),
        loading: false,
        error: e?.message || "Failed to load settings",
        _loadedForUserId: userId,
      });
    }
  },

  reset: () => {
    set({
      loading: true,
      error: null,
      data: { ...DEFAULTS },
      ...derive(DEFAULTS),
      _loadedForUserId: null,
    });
  },

  /* -------------------- Read helpers -------------------- */

  getSetting: (key) => {
    const d = get().data || {};
    return d[key];
  },

  /* -------------------- Write helpers -------------------- */

  setSetting: async (userId, key, value) => {
    const nextData = mergeDefaults({ ...(get().data || {}), [key]: value });

    // optimistic local update
    set({ data: nextData, ...derive(nextData), error: null });

    // Local-only safety
    if (!userId) return;

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ data: nextData, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
    } catch (e) {
      console.error("Failed to persist setting:", e);
      set({ error: e?.message || "Failed to persist setting" });
    }
  },

  saveProfileOnboarding: async (userId, values = {}, version) => {
    const n = Number(version);
    const nextVersion = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    const nextData = mergeDefaults({
      ...(get().data || {}),
      speakerGender: values?.speakerGender === "female" ? "female" : "male",
      dateOfBirth: sanitizeDob(values?.dateOfBirth),
      fromCountryCode: sanitizeCountryCode(values?.fromCountryCode),
      livesInCountryCode: sanitizeCountryCode(values?.livesInCountryCode),
      profileOnboardingVersion: nextVersion,
    });

    if (!userId) {
      const message = "Sign in required to save profile setup";
      set({ error: message });
      throw new Error(message);
    }

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ data: nextData, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select("user_id")
        .single();

      if (error) throw error;

      set({ data: nextData, ...derive(nextData), error: null });
      return { ok: true };
    } catch (e) {
      console.error("Failed to save profile onboarding:", e);
      set({ error: e?.message || "Failed to save profile setup" });
      throw e;
    }
  },

  /**
   * Convenience setters expected by UI.
   */
  setPhoneticsMode: async (userId, mode) => {
    const next = mode === "ipa" ? "ipa" : "en";
    return get().setSetting(userId, "phoneticsMode", next);
  },

  setSpeakerGender: async (userId, gender) => {
    const next = gender === "female" ? "female" : "male";
    return get().setSetting(userId, "speakerGender", next);
  },

  setUserName: async (userId, name) => {
    const next = sanitizeName(name);
    return get().setSetting(userId, "userName", next);
  },

  setFromCountryCode: async (userId, code) => {
    const next = sanitizeCountryCode(code);
    return get().setSetting(userId, "fromCountryCode", next);
  },

  setLivesInCountryCode: async (userId, code) => {
    const next = sanitizeCountryCode(code);
    return get().setSetting(userId, "livesInCountryCode", next);
  },

  setDateOfBirth: async (userId, dob) => {
    const next = sanitizeDob(dob);
    return get().setSetting(userId, "dateOfBirth", next);
  },

  setProfileOnboardingVersion: async (userId, version) => {
    const n = Number(version);
    const next = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    return get().setSetting(userId, "profileOnboardingVersion", next);
  },

  setThemeMode: async (userId, mode) => {
    const next = ["auto", "light", "dark"].includes(mode) ? mode : "auto";
    return get().setSetting(userId, "themeMode", next);
  },
}));

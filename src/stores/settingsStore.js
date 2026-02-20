// src/stores/settingsStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

const TABLE_NAME = "user_settings";

/**
 * Defaults
 * Keep these stable; add new keys here with safe defaults.
 */
const DEFAULTS = {
  phoneticsMode: "en", // "en" | "ipa"
};

function mergeDefaults(data) {
  return { ...DEFAULTS, ...(data || {}) };
}

function derive(data) {
  const merged = mergeDefaults(data);
  const pm = merged.phoneticsMode === "ipa" ? "ipa" : "en";
  return { phoneticsMode: pm };
}

/**
 * Settings store
 *
 * - `data` is the persisted JSON payload in Supabase.
 * - We also mirror commonly used values at the top level (e.g. `phoneticsMode`)
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

  /**
   * Convenience setters expected by UI.
   */
  setPhoneticsMode: async (userId, mode) => {
    const next = mode === "ipa" ? "ipa" : "en";
    return get().setSetting(userId, "phoneticsMode", next);
  },
}));
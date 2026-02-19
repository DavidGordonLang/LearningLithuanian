// src/stores/settingsStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

const DEFAULTS = {
  phoneticsMode: "en", // "en" | "ipa"
  sfxEnabled: true,    // we’ll wire this later (dopamine hits)
  examMode: false,     // we’ll wire this later
};

function mergeDefaults(data) {
  return { ...DEFAULTS, ...(data || {}) };
}

export const useSettingsStore = create((set, get) => ({
  loading: false,
  error: null,

  // persisted settings payload (jsonb) from user_settings.data
  data: { ...DEFAULTS },

  // internal
  _userId: null,
  _loadedForUserId: null,

  // Read helpers
  phoneticsMode: () => get().data.phoneticsMode || "en",
  sfxEnabled: () => get().data.sfxEnabled !== false,
  examMode: () => !!get().data.examMode,

  // Called by auth lifecycle
  ensureLoadedForUser: async (userId) => {
    if (!userId) return;

    // Prevent refetch loops
    if (get()._loadedForUserId === userId) return;

    set({ loading: true, error: null, _userId: userId });

    try {
      // Try read first
      const { data: row, error: selErr } = await supabase
        .from("user_settings")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();

      if (selErr) throw selErr;

      if (!row) {
        // Create defaults row
        const defaults = { ...DEFAULTS };
        const { error: insErr } = await supabase.from("user_settings").insert({
          user_id: userId,
          data: defaults,
        });
        if (insErr) throw insErr;

        set({
          data: defaults,
          loading: false,
          error: null,
          _loadedForUserId: userId,
        });
        return;
      }

      const merged = mergeDefaults(row.data);
      // Optional: if defaults introduced new keys, write them back once
      const needsWriteBack =
        JSON.stringify(merged) !== JSON.stringify(row.data || {});

      set({
        data: merged,
        loading: false,
        error: null,
        _loadedForUserId: userId,
      });

      if (needsWriteBack) {
        // fire-and-forget; don’t block UI
        supabase
          .from("user_settings")
          .update({ data: merged, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    } catch (e) {
      console.warn("Settings load failed:", e);
      set({
        loading: false,
        error: e?.message || "Settings load failed",
        // Keep defaults so app remains functional
        data: { ...DEFAULTS },
        _loadedForUserId: userId,
      });
    }
  },

  // Called on logout
  reset: () => {
    set({
      loading: false,
      error: null,
      data: { ...DEFAULTS },
      _userId: null,
      _loadedForUserId: null,
    });
  },

  // Update a single setting key (persists immediately)
  setSetting: async (key, value) => {
    const userId = get()._userId;
    const next = { ...get().data, [key]: value };

    set({ data: next });

    if (!userId) return; // not signed in; keep local state only

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ data: next, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
    } catch (e) {
      console.warn("Failed to persist setting:", e);
      // Don’t revert automatically; we can add retry later if needed
      set({ error: e?.message || "Failed to persist setting" });
    }
  },
}));
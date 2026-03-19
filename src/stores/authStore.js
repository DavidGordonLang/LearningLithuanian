// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";
import { useSettingsStore } from "./settingsStore";
import { useGameStore } from "./gameStore";

const AUTH_BOOTSTRAP_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, label = "timeout") {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    Promise.resolve(promise)
      .then((v) => { clearTimeout(t); resolve(v); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  _bootstrapToken: 0,

  _setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });

    const uid = session?.user?.id;
    if (uid) {
      // Load per-user settings
      useSettingsStore.getState().ensureLoadedForUser(uid);
      // Load per-user game data (XP, streak, lesson completions)
      useGameStore.getState().ensureLoadedForUser(uid);
    }
  },

  _clearSession: () => {
    set({ session: null, user: null, loading: false });
    useSettingsStore.getState().reset();
    useGameStore.getState().reset();
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error("Google sign-in failed:", error);
      alert(error.message);
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut failed, continuing local logout", err);
    } finally {
      set({ user: null, session: null, loading: false });
      useSettingsStore.getState().reset();
      useGameStore.getState().reset();
    }
  },
}));

let initialised = false;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  (async () => {
    const token = Date.now() + Math.random();
    useAuthStore.setState({ _bootstrapToken: token });

    try {
      const { data } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_BOOTSTRAP_TIMEOUT_MS,
        "auth_getSession_timeout"
      );

      if (useAuthStore.getState()._bootstrapToken !== token) return;
      const st = useAuthStore.getState();
      if (st.session || st.user) return;
      useAuthStore.getState()._setSession(data?.session ?? null);
    } catch (err) {
      if (useAuthStore.getState()._bootstrapToken !== token) return;
      const st = useAuthStore.getState();
      if (st.session || st.user) return;
      console.warn("Auth bootstrap getSession failed:", err);
      useAuthStore.getState()._clearSession();
    }
  })();

  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) useAuthStore.getState()._setSession(session);
      else useAuthStore.getState()._clearSession();
    });
  } catch (err) {
    console.warn("Auth listener setup failed:", err);
    const st = useAuthStore.getState();
    if (!st.session && !st.user) useAuthStore.getState()._clearSession();
  }
}

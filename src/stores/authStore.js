// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

const AUTH_BOOTSTRAP_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, label = "timeout") {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    Promise.resolve(promise)
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  /* ---------- INTERNAL STATE ---------- */

  _setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    }),

  _clearSession: () =>
    set({
      session: null,
      user: null,
      loading: false,
    }),

  /* ---------- AUTH ACTIONS ---------- */

  signInWithGoogle: async () => {
    set({ loading: true });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        /**
         * IMPORTANT:
         * - Works for web
         * - Works for PWA
         * - Works for Android Chrome
         * - Works for iOS Safari
         */
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google sign-in failed:", error);
      set({ loading: false });
      alert(error.message);
    }
    // success is handled by auth state listener
  },

  signOut: async () => {
    set({ loading: true });

    try {
      // Attempt Supabase logout (may fail on mobile PWA)
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut failed, continuing local logout", err);
    } finally {
      // ALWAYS clear local state so UI recovers
      set({
        user: null,
        session: null,
        loading: false,
      });
    }
  },
}));

/* ---------- ONE-TIME AUTH BOOTSTRAP ---------- */

let initialised = false;
let unsubscribe = null;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  // 1) Restore session on load (VERY IMPORTANT for PWAs)
  (async () => {
    try {
      const { data } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_BOOTSTRAP_TIMEOUT_MS,
        "auth_getSession_timeout"
      );

      // data.session may be null: that's fine, _setSession will set loading=false
      useAuthStore.getState()._setSession(data?.session ?? null);
    } catch (err) {
      // Critical: never hang on Loading…
      console.warn("Auth bootstrap getSession failed:", err);
      useAuthStore.getState()._clearSession();
    }
  })();

  // 2) Listen for all future auth changes
  try {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        useAuthStore.getState()._setSession(session);
      } else {
        useAuthStore.getState()._clearSession();
      }
    });

    // Keep a reference (not strictly necessary, but safe)
    unsubscribe = data?.subscription?.unsubscribe ?? null;
  } catch (err) {
    // Even if the listener setup fails, ensure we don't stay stuck
    console.warn("Auth listener setup failed:", err);
    useAuthStore.getState()._clearSession();
  }
}

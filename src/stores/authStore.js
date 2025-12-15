// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

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
    await supabase.auth.signOut();
    set({ loading: false });
  },
}));

/* ---------- ONE-TIME AUTH BOOTSTRAP ---------- */

let initialised = false;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  // 1) Restore session on load (VERY IMPORTANT for PWAs)
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState()._setSession(data.session);
  });

  // 2) Listen for all future auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      useAuthStore.getState()._setSession(session);
    } else {
      useAuthStore.getState()._clearSession();
    }
  });
}

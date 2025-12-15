// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: false,

  /* ---------- SESSION HANDLING ---------- */

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    }),

  clearSession: () =>
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
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google sign-in failed:", error);
      set({ loading: false });
      alert(error.message);
    }
    // success will be handled by onAuthStateChange
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ loading: false });
  },
}));

/* ---------- ONE-TIME AUTH LISTENER ---------- */

let initialised = false;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      useAuthStore.getState().setSession(session);
    } else {
      useAuthStore.getState().clearSession();
    }
  });
}

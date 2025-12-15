// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

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
}));

let initialised = false;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  // Get existing session on load
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session);
  });

  // Listen for login / logout
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      useAuthStore.getState().setSession(session);
    } else {
      useAuthStore.getState().clearSession();
    }
  });
}

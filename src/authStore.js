// src/stores/authStore.js
import { create } from "zustand";
import { supabase } from "../supabaseClient";

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoggedIn: false,
  loading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isLoggedIn: !!session?.user,
      loading: false,
    }),

  clearSession: () =>
    set({
      session: null,
      user: null,
      isLoggedIn: false,
      loading: false,
    }),
}));

// Initialise auth listener ONCE
let subscribed = false;

export function initAuthListener() {
  if (subscribed) return;
  subscribed = true;

  const { data } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      const { setSession, clearSession } =
        useAuthStore.getState();

      if (session?.user) {
        setSession(session);
      } else {
        clearSession();
      }
    }
  );

  return data?.subscription;
}

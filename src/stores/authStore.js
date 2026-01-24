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

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  // internal monotonic token to prevent stale async from overriding newer state
  _bootstrapToken: 0,

  _setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });
  },

  _clearSession: () => {
    set({
      session: null,
      user: null,
      loading: false,
    });
  },

  signInWithGoogle: async () => {
    // Don’t force loading=true here; OAuth will redirect and listener will settle state.
    // Keeping it as-is avoids “stuck loading” if the redirect is blocked.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
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
      set({
        user: null,
        session: null,
        loading: false,
      });
    }
  },
}));

let initialised = false;

export function initAuthListener() {
  if (initialised) return;
  initialised = true;

  // 1) Restore session on load
  (async () => {
    // bump token; only the latest bootstrap run may write fallback state
    const token = Date.now() + Math.random();
    useAuthStore.setState({ _bootstrapToken: token });

    try {
      const { data } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_BOOTSTRAP_TIMEOUT_MS,
        "auth_getSession_timeout"
      );

      // If a newer bootstrap run started, ignore this one
      if (useAuthStore.getState()._bootstrapToken !== token) return;

      // If auth listener already set a session/user, do NOT override
      const st = useAuthStore.getState();
      if (st.session || st.user) return;

      useAuthStore.getState()._setSession(data?.session ?? null);
    } catch (err) {
      // If a newer bootstrap run started, ignore this one
      if (useAuthStore.getState()._bootstrapToken !== token) return;

      // If auth listener already set a session/user, do NOT override
      const st = useAuthStore.getState();
      if (st.session || st.user) return;

      // Critical: never hang on Loading… but also don’t clobber real sessions.
      console.warn("Auth bootstrap getSession failed:", err);
      useAuthStore.getState()._clearSession();
    }
  })();

  // 2) Listen for all future auth changes
  try {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) useAuthStore.getState()._setSession(session);
      else useAuthStore.getState()._clearSession();
    });
  } catch (err) {
    console.warn("Auth listener setup failed:", err);
    // Only clear if we’re still loading and have no session
    const st = useAuthStore.getState();
    if (!st.session && !st.user) useAuthStore.getState()._clearSession();
  }
}

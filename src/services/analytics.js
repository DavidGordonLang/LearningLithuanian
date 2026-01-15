// src/services/analytics.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "../stores/authStore";

const LSK_DIAGNOSTICS = "zodis_diagnostics_enabled_v1"; // "1" | "0"
const LSK_SESSION_ID = "zodis_session_id_v1";
const LSK_SESSION_LAST = "zodis_session_last_v1";

// 30 mins: if the app hasn't logged anything in 30 mins, start a new session id
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function safeNow() {
  try {
    return Date.now();
  } catch {
    return 0;
  }
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}

export function getDiagnosticsEnabled() {
  const v = safeGet(LSK_DIAGNOSTICS);
  if (v === null) return true; // default ON for beta
  return v === "1";
}

export function setDiagnosticsEnabled(enabled) {
  safeSet(LSK_DIAGNOSTICS, enabled ? "1" : "0");
}

export function getOrCreateSessionId() {
  const now = safeNow();
  const lastRaw = safeGet(LSK_SESSION_LAST);
  const last = lastRaw ? Number(lastRaw) : 0;

  let sid = safeGet(LSK_SESSION_ID);

  const expired = !last || now - last > SESSION_TIMEOUT_MS;
  if (!sid || expired) {
    sid = `s_${now}_${Math.random().toString(36).slice(2, 10)}`;
    safeSet(LSK_SESSION_ID, sid);
  }

  safeSet(LSK_SESSION_LAST, now);
  return sid;
}

function touchSession() {
  safeSet(LSK_SESSION_LAST, safeNow());
}

function baseContext(extra) {
  const { user } = useAuthStore.getState();
  const ua =
    typeof navigator !== "undefined" && navigator.userAgent ? navigator.userAgent : "";

  return {
    user,
    ua,
    tz: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      } catch {
        return "";
      }
    })(),
    ...extra,
  };
}

export async function trackEvent(event_name, event_props = {}, { app_version } = {}) {
  if (!getDiagnosticsEnabled()) return;
  const { user } = useAuthStore.getState();
  if (!user?.id) return;

  const session_id = getOrCreateSessionId();
  touchSession();

  // NOTE: Beta requirement: you want to know who's using it.
  // We include email only in session_start and view_* events for human-readable reporting.
  const props =
    event_name === "session_start" || event_name.startsWith("view_")
      ? { ...event_props, user_email: user.email || null }
      : event_props;

  try {
    const { error } = await supabase.from("app_events").insert([
      {
        user_id: user.id,
        session_id,
        event_name,
        event_props: props || {},
        app_version: app_version || null,
      },
    ]);

    if (error) {
      // Don't throw — analytics must never break the app
      console.warn("trackEvent failed:", error);
    }
  } catch (e) {
    console.warn("trackEvent exception:", e);
  }
}

export async function trackError(err, context = {}, { app_version } = {}) {
  if (!getDiagnosticsEnabled()) return;

  const ctx = baseContext(context);
  const session_id = (() => {
    try {
      return getOrCreateSessionId();
    } catch {
      return null;
    }
  })();

  const message =
    (err && err.message) ||
    (typeof err === "string" ? err : "") ||
    "Unknown error";

  const error_name = (err && err.name) || "Error";

  const stack = (err && err.stack) || null;

  try {
    const { error } = await supabase.from("app_errors").insert([
      {
        user_id: ctx.user?.id || null,
        session_id: session_id || null,
        error_name,
        message: String(message),
        stack: stack ? String(stack).slice(0, 10000) : null,
        context: {
          user_email: ctx.user?.email || null, // internal-only, helps beta ops
          user_agent: ctx.ua || "",
          timezone: ctx.tz || "",
          ...context,
        },
        app_version: app_version || null,
      },
    ]);

    if (error) {
      console.warn("trackError failed:", error);
    }
  } catch (e) {
    console.warn("trackError exception:", e);
  }
}
// src/services/analytics.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "../stores/authStore";
import { BETA3_VERSION, safeProductProps } from "../lib/productTelemetry";

const LSK_DIAGNOSTICS = "zodis_diagnostics_enabled_v1"; // "1" | "0"
const LSK_SESSION_ID = "zodis_session_id_v1";
const LSK_SESSION_LAST = "zodis_session_last_v1";
const LSK_SESSION_RECORDED = "zodis_session_recorded_v1";
const LSK_SESSION_OWNER = "zodis_session_owner_v1";
const sessionStartPending = new Set();

// After 5 minutes without tracked activity, the next event starts a new session.
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;

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
  if (!getDiagnosticsEnabled() && !event_name.startsWith("session_") && !PRODUCT_EVENTS.has(event_name)) return false;
  const { user } = useAuthStore.getState();
  if (!user?.id) return false;

  if (event_name !== "session_start") await trackSessionStart();

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
      return false;
    }
    return true;
  } catch (e) {
    console.warn("trackEvent exception:", e);
    return false;
  }
}

const PRODUCT_EVENTS = new Set([
  "onboarding_started", "onboarding_completed", "quickstart_opened", "quickstart_completed",
  "training_viewed", "lesson_started", "lesson_resumed", "lesson_exited", "lesson_completed",
  "scenario_started", "scenario_help_used", "scenario_completed", "pronunciation_attempt",
  "phrase_saved", "phrase_edited", "phrase_deleted", "personal_scenario_created",
  "personal_scenario_deleted", "personal_scenario_opened", "phrase_added_to_personal_scenario",
]);

export function trackProductEvent(name, props = {}) {
  if (!PRODUCT_EVENTS.has(name)) return Promise.resolve(false);
  return trackEvent(name, safeProductProps(props), { app_version: BETA3_VERSION });
}

export function sessionAlreadyRecorded(userId, sessionId, recorded) {
  return recorded === `${userId}:${sessionId}`;
}

export async function trackSessionStart() {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return false;
  const previous = safeGet(LSK_SESSION_RECORDED) || "";
  // A different account starts a different analytics session, even on the same device.
  if (safeGet(LSK_SESSION_OWNER) !== userId) {
    safeSet(LSK_SESSION_LAST, 0);
    safeSet(LSK_SESSION_OWNER, userId);
  }
  const sid = getOrCreateSessionId();
  const key = `${userId}:${sid}`;
  if (sessionAlreadyRecorded(userId, sid, previous)) return true;
  if (sessionStartPending.has(key)) return false;
  sessionStartPending.add(key);
  const pwa = typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)")?.matches || navigator?.standalone === true);
  try {
    const ok = await trackEvent("session_start", { entry_surface: pwa ? "pwa" : "browser" }, { app_version: BETA3_VERSION });
    if (ok && useAuthStore.getState().user?.id === userId && safeGet(LSK_SESSION_ID) === sid)
      safeSet(LSK_SESSION_RECORDED, key);
    return ok;
  } finally { sessionStartPending.delete(key); }
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

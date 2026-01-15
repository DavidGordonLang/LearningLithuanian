// src/views/AnalyticsView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { trackError, trackEvent } from "../services/analytics";

function startOfTodayLocalISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function fmtTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function fmtWhen(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function uniqCount(arr) {
  return new Set(arr.filter(Boolean)).size;
}

function sum(obj) {
  return Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
}

export default function AnalyticsView({ appVersion, onBack }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]);
  const [err, setErr] = useState("");

  const [expandedUserId, setExpandedUserId] = useState(null);
  const [expandedErrorKey, setExpandedErrorKey] = useState(null);

  const fromISO = useMemo(() => startOfTodayLocalISO(), []);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const { data: ev, error: evErr } = await supabase
        .from("app_events")
        .select("user_id, session_id, event_name, event_props, created_at")
        .gte("created_at", fromISO)
        .order("created_at", { ascending: true });

      if (evErr) throw evErr;

      const { data: er, error: erErr } = await supabase
        .from("app_errors")
        .select("user_id, session_id, error_name, message, stack, context, created_at")
        .gte("created_at", fromISO)
        .order("created_at", { ascending: false });

      if (erErr) throw erErr;

      setEvents(ev || []);
      setErrors(er || []);

      try {
        trackEvent("admin_analytics_view_loaded", { events: (ev || []).length, errors: (er || []).length }, { app_version: appVersion });
      } catch {}
    } catch (e) {
      setErr(e?.message || "Failed to load analytics.");
      try {
        trackError(e, { source: "analytics_view_load" }, { app_version: appVersion });
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byUser = useMemo(() => {
    // Map user_id -> email using the events that include user_email (session_start + view_*)
    const emailByUser = new Map();
    for (const e of events) {
      const email = e?.event_props?.user_email;
      if (email && e.user_id) emailByUser.set(e.user_id, email);
    }

    const out = new Map();

    function ensure(uid) {
      if (!out.has(uid)) {
        out.set(uid, {
          user_id: uid,
          email: emailByUser.get(uid) || "(unknown email)",
          firstSeen: null,
          lastSeen: null,
          sessions: new Set(),
          views: { home: 0, library: 0, settings: 0, analytics: 0, dupes: 0 },
          features: {
            tts_play: 0,
            phrase_add: 0,
            phrase_edit: 0,
            phrase_delete: 0,
            sync_upload: 0,
            sync_download: 0,
            sync_merge: 0,
            sync_conflicts: 0,
          },
          rawEvents: [],
        });
      }
      return out.get(uid);
    }

    for (const e of events) {
      const uid = e.user_id;
      if (!uid) continue;
      const row = ensure(uid);

      if (row.email === "(unknown email)") {
        const maybe = emailByUser.get(uid);
        if (maybe) row.email = maybe;
      }

      row.rawEvents.push(e);

      const t =

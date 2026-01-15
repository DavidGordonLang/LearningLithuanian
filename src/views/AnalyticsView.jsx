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

      const t = e.created_at;
      if (!row.firstSeen || t < row.firstSeen) row.firstSeen = t;
      if (!row.lastSeen || t > row.lastSeen) row.lastSeen = t;

      if (e.session_id) row.sessions.add(e.session_id);

      const name = e.event_name || "";

      // Views
      if (name === "view_home") row.views.home += 1;
      if (name === "view_library") row.views.library += 1;
      if (name === "view_settings") row.views.settings += 1;
      if (name === "view_analytics") row.views.analytics += 1;
      if (name === "view_dupes") row.views.dupes += 1;

      // Features
      if (name === "tts_play") row.features.tts_play += 1;
      if (name === "phrase_add") row.features.phrase_add += 1;
      if (name === "phrase_edit") row.features.phrase_edit += 1;
      if (name === "phrase_delete") row.features.phrase_delete += 1;

      if (name.startsWith("sync_upload")) row.features.sync_upload += 1;
      if (name.startsWith("sync_download")) row.features.sync_download += 1;
      if (name.startsWith("sync_merge")) row.features.sync_merge += 1;
      if (name.startsWith("sync_conflicts")) row.features.sync_conflicts += 1;
    }

    // include users who only have errors (no events)
    for (const e of errors) {
      const uid = e.user_id;
      if (!uid) continue;
      const row = ensure(uid);
      if (row.email === "(unknown email)") {
        const maybe = e?.context?.user_email;
        if (maybe) row.email = maybe;
      }
      const t = e.created_at;
      if (!row.firstSeen || t < row.firstSeen) row.firstSeen = t;
      if (!row.lastSeen || t > row.lastSeen) row.lastSeen = t;
      if (e.session_id) row.sessions.add(e.session_id);
    }

    return Array.from(out.values()).sort((a, b) => {
      const aT = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
      const bT = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
      return bT - aT;
    });
  }, [events, errors]);

  const errorsGrouped = useMemo(() => {
    const map = new Map();
    for (const e of errors) {
      const key = `${e.error_name || "Error"}::${e.message || ""}`;
      if (!map.has(key)) map.set(key, { key, count: 0, latest: null, samples: [] });
      const g = map.get(key);
      g.count += 1;
      if (!g.latest || e.created_at > g.latest.created_at) g.latest = e;
      if (g.samples.length < 3) g.samples.push(e);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [errors]);

  function userSummary(u) {
    const sessions = u.sessions.size;

    // Decide "what they used it for" from counts
    const added = u.features.phrase_add;
    const edited = u.features.phrase_edit;
    const deleted = u.features.phrase_delete;
    const tts = u.features.tts_play;
    const syncOps = u.features.sync_upload + u.features.sync_download + u.features.sync_merge + u.features.sync_conflicts;

    const parts = [];
    if (added) parts.push(`added ${added}`);
    if (edited) parts.push(`edited ${edited}`);
    if (deleted) parts.push(`deleted ${deleted}`);
    if (tts) parts.push(`played TTS ${tts}×`);
    if (syncOps) parts.push(`used sync ${syncOps}×`);

    const activity = parts.length ? parts.join(", ") : "mainly browsed";

    return `Used Žodis ${sessions} session${sessions === 1 ? "" : "s"} today — ${activity}.`;
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-6">
      <div className="flex items-center justify-between gap-3 pt-4">
        <div>
          <div className="text-lg font-semibold">Analytics (Admin)</div>
          <div className="text-xs text-zinc-400">From {fmtWhen(fromISO)} (today)</div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-zinc-800 text-zinc-200 rounded-full px-4 py-2 text-sm"
            onClick={onBack}
          >
            Back
          </button>
          <button
            className="bg-emerald-500 text-black rounded-full px-4 py-2 text-sm font-semibold"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Active users</div>
          <div className="text-2xl font-semibold">{byUser.length}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Events</div>
          <div className="text-2xl font-semibold">{events.length}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Errors</div>
          <div className="text-2xl font-semibold">{errors.length}</div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Sessions</div>
          <div className="text-2xl font-semibold">
            {byUser.reduce((acc, u) => acc + u.sessions.size, 0)}
          </div>
        </div>
      </div>

      {/* WHO USED IT TODAY */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Who used it today</div>

        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : byUser.length === 0 ? (
          <div className="text-sm text-zinc-400">No activity yet today.</div>
        ) : (
          <div className="space-y-3">
            {byUser.map((u) => {
              const open = expandedUserId === u.user_id;

              return (
                <div
                  key={u.user_id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-200 truncate">
                        {u.email}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        First: {u.firstSeen ? fmtTime(u.firstSeen) : "—"} · Last:{" "}
                        {u.lastSeen ? fmtTime(u.lastSeen) : "—"} · Sessions:{" "}
                        {u.sessions.size}
                      </div>
                      <div className="text-sm text-zinc-300 mt-2">
                        {userSummary(u)}
                      </div>
                    </div>

                    <button
                      className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1.5 text-xs"
                      onClick={() => setExpandedUserId(open ? null : u.user_id)}
                    >
                      {open ? "Hide" : "Details"}
                    </button>
                  </div>

                  {open ? (
                    <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-zinc-500">Views</div>
                        <div className="text-zinc-200">
                          Home {u.views.home} · Library {u.views.library} · Settings {u.views.settings}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Phrases</div>
                        <div className="text-zinc-200">
                          Add {u.features.phrase_add} · Edit {u.features.phrase_edit} · Delete {u.features.phrase_delete}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Audio</div>
                        <div className="text-zinc-200">TTS {u.features.tts_play}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Sync</div>
                        <div className="text-zinc-200">
                          Upload {u.features.sync_upload} · Download {u.features.sync_download} · Merge {u.features.sync_merge} · Conflicts {u.features.sync_conflicts}
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <div className="text-xs text-zinc-500 mb-2">Event timeline</div>
                        <div className="max-h-40 overflow-y-auto overscroll-contain rounded-xl border border-zinc-800 bg-zinc-950/30">
                          {u.rawEvents.slice(-80).map((e, idx) => (
                            <div
                              key={`${e.created_at}_${idx}`}
                              className="px-3 py-2 text-xs border-b border-zinc-800 last:border-b-0 flex items-center justify-between gap-2"
                            >
                              <div className="text-zinc-400">{fmtTime(e.created_at)}</div>
                              <div className="text-zinc-200 flex-1 truncate">{e.event_name}</div>
                              <div className="text-zinc-500 truncate max-w-[40%]">
                                {e?.event_props?.voice ? `voice=${e.event_props.voice}` : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ERRORS TODAY */}
      <section className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="text-lg font-semibold">Errors today</div>

        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : errors.length === 0 ? (
          <div className="text-sm text-zinc-400">No errors captured today.</div>
        ) : (
          <div className="space-y-3">
            {errorsGrouped.map((g) => {
              const open = expandedErrorKey === g.key;
              const latest = g.latest;

              return (
                <div
                  key={g.key}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/20 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-zinc-200">
                        {g.count}× {latest?.error_name || "Error"}
                      </div>
                      <div className="text-sm text-zinc-300 mt-1 break-words">
                        {latest?.message}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        Latest: {latest?.created_at ? fmtWhen(latest.created_at) : "—"}
                      </div>
                    </div>

                    <button
                      className="bg-zinc-800 text-zinc-200 rounded-full px-3 py-1.5 text-xs"
                      onClick={() => setExpandedErrorKey(open ? null : g.key)}
                    >
                      {open ? "Hide" : "Details"}
                    </button>
                  </div>

                  {open ? (
                    <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
                      {g.samples.map((e, idx) => (
                        <div
                          key={`${e.created_at}_${idx}`}
                          className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3 text-xs space-y-2"
                        >
                          <div className="text-zinc-400">{fmtWhen(e.created_at)}</div>
                          <div className="text-zinc-200 break-words">
                            <span className="text-zinc-400">Source:</span>{" "}
                            {e?.context?.source || "unknown"}
                          </div>
                          {e?.context?.user_email ? (
                            <div className="text-zinc-200 break-words">
                              <span className="text-zinc-400">User:</span>{" "}
                              {e.context.user_email}
                            </div>
                          ) : null}
                          {e?.stack ? (
                            <pre className="whitespace-pre-wrap text-zinc-400 break-words">
                              {String(e.stack).slice(0, 1500)}
                            </pre>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { trackError } from "../services/analytics";
import { betaCohort, BETA3_VERSION } from "../lib/productTelemetry";

// Earlier technical audio rows are retained but excluded from learner metrics.
const COHORT_FROM = "2026-09-27T00:00:00Z";
const PAGE_SIZE = 1000;
async function loadPages(table, fields, versioned = false) {
  const rows = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    let query = supabase.from(table).select(fields).gte("created_at", COHORT_FROM)
      .order("created_at", { ascending: true }).order("id", { ascending: true })
      .range(start, start + PAGE_SIZE - 1);
    if (versioned) query = query.eq("app_version", BETA3_VERSION)
      .neq("event_name", "tts_preload").neq("event_name", "tts_play").neq("event_name", "tts_stop");
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
const when = value => value ? new Date(value).toLocaleString() : "—";
const count = (u, name) => u.counts[name] || 0;

export default function AnalyticsView({ appVersion, onBack }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  async function load() {
    setLoading(true); setErrorMessage("");
    try {
      const [ev, er] = await Promise.all([
        loadPages("app_events", "id,user_id,session_id,event_name,event_props,created_at", true),
        loadPages("app_errors", "id,user_id,error_name,message,created_at")]);
      setEvents(ev); setErrors(er);
    } catch (error) {
      setErrorMessage(error?.message || "Could not load analytics.");
      trackError(error, { source: "analytics_view_load" }, { app_version: appVersion });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const { users, funnel, retention } = useMemo(() => betaCohort(events, errors), [events, errors]);
  const emails = useMemo(() => new Map(events.filter(e => e.event_name === "session_start" && e.event_props?.user_email)
    .map(e => [e.user_id, e.event_props.user_email])), [events]);
  const funnelRows = [["Beta admitted / known", "—"], ["First app session", funnel.firstSession],
    ["Onboarding complete", funnel.onboarding], ["Lesson 1 started", funnel.lesson1Started],
    ["Lesson 1 completed", funnel.lesson1Completed], ["Authored scenario complete", funnel.scenarioCompleted],
    ["Returned after first session", funnel.returned]];
  return <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28 space-y-5">
    <div className="flex items-center justify-between gap-3 pt-4">
      <div><h1 className="text-lg font-semibold">Beta 3 analytics</h1><p className="text-xs text-zinc-400">From {when(COHORT_FROM)} · product events only</p></div>
      <div className="flex gap-2"><button className="rounded-full bg-zinc-800 px-3 py-2 text-sm" onClick={onBack}>Back</button>
        <button className="rounded-full bg-emerald-500 px-3 py-2 text-sm font-semibold text-black" onClick={load} disabled={loading}>Refresh</button></div>
    </div>
    {errorMessage && <p role="alert" className="rounded-xl border border-rose-700 p-3 text-rose-200">{errorMessage}</p>}
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h2 className="font-semibold mb-3">Fresh cohort funnel</h2>
      <div className="space-y-2">{funnelRows.map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-sm border-b border-zinc-800 pb-2"><span>{label}</span><strong>{loading ? "…" : value}</strong></div>)}</div>
      <p className="text-xs text-zinc-400 mt-3">Admitted count and exact persisted completion are unavailable to this admin client: signup data and other users’ user_game rows are protected. Observed lesson counts are not a replacement for user_game.</p>
    </section>
    <section className="grid grid-cols-3 gap-2 text-center">{[["D1", retention.d1], ["D3", retention.d3], ["D7", retention.d7]].map(([name, value]) =>
      <div key={name} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"><div className="text-xs text-zinc-400">{name} return</div><div className="text-xl font-semibold">{loading ? "…" : value}</div></div>)}</section>
    <p className="text-xs text-zinc-400">D1/D3/D7 mean a distinct session on exactly day 1/3/7 after first recorded use, by UTC date. Return means a second session at any time. These are counts, not rates.</p>
    <section className="space-y-3"><h2 className="font-semibold">Learners ({users.length})</h2>
      {!loading && users.length === 0 && <p className="text-sm text-zinc-400">No Beta 3 learner journey recorded yet.</p>}
      {users.map(u => <details key={u.userId} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
        <summary className="cursor-pointer break-all text-sm font-semibold">{emails.get(u.userId) || u.userId}</summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
          <p>First: {when(u.sessionTimes[0] || u.firstSeen)}<br/>Last: {when(u.lastSeen)}<br/>Sessions: {u.sessions.size}</p>
          <p>Lessons started: {u.lessonsStarted.size}<br/>Completed (observed): {u.lessonsCompleted.size}<br/>Last incomplete: {u.lastIncomplete ? `${u.lastIncomplete.lesson_id || "?"} · ${u.lastIncomplete.block_id || "?"} · ${u.lastIncomplete.progress_pct ?? "?"}%` : "—"}</p>
          <p>Scenarios: {count(u,"scenario_started")} started / {count(u,"scenario_completed")} completed<br/>Help uses: {count(u,"scenario_help_used")}<br/>Pronunciation: {u.attempts} attempts / {u.attempts ? Math.round(100*u.passed/u.attempts) : 0}% pass</p>
          <p>Phrases saved: {u.savedPhrases}<br/>Personal scenarios created: {count(u,"personal_scenario_created")}<br/>Errors: {u.errors}</p>
        </div>
      </details>)}
    </section>
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"><h2 className="font-semibold">Errors ({errors.length})</h2>
      <div className="mt-2 max-h-56 overflow-y-auto space-y-2 text-xs">{errors.slice(-30).reverse().map((e,i) => <p key={`${e.created_at}-${i}`} className="border-b border-zinc-800 pb-2">{when(e.created_at)} · {e.error_name}: {e.message}</p>)}</div>
    </section>
  </div>;
}

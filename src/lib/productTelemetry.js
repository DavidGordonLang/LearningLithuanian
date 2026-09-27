export const BETA3_VERSION = "3.0.0-beta";

// Only identifiers, counts and outcomes enter product telemetry. Never pass
// authored or learner-created phrase text, transcripts, titles or profile data.
const keys = new Set([
  "lesson_id", "section_id", "module_id", "block_id", "scenario_id",
  "block_index", "progress_pct", "duration_ms", "accuracy_pct",
  "scoreable_blocks", "wrong_blocks", "xp_awarded", "help_level", "help_count",
  "decisions", "best", "acceptable", "awkward", "repair", "wrong",
  "passed", "attempt_number", "recognition_route", "source", "review",
  "restart", "entry_surface",
  "count",
]);
const sources = new Set(["lesson", "translation", "manual", "scenario"]);
export function safeProductProps(props = {}) {
  return Object.fromEntries(Object.entries(props).filter(([key, value]) => {
    if (!keys.has(key) || value == null) return false;
    if (key === "source") return sources.has(value);
    if (key === "entry_surface") return ["pwa", "browser"].includes(value);
    if (key === "recognition_route") return ["speechmatics", "manual"].includes(value);
    if (typeof value === "string") return /^[a-zA-Z0-9_:-]{1,100}$/.test(value);
    if (typeof value === "number") return Number.isFinite(value) && value >= 0;
    return typeof value === "boolean";
  }));
}

export function lessonProgressMarker(blocks, attempt) {
  const index = Math.max(0, Math.min(blocks.length - 1, Number(attempt?.blockIndex) || 0));
  return { block_id: blocks[index]?.id || null, block_index: index,
    progress_pct: blocks.length ? Math.round(Object.keys(attempt?.completedBlockIds || {}).length / blocks.length * 100) : 0 };
}

export function scenarioSummary(outcomes = [], helpCount = 0) {
  const counts = { best: 0, acceptable: 0, awkward: 0, repair: 0, wrong: 0 };
  for (const outcome of outcomes) if (Object.hasOwn(counts, outcome)) counts[outcome] += 1;
  return { ...counts, help_count: helpCount, decisions: outcomes.length };
}

// Retention is a distinct session_start on a later UTC calendar day. D1/D3/D7
// mean exactly +1/+3/+7 UTC calendar days from the first recorded session.
export function betaCohort(events = [], errors = []) {
  const users = new Map();
  function ensure(id) {
    if (!users.has(id)) users.set(id, { userId: id, firstSeen: null, lastSeen: null,
      sessions: new Set(), sessionTimes: [], counts: {}, savedPhrases: 0, lessonsStarted: new Set(),
      lessonsCompleted: new Set(), lastIncomplete: null, attempts: 0, passed: 0, errors: 0 });
    return users.get(id);
  }
  for (const e of events) {
    if (!e?.user_id || e?.event_name === "tts_preload" || e?.event_name === "tts_stop") continue;
    const u = ensure(e.user_id), name = e.event_name, p = e.event_props || {};
    u.firstSeen = !u.firstSeen || e.created_at < u.firstSeen ? e.created_at : u.firstSeen;
    u.lastSeen = !u.lastSeen || e.created_at > u.lastSeen ? e.created_at : u.lastSeen;
    u.counts[name] = (u.counts[name] || 0) + 1;
    if (name === "phrase_saved") u.savedPhrases += Number(p.count) || 1;
    if (name === "session_start" && e.session_id && !u.sessions.has(e.session_id)) {
      u.sessions.add(e.session_id); u.sessionTimes.push(e.created_at);
    }
    if (name === "lesson_started" && !p.review && p.lesson_id) u.lessonsStarted.add(p.lesson_id);
    if (name === "lesson_completed" && !p.review && p.lesson_id) {
      u.lessonsCompleted.add(p.lesson_id);
      if (u.lastIncomplete?.lesson_id === p.lesson_id) u.lastIncomplete = null;
    }
    if (name === "lesson_exited") u.lastIncomplete = { lesson_id: p.lesson_id, block_id: p.block_id, progress_pct: p.progress_pct };
    if (name === "pronunciation_attempt") { u.attempts++; if (p.passed) u.passed++; }
  }
  for (const e of errors) if (e?.user_id) ensure(e.user_id).errors++;
  const out = [...users.values()].filter(u => u.sessions.size > 0 || u.errors > 0).map(u => {
    const days = [...new Set(u.sessionTimes.map(t => String(t).slice(0, 10)))].sort();
    const first = days[0] ? Date.parse(`${days[0]}T00:00:00Z`) : NaN;
    const returnDays = new Set(days.slice(1).map(d => Math.round((Date.parse(`${d}T00:00:00Z`) - first) / 86400000)));
    return { ...u, returned: u.sessions.size > 1, d1: returnDays.has(1), d3: returnDays.has(3), d7: returnDays.has(7) };
  });
  const count = name => out.filter(u => (u.counts[name] || 0) > 0).length;
  return { users: out.sort((a,b) => String(b.lastSeen).localeCompare(String(a.lastSeen))),
    funnel: { firstSession: count("session_start"), onboarding: count("onboarding_completed"),
      lesson1Started: out.filter(u => u.lessonsStarted.has("section_1_module_1_lesson_1")).length,
      lesson1Completed: out.filter(u => u.lessonsCompleted.has("section_1_module_1_lesson_1")).length,
      scenarioCompleted: count("scenario_completed"), returned: out.filter(u => u.returned).length },
    retention: { d1: out.filter(u => u.d1).length, d3: out.filter(u => u.d3).length, d7: out.filter(u => u.d7).length } };
}

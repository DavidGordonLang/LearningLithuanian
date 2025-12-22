// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "./authStore";

/**
 * Žodis — Supabase phrase sync helpers
 *
 * NOTE (current DB shape):
 * public.phrases: { id(uuid), user_id(uuid), data(jsonb), updated_at(timestamptz) }
 *
 * Because there is no dedicated column for local `_id`, merge currently:
 * - matches cloud rows by parsing `data._id`
 * - writes back via "replace all" (delete user rows, then insert merged set)
 *
 * This is safe for correctness but not the most efficient long-term.
 */

const LS_CONFLICTS_PREFIX = "lt_merge_conflicts_v1:";

/* ---------------------------- Small helpers ---------------------------- */

const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

function normText(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Normalize Lithuanian for matching:
 * - trims
 * - lowercases
 * - unicode NFD -> strips combining marks (diacritics)
 * - removes punctuation/symbols/spaces
 *
 * Examples:
 * "dušu" -> "dusu"
 * "Ar galiu pasinaudoti dušu?" -> "argaliupasinaudotidusu"
 */
export function normalizeLtForKey(input) {
  const s = String(input ?? "").trim().toLowerCase();

  // NFD splits accented chars into base + combining marks.
  // Then remove combining marks.
  const noDiacritics = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove punctuation/symbols/whitespace; keep letters+digits only
  return noDiacritics.replace(/[^a-z0-9]/g, "");
}

/**
 * "Content key" is used only for identifying potential duplicates/conflicts,
 * NOT as a primary identity (we use `_id` for that).
 *
 * We do NOT use English here (by your rule).
 */
export function contentKeyFromRow(row) {
  const lt = row?.Lithuanian ?? "";
  return normalizeLtForKey(lt);
}

function safeTs(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function safeRow(r) {
  // Keep as-is, but ensure the fields exist to avoid undefined checks everywhere
  const out = { ...(r || {}) };
  out.English = String(out.English ?? "");
  out.Lithuanian = String(out.Lithuanian ?? "");
  out.Phonetic = String(out.Phonetic ?? "");
  out.Category = String(out.Category ?? "");
  out.Usage = String(out.Usage ?? "");
  out.Notes = String(out.Notes ?? "");
  out["RAG Icon"] = String(out["RAG Icon"] ?? "");
  out.Sheet = String(out.Sheet ?? "");
  out._id = String(out._id ?? "");
  out._ts = safeTs(out._ts) || Date.now();
  out._qstat = out._qstat ?? null;
  return out;
}

function completenessScore(row) {
  // Only the fields we care about "richness" for.
  // (We deliberately exclude English from scoring to avoid English-driven merges.)
  const r = row || {};
  let score = 0;

  if (isNonEmpty(r.Lithuanian)) score += 3; // core
  if (isNonEmpty(r.Phonetic)) score += 1;
  if (isNonEmpty(r.Category)) score += 1;
  if (isNonEmpty(r["RAG Icon"])) score += 1;
  if (isNonEmpty(r.Usage) && normText(r.Usage) !== "nan" && normText(r.Usage) !== "null") score += 2;
  if (isNonEmpty(r.Notes) && normText(r.Notes) !== "nan" && normText(r.Notes) !== "null") score += 2;

  // Sheet is legacy-ish but still present
  if (isNonEmpty(r.Sheet)) score += 0.5;

  return score;
}

function mergeQstat(a, b) {
  // Keep the "best" stats by taking max per bucket.
  // If either missing, return the other.
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;

  const buckets = ["red", "amb", "grn"];
  const next = {};

  for (const k of buckets) {
    const aa = a?.[k] || { ok: 0, bad: 0 };
    const bb = b?.[k] || { ok: 0, bad: 0 };
    next[k] = {
      ok: Math.max(Number(aa.ok || 0), Number(bb.ok || 0)),
      bad: Math.max(Number(aa.bad || 0), Number(bb.bad || 0)),
    };
  }

  return next;
}

function preferAccentedLithuanian(aLt, bLt) {
  // If one contains diacritics and the other doesn't (but normalized keys match),
  // prefer the accented one.
  const a = String(aLt ?? "");
  const b = String(bLt ?? "");
  const aKey = normalizeLtForKey(a);
  const bKey = normalizeLtForKey(b);
  if (!aKey || aKey !== bKey) return a || b;

  const aHasMarks = a.normalize("NFD") !== a;
  const bHasMarks = b.normalize("NFD") !== b;

  if (aHasMarks && !bHasMarks) return a;
  if (bHasMarks && !aHasMarks) return b;
  // Otherwise keep the longer (often includes punctuation/casing nicely)
  return a.length >= b.length ? a : b;
}

function mergeNonConflicting(localRow, cloudRow) {
  const L = safeRow(localRow);
  const C = safeRow(cloudRow);

  // Start from the "richer" row overall, then selectively upgrade fields.
  const scoreL = completenessScore(L);
  const scoreC = completenessScore(C);

  let base = scoreL > scoreC ? L : scoreC > scoreL ? C : safeTs(L._ts) >= safeTs(C._ts) ? L : C;
  let other = base === L ? C : L;

  // Field-by-field upgrades where "other" is clearly better.
  // Never overwrite a non-empty with empty / junk.
  const pickText = (a, b) => {
    const aa = String(a ?? "");
    const bb = String(b ?? "");
    const aOk = isNonEmpty(aa) && normText(aa) !== "nan" && normText(aa) !== "null";
    const bOk = isNonEmpty(bb) && normText(bb) !== "nan" && normText(bb) !== "null";
    if (aOk && !bOk) return aa;
    if (bOk && !aOk) return bb;
    if (aOk && bOk) return aa.length >= bb.length ? aa : bb; // keep richer text
    return aa || bb;
  };

  const merged = {
    ...base,

    // Lithuanian: special handling (accent preference if same normalized)
    Lithuanian: preferAccentedLithuanian(base.Lithuanian, other.Lithuanian),

    // These can be upgraded by richness
    Phonetic: pickText(base.Phonetic, other.Phonetic),
    Category: pickText(base.Category, other.Category),
    Usage: pickText(base.Usage, other.Usage),
    Notes: pickText(base.Notes, other.Notes),

    // RAG: if one is empty, take the other; otherwise keep base
    "RAG Icon": isNonEmpty(base["RAG Icon"]) ? base["RAG Icon"] : other["RAG Icon"],

    // Sheet: keep base unless empty
    Sheet: isNonEmpty(base.Sheet) ? base.Sheet : other.Sheet,

    // Stats: keep strongest
    _qstat: mergeQstat(base._qstat, other._qstat),

    // Timestamp: newest edit wins for `_ts`
    _ts: Math.max(safeTs(base._ts), safeTs(other._ts)),
  };

  return merged;
}

function isSamePhraseVariant(a, b) {
  // IMPORTANT:
  // - We treat diacritic differences as the same phrase (dusu vs dušu).
  // - We do NOT treat real letter differences as the same (masc/fem etc).
  // So: compare normalized Lithuanian keys.
  const ak = normalizeLtForKey(a?.Lithuanian);
  const bk = normalizeLtForKey(b?.Lithuanian);
  return ak && bk && ak === bk;
}

/* ------------------------------ Public API ----------------------------- */

/**
 * Replace ALL phrases for the current user in Supabase
 * (upload local → cloud)
 */
export async function replaceUserPhrases(rows) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const safe = Array.isArray(rows) ? rows : [];

  // HARD DELETE — scoped to user
  const { error: delErr } = await supabase.from("phrases").delete().eq("user_id", user.id);
  if (delErr) throw delErr;

  if (!safe.length) return;

  const payload = safe.map((r) => ({
    user_id: user.id,
    data: r,
  }));

  const { error: insErr } = await supabase.from("phrases").insert(payload);
  if (insErr) throw insErr;
}

/**
 * Fetch ALL phrases for the current user
 * (cloud → local)
 */
export async function fetchUserPhrases() {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.from("phrases").select("data").eq("user_id", user.id);
  if (error) throw error;

  return (data || []).map((row) => row.data);
}

/**
 * Merge local phrases with cloud phrases for the current user.
 *
 * What it does:
 * - Matches by `_id` first.
 * - If same `_id` but Lithuanian differs (normalized), it becomes a CONFLICT.
 * - If same phrase variant (Lithuanian normalized same), it auto-merges by "richest wins"
 *   with `_ts` tie-breaks and safe field upgrades.
 * - Produces:
 *   - mergedRows (the new local library to set)
 *   - conflicts (persistent list you can show later)
 * - Writes mergedRows to cloud using replace-all (safe with current schema)
 *
 * IMPORTANT:
 * This function does NOT delete anything from cloud unless you pass tombstones
 * (future). For now, deletions remain local-only unless you implement tombstones.
 */
export async function mergeUserPhrases(localRows, opts = {}) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const {
    persistConflicts = true,
    conflictStorageKey = `${LS_CONFLICTS_PREFIX}${user.id}`,
  } = opts;

  const local = (Array.isArray(localRows) ? localRows : []).map(safeRow);

  // Fetch cloud full payload so we can match by data._id
  const { data: cloudRecords, error } = await supabase
    .from("phrases")
    .select("id, data, updated_at")
    .eq("user_id", user.id);

  if (error) throw error;

  const cloud = (cloudRecords || []).map((rec) => safeRow(rec.data));

  // Index by _id
  const localById = new Map();
  for (const r of local) {
    if (!r._id) continue;
    // If duplicates exist locally by _id (shouldn't), keep newest
    const prev = localById.get(r._id);
    if (!prev || safeTs(r._ts) >= safeTs(prev._ts)) localById.set(r._id, r);
  }

  const cloudById = new Map();
  for (const r of cloud) {
    if (!r._id) continue;
    const prev = cloudById.get(r._id);
    if (!prev || safeTs(r._ts) >= safeTs(prev._ts)) cloudById.set(r._id, r);
  }

  const allIds = new Set([...localById.keys(), ...cloudById.keys()]);

  const mergedRows = [];
  const conflicts = [];

  for (const id of allIds) {
    const L = localById.get(id) || null;
    const C = cloudById.get(id) || null;

    if (L && !C) {
      mergedRows.push(L);
      continue;
    }
    if (C && !L) {
      mergedRows.push(C);
      continue;
    }

    // Both exist
    if (!isSamePhraseVariant(L, C)) {
      // Same _id but different Lithuanian variant => conflict
      conflicts.push({
        type: "ID_LITHUANIAN_MISMATCH",
        _id: id,
        local: L,
        cloud: C,
        at: Date.now(),
        reason:
          "Same _id exists locally and in cloud, but Lithuanian differs (after normalization). Needs manual choice.",
      });

      // Keep BOTH versions in mergedRows so the user doesn't lose either:
      // - keep local as-is
      // - and keep cloud as a "shadow copy" with a derived _id to avoid collisions locally
      //
      // This prevents silent loss today, and makes conflicts visible later.
      // You can later surface these in a conflict UI.
      mergedRows.push(L);

      const shadow = {
        ...C,
        _id: `${C._id}__cloudcopy`,
        _conflict: true,
        _conflictOf: C._id,
        _conflictSource: "cloud",
        _ts: safeTs(C._ts) || Date.now(),
      };
      mergedRows.push(shadow);
      continue;
    }

    // Non-conflicting: auto-merge
    mergedRows.push(mergeNonConflicting(L, C));
  }

  // Persist conflicts locally so they show up on the next merge too
  if (persistConflicts) {
    try {
      const existingRaw = localStorage.getItem(conflictStorageKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const safeExisting = Array.isArray(existing) ? existing : [];

      // De-dupe conflicts by (_id + type + local/cloud contentKey)
      const keyOf = (c) => {
        const lk = contentKeyFromRow(c?.local);
        const ck = contentKeyFromRow(c?.cloud);
        return `${c.type}::${c._id}::${lk}::${ck}`;
      };

      const seen = new Set(safeExisting.map(keyOf));
      const next = [...safeExisting];

      for (const c of conflicts) {
        const k = keyOf(c);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(c);
      }

      localStorage.setItem(conflictStorageKey, JSON.stringify(next));
    } catch {
      // non-fatal
    }
  }

  // Write merged rows back to cloud (safe with current schema)
  // NOTE: This includes any `__cloudcopy` conflict rows too.
  // If you want to avoid polluting cloud with conflict copies, we can filter them out.
  await replaceUserPhrases(mergedRows);

  return {
    mergedRows,
    conflicts,
    summary: {
      localCount: local.length,
      cloudCount: cloud.length,
      mergedCount: mergedRows.length,
      conflictCount: conflicts.length,
    },
  };
}

/**
 * Read stored conflicts for the current user (localStorage only, for now).
 */
export function getStoredMergeConflicts() {
  const { user } = useAuthStore.getState();
  if (!user) return [];
  const key = `${LS_CONFLICTS_PREFIX}${user.id}`;

  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored conflicts (localStorage only, for now).
 * You will likely call this AFTER a user resolves them.
 */
export function clearStoredMergeConflicts() {
  const { user } = useAuthStore.getState();
  if (!user) return;
  const key = `${LS_CONFLICTS_PREFIX}${user.id}`;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

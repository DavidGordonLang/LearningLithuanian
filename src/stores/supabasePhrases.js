// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "./authStore";
import { mergeUserPhrases as mergeEngine } from "./mergeUserPhrases";

function scoreRow(r) {
  if (!r) return 0;
  const fields = ["English", "Lithuanian", "Phonetic", "Category", "Usage", "Notes", "RAG Icon"];
  let filled = 0;
  for (const k of fields) {
    const v = r?.[k];
    if (typeof v === "string" && v.trim()) filled += 1;
  }
  // slight preference for not-deleted when other signals equal
  const notDeleted = r?._deleted ? 0 : 0.5;
  return filled + notDeleted;
}

function pickWinner(a, b) {
  if (!a) return b;
  if (!b) return a;

  const ats = Number(a?._ts || 0);
  const bts = Number(b?._ts || 0);

  if (ats !== bts) return bts > ats ? b : a;

  // same ts: prefer not-deleted
  const aDel = !!a?._deleted;
  const bDel = !!b?._deleted;
  if (aDel !== bDel) return aDel ? b : a;

  // same: prefer more complete row
  const as = scoreRow(a);
  const bs = scoreRow(b);
  if (as !== bs) return bs > as ? b : a;

  // stable fallback: keep existing
  return a;
}

function dedupeRowsForCloud(rows) {
  const input = Array.isArray(rows) ? rows.filter(Boolean) : [];
  if (!input.length) return { rows: [], removed: 0 };

  // Pass 1: dedupe by _id (most common primary identity)
  const byId = new Map();
  const noId = [];

  for (const r of input) {
    const id = r?._id ? String(r._id) : "";
    if (!id) {
      noId.push(r);
      continue;
    }
    const prev = byId.get(id);
    byId.set(id, pickWinner(prev, r));
  }

  // Pass 2: dedupe by contentKey (covers schema with unique(user_id, contentKey))
  const byContentKey = new Map();
  const noKey = [];

  for (const r of [...byId.values(), ...noId]) {
    const ck = r?.contentKey ? String(r.contentKey) : "";
    if (!ck) {
      noKey.push(r);
      continue;
    }
    const prev = byContentKey.get(ck);
    byContentKey.set(ck, pickWinner(prev, r));
  }

  // Final list: contentKey winners + anything without contentKey
  const final = [...byContentKey.values(), ...noKey];

  // Stable ordering (helps diffing/debugging)
  final.sort((a, b) => {
    const ats = Number(a?._ts || 0);
    const bts = Number(b?._ts || 0);
    if (ats !== bts) return bts - ats;
    const aId = String(a?._id || "");
    const bId = String(b?._id || "");
    return aId.localeCompare(bId);
  });

  const removed = Math.max(0, input.length - final.length);
  return { rows: final, removed };
}

/**
 * Replace ALL phrases for the current user in Supabase
 * (upload local → cloud)
 */
export async function replaceUserPhrases(rows) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const { rows: safeRows, removed } = dedupeRowsForCloud(rows);

  // HARD DELETE — scoped to user
  const { error: delErr } = await supabase
    .from("phrases")
    .delete()
    .eq("user_id", user.id);
  if (delErr) throw delErr;

  if (!safeRows?.length) return;

  const payload = safeRows.map((r) => ({
    user_id: user.id,
    data: r,
  }));

  const { error: insErr } = await supabase.from("phrases").insert(payload);
  if (insErr) {
    // Add context to help diagnose future edge cases
    const hint =
      removed > 0
        ? ` (note: ${removed} duplicates were auto-removed before insert)`
        : "";
    throw new Error((insErr?.message || "Insert failed") + hint);
  }
}

/**
 * Fetch ALL phrases for the current user
 * (cloud → local)
 */
export async function fetchUserPhrases() {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("phrases")
    .select("data")
    .eq("user_id", user.id);
  if (error) throw error;

  return (data || []).map((row) => row.data);
}

/**
 * Merge local rows with cloud rows (SAFE; returns conflicts + stats)
 *
 * Behaviour:
 * - Fetch cloud
 * - Run pure merge engine
 * - If conflicts exist: DO NOT write to cloud (yet) — return conflicts for UI resolution
 * - If no conflicts: write merged set back to cloud (full replace), return result
 *
 * NOTE:
 * Persisting unresolved conflicts server-side is a later step (schema + UI).
 */
export async function mergeUserPhrases(localRows) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  const cloudRows = await fetchUserPhrases();

  const { mergedRows, conflicts, stats } = mergeEngine(localRows, cloudRows);

  if (conflicts.length) {
    return { mergedRows, conflicts, stats, wroteToCloud: false };
  }

  await replaceUserPhrases(mergedRows);
  return { mergedRows, conflicts: [], stats, wroteToCloud: true };
}
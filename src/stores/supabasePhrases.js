// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "./authStore";
import { mergeUserPhrases as mergeEngine } from "./mergeUserPhrases";

/**
 * Replace ALL phrases for the current user in Supabase
 * (upload local → cloud)
 */
export async function replaceUserPhrases(rows) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  // HARD DELETE — scoped to user
  const { error: delErr } = await supabase.from("phrases").delete().eq("user_id", user.id);
  if (delErr) throw delErr;

  if (!rows?.length) return;

  const payload = rows.map((r) => ({
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

  // If conflicts exist, don't write merged result yet.
  // (Later: we’ll persist conflicts to Supabase so they show up on future merges.)
  if (conflicts.length) {
    return { mergedRows, conflicts, stats, wroteToCloud: false };
  }

  await replaceUserPhrases(mergedRows);
  return { mergedRows, conflicts: [], stats, wroteToCloud: true };
}

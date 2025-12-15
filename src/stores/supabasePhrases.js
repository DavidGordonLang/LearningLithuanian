// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";

/**
 * INTERNAL: get the currently authenticated user
 * Throws hard if auth state is invalid — this should never be silent.
 */
async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return user;
}

/**
 * Replace the current user's phrase library in Supabase.
 * This is DESTRUCTIVE per-user, but SAFE by design.
 */
export async function replaceUserPhrases(rows) {
  const user = await requireUser();
  const userId = user.id;

  // Defensive: ensure rows is always an array
  const safeRows = Array.isArray(rows) ? rows : [];

  // 1) Delete ONLY this user's phrases
  const { error: deleteError } = await supabase
    .from("phrases")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`);
  }

  // 2) Insert new rows (if any)
  if (safeRows.length === 0) return;

  const payload = safeRows.map((row) => ({
    user_id: userId,
    data: row, // stored as JSONB
  }));

  const { error: insertError } = await supabase
    .from("phrases")
    .insert(payload);

  if (insertError) {
    throw new Error(`Insert failed: ${insertError.message}`);
  }
}

/**
 * Fetch the current user's phrase library from Supabase.
 * Returns a flat array of phrase objects (same shape as local store).
 */
export async function fetchUserPhrases() {
  const user = await requireUser();
  const userId = user.id;

  const { data, error } = await supabase
    .from("phrases")
    .select("data")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Fetch failed: ${error.message}`);
  }

  // Flatten JSONB rows back into plain phrase objects
  return (data || []).map((row) => row.data);
}

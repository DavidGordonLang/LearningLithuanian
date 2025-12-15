import { supabase } from "../supabaseClient";

/**
 * Fetch all phrases for the current user
 */
export async function fetchUserPhrases() {
  const {
    data,
    error,
  } = await supabase
    .from("phrases")
    .select("id, data, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Replace entire user library (initial sync)
 */
export async function replaceUserPhrases(rows) {
  // Delete existing rows
  const { error: delErr } = await supabase
    .from("phrases")
    .delete();

  if (delErr) throw delErr;

  // Insert fresh rows
  const payload = rows.map((r) => ({
    data: r,
  }));

  const { error: insErr } = await supabase
    .from("phrases")
    .insert(payload);

  if (insErr) throw insErr;
}

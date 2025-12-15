// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";

/**
 * Replace the current user's phrase library in Supabase
 * This is intentionally destructive *per user only*
 */
export async function replaceUserPhrases(rows) {
  // 1. Get the logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const userId = user.id;

  // 2. Delete ONLY this user's existing phrases
  const { error: deleteError } = await supabase
    .from("phrases")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw deleteError;
  }

  // 3. Insert new rows (if any)
  if (!rows || rows.length === 0) return;

  const payload = rows.map((row) => ({
    user_id: userId,
    data: row, // JSONB column
  }));

  const { error: insertError } = await supabase
    .from("phrases")
    .insert(payload);

  if (insertError) {
    throw insertError;
  }
}

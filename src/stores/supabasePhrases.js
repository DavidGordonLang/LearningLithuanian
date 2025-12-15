// src/stores/supabasePhrases.js
import { supabase } from "../supabaseClient";
import { useAuthStore } from "./authStore";

/**
 * Replace ALL phrases for the current user in Supabase
 * (upload local → cloud)
 */
export async function replaceUserPhrases(rows) {
  const { user } = useAuthStore.getState();
  if (!user) throw new Error("Not authenticated");

  // HARD DELETE — scoped to user
  const { error: delErr } = await supabase
    .from("phrases")
    .delete()
    .eq("user_id", user.id);

  if (delErr) throw delErr;

  if (!rows.length) return;

  const payload = rows.map((r) => ({
    user_id: user.id,
    data: r,
  }));

  const { error: insErr } = await supabase
    .from("phrases")
    .insert(payload);

  if (insErr) throw insErr;
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

  // Return raw phrase rows exactly as stored
  return data.map((row) => row.data);
}

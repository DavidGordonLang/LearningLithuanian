// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import { IS_AUDIT_MODE } from "./auditMode";

// The isolated audit build must never receive or use production Supabase data.
const supabaseUrl = IS_AUDIT_MODE
  ? "https://audit.invalid"
  : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = IS_AUDIT_MODE
  ? "audit-placeholder"
  : import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,

    // ✅ REQUIRED for OAuth to complete on return (code/hash processing)
    detectSessionInUrl: true,
  },
});

// src/hooks/useBetaAllowlist.js
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const ALLOWLIST_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, label = "timeout") {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    Promise.resolve(promise)
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

/**
 * Preserve existing semantics:
 * - If no email yet: checked=true, allowed=false (so app can route to AuthGate/BetaBlocked)
 * - If allowlist query fails/hangs: checked=true, allowed=false (blocked, but NOT stuck)
 * - If allowlisted: checked=true, allowed=true
 */
export function useBetaAllowlist(email) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState(null);

  // Prevent state updates after unmount / rapid email changes
  const runIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const myRunId = ++runIdRef.current;

    async function checkAllowlist() {
      // Important: do not hang on loading if email is missing
      if (!email) {
        setAllowed(false);
        setError(null);
        setChecked(true);
        return;
      }

      setChecked(false);
      setAllowed(false);
      setError(null);

      try {
        const query = supabase
          .from("beta_allowlist")
          .select("email")
          .eq("email", email)
          .limit(1)
          .maybeSingle();

        const { data, error: qErr } = await withTimeout(
          query,
          ALLOWLIST_TIMEOUT_MS,
          "allowlist_query_timeout"
        );

        if (cancelled || runIdRef.current !== myRunId) return;

        if (qErr) {
          // Fail closed but never hang
          console.warn("Allowlist query error:", qErr);
          setAllowed(false);
          setError(qErr);
          setChecked(true);
          return;
        }

        setAllowed(Boolean(data?.email));
        setChecked(true);
      } catch (err) {
        if (cancelled || runIdRef.current !== myRunId) return;
        // Fail closed but never hang
        console.warn("Allowlist check failed:", err);
        setAllowed(false);
        setError(err);
        setChecked(true);
      }
    }

    checkAllowlist();

    return () => {
      cancelled = true;
    };
  }, [email]);

  return { allowlistChecked: checked, isAllowlisted: allowed, allowlistError: error };
}

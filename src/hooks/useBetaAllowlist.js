// src/hooks/useBetaAllowlist.js
import { useEffect, useRef, useState } from "react";

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
 * useBetaAllowlist
 * - Checks Supabase table `beta_allowlist` for the current user's email
 * - Returns { checked, allowed }
 * - Defensive: checked ALWAYS becomes true (even on hang/error)
 * - Preserves existing behavior and UI flow
 */
export default function useBetaAllowlist({ userEmail, supabase }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  // Avoid setState after unmount / rapid email changes
  const runIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const myRunId = ++runIdRef.current;

    async function check() {
      if (!userEmail) {
        if (!alive || runIdRef.current !== myRunId) return;
        setAllowed(false);
        setChecked(true);
        return;
      }

      setChecked(false);

      const email = String(userEmail).toLowerCase();

      try {
        const query = supabase
          .from("beta_allowlist")
          .select("email")
          .eq("email", email)
          .limit(1);

        const { data, error } = await withTimeout(
          query,
          ALLOWLIST_TIMEOUT_MS,
          "allowlist_query_timeout"
        );

        if (!alive || runIdRef.current !== myRunId) return;

        if (error) {
          console.warn("Allowlist check failed:", error);
          setAllowed(false);
          setChecked(true);
          return;
        }

        setAllowed((data?.length || 0) > 0);
        setChecked(true);
      } catch (err) {
        if (!alive || runIdRef.current !== myRunId) return;
        console.warn("Allowlist check failed (exception/timeout):", err);
        setAllowed(false); // fail closed
        setChecked(true); // but never hang
      }
    }

    check();

    return () => {
      alive = false;
    };
  }, [userEmail, supabase]);

  return { checked, allowed };
}

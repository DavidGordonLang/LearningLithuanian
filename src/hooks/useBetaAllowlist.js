// src/hooks/useBetaAllowlist.js
import { useEffect, useState } from "react";

/**
 * useBetaAllowlist
 * - Checks Supabase table `beta_allowlist` for the current user's email
 * - Returns { checked, allowed }
 * - Conservative: re-checks when email changes
 */
export default function useBetaAllowlist({ userEmail, supabase }) {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    async function check() {
      if (!userEmail) {
        if (!alive) return;
        setAllowed(false);
        setChecked(true);
        return;
      }

      setChecked(false);

      const email = String(userEmail).toLowerCase();

      const { data, error } = await supabase
        .from("beta_allowlist")
        .select("email")
        .eq("email", email)
        .limit(1);

      if (!alive) return;

      if (error) {
        console.warn("Allowlist check failed:", error);
        setAllowed(false);
        setChecked(true);
        return;
      }

      setAllowed((data?.length || 0) > 0);
      setChecked(true);
    }

    check();

    return () => {
      alive = false;
    };
  }, [userEmail, supabase]);

  return { checked, allowed };
}

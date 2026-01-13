// src/hooks/useLocalStorageState.js
import { useEffect, useState } from "react";

/**
 * useLocalStorageState
 * - Small utility for persisted UI state (page, sort, flags)
 * - Conservative: reads once on mount, writes on change
 */
export default function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

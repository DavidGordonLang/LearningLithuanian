// src/hooks/useDailyRecall.js
import { useEffect, useMemo, useRef, useState } from "react";

const LSK_DAILY_RECALL_ENABLED = "lt_daily_recall_enabled";
const LSK_DAILY_RECALL_LAST_DATE = "lt_daily_recall_last_date";
const LSK_DAILY_RECALL_LAST_ID = "lt_daily_recall_last_id";

function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeGetLS(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLS(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function seededRng(seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;

  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeRagIcon(icon) {
  const s = String(icon || "").trim().toLowerCase();
  if (icon === "🔴" || s === "red") return "🔴";
  if (icon === "🟢" || s === "green") return "🟢";
  return "🟠";
}

export function getEnglishForRecall(r) {
  return (
    (r?.EnglishNatural && String(r.EnglishNatural).trim()) ||
    (r?.English && String(r.English).trim()) ||
    (r?.EnglishLiteral && String(r.EnglishLiteral).trim()) ||
    ""
  );
}

function isUsableRow(r) {
  if (!r) return false;
  if (r._deleted) return false;
  const lt = String(r.Lithuanian || "").trim();
  const en = getEnglishForRecall(r);
  if (!lt || !en) return false;
  if (/translation error/i.test(lt)) return false;
  return true;
}

function weightForRow(r) {
  const rag = normalizeRagIcon(r?.["RAG Icon"]);
  if (rag === "🔴") return 6;
  if (rag === "🟠") return 3;
  return 1;
}

function weightedPick(items, weights, rand) {
  let total = 0;
  for (const w of weights) total += Math.max(0, w || 0);
  if (!total) return null;

  let x = rand() * total;
  for (let i = 0; i < items.length; i++) {
    x -= Math.max(0, weights[i] || 0);
    if (x <= 0) return items[i];
  }
  return items[items.length - 1] || null;
}

async function fetchStarterPhrasesOnce(cacheRef) {
  if (cacheRef.current?.ready) return cacheRef.current.rows || [];
  if (cacheRef.current?.promise) return cacheRef.current.promise;

  cacheRef.current = { ready: false, rows: [], promise: null };

  cacheRef.current.promise = (async () => {
    try {
      const res = await fetch("/data/starter_en_to_lt.json", {
        cache: "force-cache",
      });
      if (!res.ok) throw new Error("starter fetch failed");
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      cacheRef.current = { ready: true, rows, promise: null };
      return rows;
    } catch {
      cacheRef.current = { ready: true, rows: [], promise: null };
      return [];
    }
  })();

  return cacheRef.current.promise;
}

export default function useDailyRecall({
  rows = [],
  blocked = false,
  minLibraryForUserMode = 8,
}) {
  const [enabled, setEnabledState] = useState(() => {
    const v = safeGetLS(LSK_DAILY_RECALL_ENABLED);
    if (v === null) return true; // default ON
    return v !== "0";
  });

  const [isOpen, setIsOpen] = useState(false);
  const [phrase, setPhrase] = useState(null);

  const starterCacheRef = useRef(null);
  const choosingRef = useRef(false);

  const todayKey = useMemo(() => getLocalDateKey(new Date()), []);
  const lastShownDate = safeGetLS(LSK_DAILY_RECALL_LAST_DATE) || "";
  const lastShownId = safeGetLS(LSK_DAILY_RECALL_LAST_ID) || "";

  const usableUserRows = useMemo(() => rows.filter(isUsableRow), [rows]);

  function setEnabled(next) {
    setEnabledState(!!next);
    safeSetLS(LSK_DAILY_RECALL_ENABLED, next ? "1" : "0");
  }

  function markShownToday(selected) {
    safeSetLS(LSK_DAILY_RECALL_LAST_DATE, todayKey);
    if (selected?._id) safeSetLS(LSK_DAILY_RECALL_LAST_ID, String(selected._id));
  }

  function close() {
    if (phrase) markShownToday(phrase);
    setIsOpen(false);
  }

  async function choosePhrase({ force = false } = {}) {
    if (choosingRef.current) return;
    choosingRef.current = true;

    try {
      // If we've already shown today AND we can find the same phrase, reuse it.
      // This is the key fix that stops "random" behaviour on the same day.
      if (lastShownDate === todayKey && lastShownId) {
        const existing = usableUserRows.find(
          (r) => String(r?._id || "") === String(lastShownId)
        );
        if (existing) {
          setPhrase(existing);
          setIsOpen(true);
          return;
        }
      }

      const shouldUseUser = usableUserRows.length >= minLibraryForUserMode;
      const rand = seededRng(`daily_recall|${todayKey}`);

      if (shouldUseUser) {
        // Only avoid repeats across days (not within the same day).
        // If lastShownDate !== todayKey, we can exclude lastShownId to reduce "same as yesterday" feel.
        const pool =
          usableUserRows.length > 1 && lastShownId && lastShownDate !== todayKey
            ? usableUserRows.filter(
                (r) => String(r._id || "") !== String(lastShownId)
              )
            : usableUserRows;

        const weights = pool.map(weightForRow);
        const picked = weightedPick(pool, weights, rand) || pool[0] || null;

        setPhrase(picked);
        setIsOpen(!!picked);
        return;
      }

      // Starter fallback
      const starter = await fetchStarterPhrasesOnce(starterCacheRef);
      const usableStarter = starter.filter((r) => {
        const lt = String(r?.Lithuanian || "").trim();
        const en =
          (r?.EnglishNatural && String(r.EnglishNatural).trim()) ||
          (r?.English && String(r.English).trim()) ||
          (r?.EnglishLiteral && String(r.EnglishLiteral).trim()) ||
          "";
        return !!lt && !!en;
      });

      if (!usableStarter.length) {
        setPhrase(null);
        setIsOpen(false);
        return;
      }

      const idx = Math.floor(rand() * usableStarter.length);
      const picked = usableStarter[idx] || usableStarter[0];

      setPhrase(picked);
      setIsOpen(true);
    } finally {
      choosingRef.current = false;
    }
  }

  // Auto-show: once/day
  useEffect(() => {
    if (!enabled) return;
    if (blocked) return;
    if (lastShownDate === todayKey) return;

    choosePhrase({ force: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, blocked, todayKey, lastShownDate, usableUserRows.length]);

  // Manual trigger: re-open even if already shown today (and now it will reuse same phrase)
  async function showNow() {
    if (blocked) return;
    await choosePhrase({ force: true });
  }

  return {
    enabled,
    setEnabled,
    isOpen,
    phrase,
    close,
    showNow,
  };
}

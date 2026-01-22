// src/hooks/training/useMatchPairsSession.js
import { useEffect, useMemo, useRef, useState } from "react";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function pickRandomUnique(rows, n) {
  if (!Array.isArray(rows)) return [];
  if (rows.length <= n) return [...rows];
  const copy = shuffle(rows);
  return copy.slice(0, n);
}

function getEn(row) {
  return safeStr(row?.EN ?? row?.English ?? row?.en ?? row?.english ?? "");
}

function getLt(row) {
  return safeStr(row?.LT ?? row?.Lithuanian ?? row?.lt ?? row?.lithuanian ?? "");
}

/**
 * Duolingo-style Match Pairs session (in-memory)
 * - Words + Numbers only (caller filters)
 * - 10 pairs by default
 * - Correct: both tiles lock + green
 * - Wrong: both tiles grey-fade briefly then revert
 */
export function useMatchPairsSession({ eligibleRows, pairCount = 10 }) {
  const [tiles, setTiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set());
  const [mismatchIds, setMismatchIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [showDone, setShowDone] = useState(false);

  const timeoutRef = useRef(null);

  const canStart = useMemo(() => {
    const list = Array.isArray(eligibleRows) ? eligibleRows : [];
    // need at least pairCount unique entries
    return list.length >= pairCount;
  }, [eligibleRows, pairCount]);

  const progress = useMemo(() => {
    const done = matchedPairIds.size;
    return { done, total: pairCount };
  }, [matchedPairIds, pairCount]);

  const elapsedSec = useMemo(() => {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }, [startedAt, showDone]); // recompute when done toggles

  function clearTimers() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function buildRun() {
    clearTimers();
    const base = pickRandomUnique(eligibleRows, pairCount);

    const built = [];
    base.forEach((row, idx) => {
      const pairId = `p_${idx}_${Math.random().toString(16).slice(2)}`;
      const en = getEn(row);
      const lt = getLt(row);

      // If either side is empty, skip this entry
      if (!en || !lt) return;

      built.push({
        id: `t_en_${pairId}`,
        pairId,
        side: "en",
        text: en,
      });

      built.push({
        id: `t_lt_${pairId}`,
        pairId,
        side: "lt",
        text: lt,
      });
    });

    const shuffled = shuffle(built);

    setTiles(shuffled);
    setSelectedId(null);
    setMatchedPairIds(new Set());
    setMismatchIds([]);
    setBusy(false);
    setMistakes(0);
    setStartedAt(Date.now());
    setShowDone(false);
  }

  useEffect(() => {
    // Auto-build only if we can start
    if (canStart) buildRun();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStart, pairCount]);

  const selectedTile = useMemo(
    () => tiles.find((t) => t.id === selectedId) || null,
    [tiles, selectedId]
  );

  function isMatched(tile) {
    return matchedPairIds.has(tile.pairId);
  }

  function tapTile(tileId) {
    if (busy) return;
    if (showDone) return;

    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    if (isMatched(tile)) return;
    if (mismatchIds.length) return;

    if (!selectedId) {
      setSelectedId(tileId);
      return;
    }

    if (selectedId === tileId) {
      setSelectedId(null);
      return;
    }

    const a = selectedTile;
    const b = tile;
    if (!a || !b) {
      setSelectedId(null);
      return;
    }

    // Must not allow selecting two tiles from the same side? Duolingo allows but it’s pointless.
    // We'll allow it; mismatch will happen unless same pairId.
    if (a.pairId === b.pairId) {
      // match
      const next = new Set(matchedPairIds);
      next.add(a.pairId);
      setMatchedPairIds(next);
      setSelectedId(null);

      // done?
      if (next.size >= pairCount) {
        setShowDone(true);
      }
      return;
    }

    // mismatch
    setBusy(true);
    setMismatchIds([a.id, b.id]);
    setMistakes((m) => m + 1);

    timeoutRef.current = setTimeout(() => {
      setMismatchIds([]);
      setSelectedId(null);
      setBusy(false);
      timeoutRef.current = null;
    }, 520);
  }

  return {
    canStart,
    tiles,
    selectedId,
    matchedPairIds,
    mismatchIds,
    busy,
    mistakes,
    progress,
    showDone,
    elapsedSec,
    tapTile,
    runAgain: buildRun,
    finish: () => setShowDone(false),
    clearTimers,
  };
}

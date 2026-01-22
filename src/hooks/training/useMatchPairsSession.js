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
 * Match Pairs session (paged)
 * - Words + Numbers only (caller filters)
 * - Total 20 pairs per run, delivered as 4 pages x 5 pairs
 * - EN always left, LT always right
 * - User matches left -> right
 * - Correct match: tiles "fade to almost nothing" but remain in layout
 * - Wrong match: both tiles grey-fade briefly then revert
 * - Page cleared: grid fades out, new page fades in
 */
export function useMatchPairsSession({
  eligibleRows,
  totalPairs = 20,
  pagePairs = 5,
  mismatchMs = 520,
  pageFadeOutMs = 280,
  pageFadeInMs = 220,
}) {
  const [pages, setPages] = useState([]); // [{ pageIndex, left:[], right:[] }]
  const [pageIndex, setPageIndex] = useState(0);

  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set()); // for CURRENT page
  const [mismatchIds, setMismatchIds] = useState([]);

  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("ready"); // "ready" | "pageFadeOut" | "pageFadeIn"
  const [mistakes, setMistakes] = useState(0);
  const [overallMatched, setOverallMatched] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [showDone, setShowDone] = useState(false);

  const timersRef = useRef([]);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  const requiredPairs = totalPairs;
  const requiredPages = Math.ceil(totalPairs / pagePairs);

  const canStart = useMemo(() => {
    const list = Array.isArray(eligibleRows) ? eligibleRows : [];
    return list.length >= requiredPairs;
  }, [eligibleRows, requiredPairs]);

  const currentPage = useMemo(() => pages[pageIndex] || null, [pages, pageIndex]);

  const elapsedSec = useMemo(() => {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }, [startedAt, showDone]);

  function buildRun() {
    clearTimers();

    // Build 20 pairs first
    const base = pickRandomUnique(eligibleRows, requiredPairs);

    // Turn into pair objects, skipping invalids
    const pairs = [];
    for (let i = 0; i < base.length; i++) {
      const row = base[i];
      const en = getEn(row);
      const lt = getLt(row);
      if (!en || !lt) continue;

      pairs.push({
        pairId: `p_${i}_${Math.random().toString(16).slice(2)}`,
        en,
        lt,
      });

      if (pairs.length >= requiredPairs) break;
    }

    // If we failed to assemble enough valid pairs (empty EN/LT entries), block start
    if (pairs.length < requiredPairs) {
      setPages([]);
      setPageIndex(0);
      setSelectedLeftId(null);
      setMatchedPairIds(new Set());
      setMismatchIds([]);
      setBusy(false);
      setPhase("ready");
      setMistakes(0);
      setOverallMatched(0);
      setStartedAt(Date.now());
      setShowDone(false);
      return;
    }

    // Split into pages of 5
    const builtPages = [];
    let idx = 0;
    for (let p = 0; p < requiredPages; p++) {
      const chunk = pairs.slice(idx, idx + pagePairs);
      idx += pagePairs;

      // left tiles EN, right tiles LT; shuffle inside each column independently
      const left = shuffle(
        chunk.map((x) => ({
          id: `t_en_${x.pairId}`,
          pairId: x.pairId,
          side: "en",
          text: x.en,
        }))
      );

      const right = shuffle(
        chunk.map((x) => ({
          id: `t_lt_${x.pairId}`,
          pairId: x.pairId,
          side: "lt",
          text: x.lt,
        }))
      );

      builtPages.push({ pageIndex: p, left, right });
    }

    setPages(builtPages);
    setPageIndex(0);
    setSelectedLeftId(null);
    setMatchedPairIds(new Set());
    setMismatchIds([]);
    setBusy(false);
    setPhase("ready");
    setMistakes(0);
    setOverallMatched(0);
    setStartedAt(Date.now());
    setShowDone(false);
  }

  useEffect(() => {
    if (canStart) buildRun();
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStart, requiredPairs, pagePairs]);

  const progress = useMemo(
    () => ({
      matched: overallMatched,
      total: totalPairs,
      page: pageIndex + 1,
      pages: requiredPages,
    }),
    [overallMatched, totalPairs, pageIndex, requiredPages]
  );

  const selectedLeftTile = useMemo(() => {
    const list = currentPage?.left || [];
    return list.find((t) => t.id === selectedLeftId) || null;
  }, [currentPage, selectedLeftId]);

  function isMatched(pairId) {
    return matchedPairIds.has(pairId);
  }

  function startPageFadeTo(nextIndex) {
    setPhase("pageFadeOut");
    setBusy(true);

    const t1 = setTimeout(() => {
      setPageIndex(nextIndex);
      setMatchedPairIds(new Set());
      setMismatchIds([]);
      setSelectedLeftId(null);
      setPhase("pageFadeIn");

      const t2 = setTimeout(() => {
        setPhase("ready");
        setBusy(false);
      }, pageFadeInMs);

      timersRef.current.push(t2);
    }, pageFadeOutMs);

    timersRef.current.push(t1);
  }

  function completeRun() {
    setShowDone(true);
    setBusy(false);
    setPhase("ready");
  }

  function tapLeft(tileId) {
    if (busy || showDone) return;
    if (!currentPage) return;

    const tile = currentPage.left.find((t) => t.id === tileId);
    if (!tile) return;

    if (isMatched(tile.pairId)) return;
    if (mismatchIds.length) return;

    // Toggle selection / switch selection
    if (selectedLeftId === tileId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(tileId);
    }
  }

  function tapRight(tileId) {
    if (busy || showDone) return;
    if (!currentPage) return;

    const tile = currentPage.right.find((t) => t.id === tileId);
    if (!tile) return;

    if (isMatched(tile.pairId)) return;
    if (mismatchIds.length) return;

    // Must have left selected first
    if (!selectedLeftId) return;

    const left = selectedLeftTile;
    const right = tile;
    if (!left || !right) {
      setSelectedLeftId(null);
      return;
    }

    if (left.pairId === right.pairId) {
      // MATCH
      const next = new Set(matchedPairIds);
      next.add(left.pairId);
      setMatchedPairIds(next);
      setSelectedLeftId(null);

      setOverallMatched((n) => n + 1);

      // Page complete?
      if (next.size >= pagePairs) {
        const nextPage = pageIndex + 1;

        // Last page -> done
        if (nextPage >= requiredPages) {
          // Fade out then show done modal for a clean finish
          setPhase("pageFadeOut");
          setBusy(true);

          const t = setTimeout(() => {
            completeRun();
          }, pageFadeOutMs);

          timersRef.current.push(t);
        } else {
          startPageFadeTo(nextPage);
        }
      }

      return;
    }

    // MISMATCH
    setBusy(true);
    setMismatchIds([left.id, right.id]);
    setMistakes((m) => m + 1);

    const t = setTimeout(() => {
      setMismatchIds([]);
      setSelectedLeftId(null);
      setBusy(false);
    }, mismatchMs);

    timersRef.current.push(t);
  }

  return {
    canStart,
    pageIndex,
    pagesTotal: requiredPages,
    progress,

    leftTiles: currentPage?.left || [],
    rightTiles: currentPage?.right || [],

    selectedLeftId,
    matchedPairIds,
    mismatchIds,
    busy,
    phase,
    mistakes,

    showDone,
    elapsedSec,

    tapLeft,
    tapRight,

    runAgain: buildRun,
    clearTimers,
  };
}

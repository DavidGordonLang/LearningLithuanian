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
 * - EN always left, LT always right (layout)
 * - User may select either side first; second tap on opposite side attempts match
 * - Correct: big green takeover pulse on both, then tiles fade to ~0.08
 * - Wrong: softer red takeover pulse on both, then revert
 * - Amber selection persists through the pulse (handoff feels smooth)
 * - On mismatch, both involved pairIds are marked "wrong" for end review
 */
export function useMatchPairsSession({
  eligibleRows,
  totalPairs = 20,
  pagePairs = 5,

  // timings
  rightSelectAmberMs = 140, // used as "second-tap amber" duration (both sides)
  correctPulseMs = 520,
  wrongPulseMs = 420,
  pageFadeOutMs = 280,
  pageFadeInMs = 220,
}) {
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  // single selection that can be either column
  const [selected, setSelected] = useState(null); // { side:"en"|"lt", id:string } | null

  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set()); // current page
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("ready"); // "ready" | "pageFadeOut" | "pageFadeIn"
  const [mistakes, setMistakes] = useState(0);
  const [overallMatched, setOverallMatched] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [showDone, setShowDone] = useState(false);

  // pulse state
  const [pulse, setPulse] = useState(null); // { kind:"correct"|"wrong", ids:[idA,idB] }

  // review tracking across full run
  const [pairBank, setPairBank] = useState(() => new Map()); // pairId -> { en, lt }
  const [wrongPairIds, setWrongPairIds] = useState(() => new Set()); // across full run
  const wrongOrderRef = useRef([]); // preserve first-seen order

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

    const base = pickRandomUnique(eligibleRows, requiredPairs);

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

    if (pairs.length < requiredPairs) {
      setPages([]);
      setPageIndex(0);
      setSelected(null);
      setMatchedPairIds(new Set());
      setBusy(false);
      setPhase("ready");
      setMistakes(0);
      setOverallMatched(0);
      setStartedAt(Date.now());
      setShowDone(false);
      setPulse(null);
      setPairBank(new Map());
      setWrongPairIds(new Set());
      wrongOrderRef.current = [];
      return;
    }

    // pair bank for end review
    const bank = new Map();
    pairs.forEach((p) => bank.set(p.pairId, { en: p.en, lt: p.lt }));
    setPairBank(bank);
    setWrongPairIds(new Set());
    wrongOrderRef.current = [];

    // build pages
    const builtPages = [];
    let idx = 0;
    for (let p = 0; p < requiredPages; p++) {
      const chunk = pairs.slice(idx, idx + pagePairs);
      idx += pagePairs;

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
    setSelected(null);
    setMatchedPairIds(new Set());
    setBusy(false);
    setPhase("ready");
    setMistakes(0);
    setOverallMatched(0);
    setStartedAt(Date.now());
    setShowDone(false);
    setPulse(null);
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

  const tileById = useMemo(() => {
    const map = new Map();
    (currentPage?.left || []).forEach((t) => map.set(t.id, t));
    (currentPage?.right || []).forEach((t) => map.set(t.id, t));
    return map;
  }, [currentPage]);

  function isMatched(pairId) {
    return matchedPairIds.has(pairId);
  }

  function markWrong(pairId) {
    setWrongPairIds((prev) => {
      if (prev.has(pairId)) return prev;
      const next = new Set(prev);
      next.add(pairId);
      wrongOrderRef.current.push(pairId);
      return next;
    });
  }

  function startPageFadeTo(nextIndex) {
    setPhase("pageFadeOut");
    setBusy(true);
    setPulse(null);

    const t1 = setTimeout(() => {
      setPageIndex(nextIndex);
      setMatchedPairIds(new Set());
      setSelected(null);
      setPulse(null);
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
    setPulse(null);
    setSelected(null);
  }

  function tap(tileId) {
    if (busy || showDone) return;
    if (!currentPage) return;

    const tile = tileById.get(tileId);
    if (!tile) return;

    if (isMatched(tile.pairId)) return;

    // no selection yet -> select this tile (amber)
    if (!selected) {
      setSelected({ side: tile.side, id: tile.id });
      setPulse(null);
      return;
    }

    // tap same tile -> deselect
    if (selected.id === tile.id) {
      setSelected(null);
      setPulse(null);
      return;
    }

    const first = tileById.get(selected.id);
    const second = tile;

    // if same side, switch selection to this tile
    if (first && second && first.side === second.side) {
      setSelected({ side: second.side, id: second.id });
      setPulse(null);
      return;
    }

    // opposite side: attempt match
    if (!first || !second) {
      setSelected(null);
      setPulse(null);
      return;
    }

    setBusy(true);

    // keep amber on both briefly before pulse takeover
    // (selected remains first; we simulate "second selection amber" by setting selected to second
    // but we must still know both ids for the pulse)
    const firstId = first.id;
    const secondId = second.id;

    // show amber on second as well for a moment
    setSelected({ side: second.side, id: secondId });

    const tAmber = setTimeout(() => {
      const correct = first.pairId === second.pairId;

      if (correct) {
        // pulse on both tiles; keep amber present through pulse
        setPulse({ kind: "correct", ids: [firstId, secondId] });

        const tPulse = setTimeout(() => {
          const next = new Set(matchedPairIds);
          next.add(first.pairId);
          setMatchedPairIds(next);
          setOverallMatched((n) => n + 1);

          setSelected(null);
          setPulse(null);

          // page complete?
          if (next.size >= pagePairs) {
            const nextPage = pageIndex + 1;

            if (nextPage >= requiredPages) {
              setPhase("pageFadeOut");

              const tDone = setTimeout(() => {
                completeRun();
              }, pageFadeOutMs);

              timersRef.current.push(tDone);
            } else {
              startPageFadeTo(nextPage);
            }
          } else {
            setBusy(false);
          }
        }, correctPulseMs);

        timersRef.current.push(tPulse);
        return;
      }

      // wrong
      setPulse({ kind: "wrong", ids: [firstId, secondId] });
      setMistakes((m) => m + 1);

      // Mark both pairs involved as wrong (as agreed)
      markWrong(first.pairId);
      markWrong(second.pairId);

      const tPulse = setTimeout(() => {
        setPulse(null);
        setSelected(null);
        setBusy(false);
      }, wrongPulseMs);

      timersRef.current.push(tPulse);
    }, rightSelectAmberMs);

    timersRef.current.push(tAmber);
  }

  const wrongPairs = useMemo(() => {
    if (!pairBank || wrongOrderRef.current.length === 0) return [];
    const out = [];
    const seen = new Set();
    for (const pid of wrongOrderRef.current) {
      if (seen.has(pid)) continue;
      seen.add(pid);
      const v = pairBank.get(pid);
      if (v?.en && v?.lt) out.push({ en: v.en, lt: v.lt });
    }
    return out;
  }, [pairBank, wrongPairIds]); // wrongPairIds changes when new ones are added

  return {
    canStart,
    pageIndex,
    pagesTotal: requiredPages,
    progress,

    leftTiles: currentPage?.left || [],
    rightTiles: currentPage?.right || [],

    selected, // {side,id} or null

    matchedPairIds,
    pulse,
    busy,
    phase,
    mistakes,

    showDone,
    elapsedSec,

    tap,

    wrongPairs,

    runAgain: buildRun,
    clearTimers,
  };
}
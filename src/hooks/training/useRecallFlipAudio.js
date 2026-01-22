// src/hooks/training/useRecallFlipAudio.js
import { useMemo, useState } from "react";

function safeStr(v) {
  return String(v ?? "").trim();
}

/**
 * useRecallFlipAudio
 *
 * Owns:
 * - ltText derivation (LT-only)
 * - isLtVisible (based on direction + revealed)
 * - canPlayLt gating
 * - audioBusy state
 * - playNormal / playSlow
 */
export function useRecallFlipAudio({
  current,
  direction,
  revealed,
  busy,
  showSummary,
  playText,
}) {
  const [audioBusy, setAudioBusy] = useState(false);

  const ltText = useMemo(() => {
    if (!current) return "";
    return safeStr(
      current?.LT ??
        current?.Lithuanian ??
        current?.lt ??
        current?.lithuanian ??
        ""
    );
  }, [current]);

  // LT is visible only on one side depending on direction:
  // - EN→LT: LT is answer => visible AFTER reveal (back)
  // - LT→EN: LT is prompt => visible BEFORE reveal (front)
  const isLtVisible = useMemo(() => {
    if (!current) return false;
    if (direction === "en_to_lt") return !!revealed;
    return !revealed;
  }, [current, direction, revealed]);

  const canPlayLt = useMemo(() => {
    return (
      !!ltText &&
      typeof playText === "function" &&
      !audioBusy &&
      !busy &&
      !showSummary &&
      isLtVisible
    );
  }, [ltText, playText, audioBusy, busy, showSummary, isLtVisible]);

  async function playLt(opts) {
    if (!canPlayLt) return;

    try {
      setAudioBusy(true);
      const res = playText(ltText, opts);
      if (res && typeof res.then === "function") await res;
    } catch {
      // silent fail
    } finally {
      setAudioBusy(false);
    }
  }

  function playNormal() {
    return playLt(undefined);
  }

  function playSlow() {
    return playLt({ slow: true });
  }

  function resetAudio() {
    setAudioBusy(false);
  }

  return {
    audioBusy,
    ltText,
    isLtVisible,
    canPlayLt,
    playNormal,
    playSlow,
    resetAudio,
  };
}

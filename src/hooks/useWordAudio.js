// src/hooks/useWordAudio.js
import { useCallback, useEffect, useRef, useState } from "react";

export default function useWordAudio({
  word,
  playText,
  disabled = false,
  longPressMs = 400,
  moveThresholdPx = 10,
}) {
  const [pressing, setPressing] = useState(false);

  const stateRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    longFired: false,
    canceled: false,
    active: false,
  });

  const timerRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
  }, []);

  const resetState = useCallback(() => {
    clearTimer();
    setPressing(false);
    stateRef.current.pointerId = null;
    stateRef.current.startX = 0;
    stateRef.current.startY = 0;
    stateRef.current.longFired = false;
    stateRef.current.canceled = false;
    stateRef.current.active = false;
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const play = useCallback(
    async (slow) => {
      const text = String(word || "").trim();
      if (!text || disabled || typeof playText !== "function") return;

      try {
        await playText(text, slow ? { slow: true } : undefined);
      } catch {
        // playback errors are already handled by the shared TTS layer
      }
    },
    [disabled, playText, word]
  );

  const cancelGesture = useCallback(() => {
    stateRef.current.canceled = true;
    clearTimer();
    setPressing(false);
  }, [clearTimer]);

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled) return;
      if (typeof playText !== "function") return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const text = String(word || "").trim();
      if (!text) return;

      stateRef.current.pointerId = e.pointerId ?? null;
      stateRef.current.startX = e.clientX ?? 0;
      stateRef.current.startY = e.clientY ?? 0;
      stateRef.current.longFired = false;
      stateRef.current.canceled = false;
      stateRef.current.active = true;

      setPressing(true);
      clearTimer();

      try {
        if (e.currentTarget?.setPointerCapture && e.pointerId != null) {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      } catch {}

      timerRef.current = window.setTimeout(async () => {
        if (!stateRef.current.active || stateRef.current.canceled) return;
        stateRef.current.longFired = true;
        setPressing(false);
        await play(true);
      }, longPressMs);
    },
    [clearTimer, disabled, longPressMs, play, playText, word]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!stateRef.current.active || stateRef.current.canceled) return;

      const dx = (e.clientX ?? 0) - stateRef.current.startX;
      const dy = (e.clientY ?? 0) - stateRef.current.startY;
      const distance = Math.hypot(dx, dy);

      if (distance > moveThresholdPx) {
        cancelGesture();
      }
    },
    [cancelGesture, moveThresholdPx]
  );

  const handlePointerUp = useCallback(
    async (e) => {
      const wasActive = stateRef.current.active;
      const wasCanceled = stateRef.current.canceled;
      const longFired = stateRef.current.longFired;

      try {
        if (e.currentTarget?.releasePointerCapture && e.pointerId != null) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}

      clearTimer();
      setPressing(false);

      stateRef.current.active = false;

      if (!wasActive || wasCanceled || longFired) {
        stateRef.current.pointerId = null;
        return;
      }

      stateRef.current.pointerId = null;
      await play(false);
    },
    [clearTimer, play]
  );

  const handlePointerCancel = useCallback(
    (e) => {
      try {
        if (e.currentTarget?.releasePointerCapture && e.pointerId != null) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {}

      resetState();
    },
    [resetState]
  );

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  return {
    pressing,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onContextMenu: handleContextMenu,
    },
  };
}
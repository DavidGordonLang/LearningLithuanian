// src/components/SwipePager.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function isTextFieldEl(el) {
  if (!el) return false;
  if (el.closest?.('[data-swipe-block="true"]')) return true;

  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;

  if (el.isContentEditable) return true;
  if (el.closest?.("[contenteditable='true']")) return true;

  return false;
}

function blurActiveElement() {
  const ae = document.activeElement;
  if (!ae) return;

  const tag = (ae.tagName || "").toUpperCase();
  const isField =
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    ae.isContentEditable;

  if (!isField) return;

  try {
    ae.blur();
  } catch {}

  try {
    document.body?.focus?.();
  } catch {}
}

/**
 * SwipePager
 * - Pixel-accurate widths (measures host)
 * - Header fixed; each panel scrolls independently
 * - Allows swipe on buttons
 * - Blocks swipe on text inputs/textarea/select/contenteditable (or data-swipe-block)
 * - Emits live progress during drag for premium header pill
 * - Robust snap-back: never leaves the track between pages or stuck at edges
 */
export default function SwipePager({ index, onIndexChange, onProgress, children }) {
  const hostRef = useRef(null);
  const trackRef = useRef(null);

  const pageCount = React.Children.count(children);

  const [vw, setVw] = useState(() => {
    if (typeof window === "undefined") return 360;
    return window.innerWidth || 360;
  });

  const drag = useRef({
    active: false,
    locked: false,
    startX: 0,
    startY: 0,
    dx: 0,
    startIndex: 0,
    raf: 0,
  });

  const resetTimerRef = useRef(0);

  const emitProgress = (x, dragging) => {
    if (typeof onProgress !== "function") return;
    if (!vw) return;
    const p = (-x) / vw;
    onProgress(p, !!dragging);
  };

  const applyTransform = (x, dragging) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px,0,0)`;
    emitProgress(x, dragging);
  };

  const clearResetTimer = () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = 0;
    }
  };

  const snapToIndex = (nextIndex) => {
    const el = trackRef.current;
    if (!el) return;

    clearResetTimer();

    if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
    drag.current.raf = 0;

    const x = -nextIndex * vw;
    el.style.transition = "transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1)";
    applyTransform(x, false);

    resetTimerRef.current = window.setTimeout(() => {
      if (trackRef.current) trackRef.current.style.transition = "none";
      resetTimerRef.current = 0;
      if (typeof onProgress === "function") onProgress(nextIndex, false);
    }, 260);
  };

  useLayoutEffect(() => {
    const measure = () => {
      const host = hostRef.current;
      if (!host) return;
      const w = host.getBoundingClientRect().width || window.innerWidth || 360;
      setVw(w);

      const el = trackRef.current;
      if (el) el.style.transition = "none";
      applyTransform(-index * w, false);
      if (typeof onProgress === "function") onProgress(index, false);
    };

    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    // If the index changes (tabs, programmatic), kill any focused input first
    blurActiveElement();
    snapToIndex(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, vw]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;

      const target = e.target;
      if (isTextFieldEl(target)) return;

      clearResetTimer();

      const el = trackRef.current;
      if (el) el.style.transition = "none";

      const t = e.touches[0];
      drag.current.active = true;
      drag.current.locked = false;
      drag.current.startX = t.clientX;
      drag.current.startY = t.clientY;
      drag.current.dx = 0;
      drag.current.startIndex = index;
    };

    const onTouchMove = (e) => {
      if (!drag.current.active || !e.touches || e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - drag.current.startX;
      const dy = t.clientY - drag.current.startY;

      if (!drag.current.locked) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;

        if (Math.abs(dx) > Math.abs(dy) * 1.15) {
          drag.current.locked = true;
          blurActiveElement();
        } else {
          drag.current.active = false;
          drag.current.locked = false;
          return;
        }
      }

      e.preventDefault();

      drag.current.dx = dx;

      const startIndex = drag.current.startIndex;

      const atFirst = startIndex === 0 && dx > 0;
      const atLast = startIndex === pageCount - 1 && dx < 0;
      const resisted = atFirst || atLast ? dx * 0.35 : dx;

      const x = -startIndex * vw + resisted;

      if (drag.current.raf) cancelAnimationFrame(drag.current.raf);
      drag.current.raf = requestAnimationFrame(() => applyTransform(x, true));
    };

    const endGesture = () => {
      if (!drag.current.active) return;

      const dx = drag.current.dx || 0;
      const startIndex = drag.current.startIndex;

      drag.current.active = false;
      drag.current.locked = false;

      const threshold = Math.max(50, vw * 0.18);

      let next = startIndex;
      if (dx <= -threshold) next = startIndex + 1;
      else if (dx >= threshold) next = startIndex - 1;

      next = clamp(next, 0, pageCount - 1);

      // Always snap immediately
      snapToIndex(next);

      // Then update state if needed
      if (next !== index) onIndexChange(next);
    };

    host.addEventListener("touchstart", onTouchStart, { passive: true });
    host.addEventListener("touchmove", onTouchMove, { passive: false });
    host.addEventListener("touchend", endGesture, { passive: true });
    host.addEventListener("touchcancel", endGesture, { passive: true });

    return () => {
      host.removeEventListener("touchstart", onTouchStart);
      host.removeEventListener("touchmove", onTouchMove);
      host.removeEventListener("touchend", endGesture);
      host.removeEventListener("touchcancel", endGesture);
    };
  }, [index, onIndexChange, onProgress, pageCount, vw]);

  return (
    <div ref={hostRef} className="h-full w-full overflow-hidden touch-pan-y">
      <div
        ref={trackRef}
        className="h-full flex"
        style={{
          width: `${vw * pageCount}px`,
          transform: `translate3d(${-index * vw}px,0,0)`,
          transition: "none",
          willChange: "transform",
        }}
      >
        {React.Children.map(children, (child) => (
          <div
            className="h-full flex-none overflow-y-auto overscroll-contain"
            style={{ width: `${vw}px` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
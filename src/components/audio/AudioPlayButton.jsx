import React, { useRef, useState } from "react";

const cn = (...xs) => xs.filter(Boolean).join(" ");
const LONG_PRESS_MS = 420;

export default function AudioPlayButton({
  text,
  playText,
  blurActiveInput,
  ariaLabel = "Play",
  className,
}) {
  const timerRef = useRef(0);
  const longFiredRef = useRef(false);
  const [pressing, setPressing] = useState(false);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = 0;
  };

  const start = (e) => {
    e.stopPropagation();
    if (e?.button != null && e.button !== 0) return;

    try {
      if (e?.currentTarget?.setPointerCapture && e?.pointerId != null) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {}

    blurActiveInput?.();
    longFiredRef.current = false;
    setPressing(true);
    clearTimer();

    timerRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      playText?.(text || "", { slow: true });
    }, LONG_PRESS_MS);
  };

  const finish = (e) => {
    e.stopPropagation();

    try {
      if (e?.currentTarget?.releasePointerCapture && e?.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    setPressing(false);
    clearTimer();
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (longFiredRef.current) {
      longFiredRef.current = false;
      return;
    }

    playText?.(text || "");
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      data-swipe-block="true"
      className={cn(
        "select-none touch-manipulation",
        "w-12 h-12 rounded-full",
        "border border-emerald-300/20",
        "bg-emerald-900/20 hover:bg-emerald-900/30",
        "shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_0_26px_rgba(16,185,129,0.12),0_14px_40px_rgba(0,0,0,0.60)]",
        "flex items-center justify-center shrink-0",
        "transition-transform duration-150",
        pressing ? "scale-[0.98]" : null,
        className
      )}
      onPointerDown={start}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={finish}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-emerald-200 ml-0.5"
      >
        <path d="M3.25 2.25L12.25 7.5L3.25 12.75V2.25Z" fill="currentColor" />
      </svg>
    </button>
  );
}

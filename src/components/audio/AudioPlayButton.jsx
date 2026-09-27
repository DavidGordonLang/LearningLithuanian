import React from "react";
import useWordAudio from "../../hooks/useWordAudio";

const cn = (...xs) => xs.filter(Boolean).join(" ");


export default function AudioPlayButton({
  text,
  playText,
  blurActiveInput,
  ariaLabel = "Play",
  className,
  compact = false,
  children,
}) {
  const { pressing, handlers, play } = useWordAudio({ word: text, playText, longPressMs: 420 });
  const handleClick = (event) => {
    event.stopPropagation();
    // Pointer playback happens on release/hold; only synthetic keyboard clicks
    // belong here. This prevents the click following a hold from playing twice.
    if (event.detail === 0) void play(false);
  };

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}. Hold or Shift+Enter for slow playback`}
      title="Tap to play; hold for slow playback"
      data-swipe-block="true"
      className={cn(
        "select-none touch-manipulation",
        compact ? "h-9 w-9 rounded-full" : "w-12 h-12 rounded-full",
        "border border-emerald-300/20",
        "bg-emerald-900/20 hover:bg-emerald-900/30",
        "shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_0_26px_rgba(16,185,129,0.12),0_14px_40px_rgba(0,0,0,0.60)]",
        "flex items-center justify-center shrink-0",
        "transition-transform duration-150",
        pressing ? "scale-[0.98]" : null,
        className
      )}
      {...handlers}
      onPointerDown={(event) => { event.stopPropagation(); blurActiveInput?.(); handlers.onPointerDown(event); }}
      onKeyDown={(event) => {
        if (event.shiftKey && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          if (!event.repeat) void play(true);
        }
      }}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children || <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="text-emerald-200 ml-0.5"
      >
        <path d="M3.25 2.25L12.25 7.5L3.25 12.75V2.25Z" fill="currentColor" />
      </svg>}
    </button>
  );
}

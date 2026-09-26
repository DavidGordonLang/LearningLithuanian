// src/components/audio/InteractivePhraseText.jsx
import React, { memo, useMemo, useCallback, useEffect } from "react";
import tokenizePhrase from "../../utils/tokenizePhrase";
import useWordAudio from "../../hooks/useWordAudio";

const cn = (...xs) => xs.filter(Boolean).join(" ");

// Inject word-audio glow styles once
const STYLE_ID = "z-word-audio-styles";
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    .z-word-glow, .z-word-glow-slow {
      color: rgb(110,231,183) !important;
      text-shadow: 0 0 8px rgba(52,211,153,0.7);
      transition: none;
    }

    /* Touch browsers can leave CSS :hover stuck on the last tapped word.
       The timed active colour is the intended touch feedback, so suppress desktop
       hover colour on coarse/non-hover pointers after the gesture ends. */
    @media (hover: none), (pointer: coarse) {
      .z-word-audio-token:not(.z-word-glow):not(.z-word-glow-slow):hover {
        color: inherit !important;
      }
    }
  `;
  document.head.appendChild(el);
}

function WordToken({
  token,
  playText,
  disabled,
  longPressMs,
  moveThresholdPx,
  wordClassName,
  activeWordClassName,
}) {
  const { pressing, playing, handlers, play } = useWordAudio({
    word: token.text,
    playText,
    disabled,
    longPressMs,
    moveThresholdPx,
  });

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Keep the active colour steady for the full timed feedback state.
  const glowClass = playing === "slow"
    ? "z-word-glow-slow"
    : playing === "normal"
    ? "z-word-glow"
    : null;

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Play word: ${token.text}`}
      className={cn(
        "z-word-audio-token inline rounded-[0.2em] select-none transition-colors duration-150",
        !disabled ? "cursor-pointer" : "",
        wordClassName,
        pressing ? activeWordClassName : null,
        glowClass
      )}
      onClick={stopPropagation}
      onPointerDown={(e) => {
        e.stopPropagation();
        handlers.onPointerDown?.(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        handlers.onPointerMove?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        handlers.onPointerUp?.(e);
        if (e.pointerType !== "mouse") e.currentTarget?.blur?.();
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        handlers.onPointerCancel?.(e);
        if (e.pointerType !== "mouse") e.currentTarget?.blur?.();
      }}
      onLostPointerCapture={(e) => {
        e.stopPropagation();
        handlers.onLostPointerCapture?.(e);
        if (e.pointerType !== "mouse") e.currentTarget?.blur?.();
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        handlers.onContextMenu?.(e);
      }}
      onKeyDown={async (e) => {
        if (disabled) return;
        if (e.repeat || (e.key !== "Enter" && e.key !== " ")) return;

        e.preventDefault();
        e.stopPropagation();

        try {
          await play(e.shiftKey);
        } catch {
          // shared audio layer handles surfaced errors
        }
      }}
    >
      {token.text}
    </span>
  );
}

function NonWordToken({ token, className }) {
  return <span className={className}>{token.text}</span>;
}

function InteractivePhraseText({
  text,
  playText,
  disabled = false,
  longPressMs = 400,
  moveThresholdPx = 10,
  className,
  wordClassName,
  nonWordClassName,
  activeWordClassName = "opacity-70",
}) {
  useEffect(() => { ensureStyles(); }, []);
  const tokens = useMemo(() => tokenizePhrase(text), [text]);

  return (
    <span className={cn("break-words", className)}>
      {tokens.map((token) => {
        if (token.type === "word") {
          return (
            <WordToken
              key={token.key}
              token={token}
              playText={playText}
              disabled={disabled}
              longPressMs={longPressMs}
              moveThresholdPx={moveThresholdPx}
              wordClassName={wordClassName}
              activeWordClassName={activeWordClassName}
            />
          );
        }

        return (
          <NonWordToken
            key={token.key}
            token={token}
            className={nonWordClassName}
          />
        );
      })}
    </span>
  );
}

export default memo(InteractivePhraseText);

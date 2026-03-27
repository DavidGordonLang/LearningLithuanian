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
    @keyframes zWordGlow {
      0%   { text-shadow: 0 0 0px rgba(52,211,153,0); color: inherit; }
      30%  { text-shadow: 0 0 8px rgba(52,211,153,0.9); color: rgb(110,231,183); }
      60%  { text-shadow: 0 0 4px rgba(52,211,153,0.4); color: rgb(167,243,208); }
      100% { text-shadow: 0 0 0px rgba(52,211,153,0); color: inherit; }
    }
    @keyframes zWordGlowSlow {
      0%   { text-shadow: 0 0 0px rgba(52,211,153,0); color: inherit; }
      40%  { text-shadow: 0 0 10px rgba(52,211,153,0.7); color: rgb(110,231,183); }
      100% { text-shadow: 0 0 0px rgba(52,211,153,0); color: inherit; }
    }
    .z-word-glow {
      animation: zWordGlow 0.6s ease-out forwards;
    }
    .z-word-glow-slow {
      animation: zWordGlowSlow 2s ease-in-out infinite;
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
  const { pressing, playing, handlers } = useWordAudio({
    word: token.text,
    playText,
    disabled,
    longPressMs,
    moveThresholdPx,
  });

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Glow animation: wave pulse on normal play, slow pulse on slow play
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
        "inline rounded-[0.2em] select-none transition-colors duration-150",
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
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        handlers.onPointerCancel?.(e);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        handlers.onContextMenu?.(e);
      }}
      onKeyDown={async (e) => {
        if (disabled) return;
        if (e.key !== "Enter" && e.key !== " ") return;

        e.preventDefault();
        e.stopPropagation();

        try {
          await playText?.(token.text);
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

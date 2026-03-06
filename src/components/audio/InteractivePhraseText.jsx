// src/components/audio/InteractivePhraseText.jsx
import React, { memo, useMemo } from "react";
import tokenizePhrase from "../../utils/tokenizePhrase";
import useWordAudio from "../../hooks/useWordAudio";

const cn = (...xs) => xs.filter(Boolean).join(" ");

function WordToken({
  token,
  playText,
  disabled,
  longPressMs,
  moveThresholdPx,
  wordClassName,
  activeWordClassName,
}) {
  const { pressing, handlers } = useWordAudio({
    word: token.text,
    playText,
    disabled,
    longPressMs,
    moveThresholdPx,
  });

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Play word: ${token.text}`}
      className={cn(
        "inline rounded-[0.2em] select-none transition-opacity duration-150",
        !disabled ? "cursor-pointer" : "",
        wordClassName,
        pressing ? activeWordClassName : null
      )}
      {...handlers}
      onKeyDown={async (e) => {
        if (disabled) return;
        if (e.key !== "Enter" && e.key !== " ") return;

        e.preventDefault();

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
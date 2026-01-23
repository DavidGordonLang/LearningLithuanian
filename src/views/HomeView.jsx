// src/views/HomeView.jsx
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import useSpeechToTextHold from "../hooks/useSpeechToTextHold";
import useTranslate from "../hooks/useTranslate";
import useSaveToLibrary from "../hooks/useSaveToLibrary";

const cn = (...xs) => xs.filter(Boolean).join(" ");

const Segmented = memo(function Segmented({ value, onChange, options, compact = false }) {
  return (
    <div className={cn("z-inset p-1 flex w-full overflow-hidden rounded-2xl", compact ? "p-1" : "p-1.5")}>
      {options.map((opt, idx) => {
        const active = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            className={cn(
              "flex-1 select-none rounded-2xl border transition-colors",
              compact ? "px-2.5 py-2 text-[13px] font-semibold" : "px-3 py-2 text-sm font-medium",
              active
                ? "bg-emerald-600/90 text-black border-emerald-300/20"
                : "bg-transparent text-zinc-200 hover:bg-white/5 border-transparent",
              idx !== options.length - 1 ? "mr-1" : ""
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

export default function HomeView({
  playText,
  onOpenAddForm,
  setRows,
  genId,
  nowTs,
  showToast,
  rows,
}) {
  const textareaRef = useRef(null);

  const blurTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (document.activeElement === el) {
      try {
        el.blur();
      } catch {}
    }
  }, []);

  const [input, setInput] = useState("");
  const [gender, setGender] = useState("neutral");
  const [tone, setTone] = useState("friendly");

  // Auto-Translate toggle (persisted)
  const [autoTranslateLS, setAutoTranslateLS] = useLocalStorageState(
    "zodis_auto_translate",
    "1"
  );
  const autoTranslate = autoTranslateLS === "1";

  // Translation hook
  const {
    translating,
    result,
    duplicateEntry,
    setDuplicateEntry,
    translateText,
    resetTranslation,
  } = useTranslate({
    rows,
    tone,
    gender,
    showToast,
  });

  const canTranslate = useMemo(() => !!input.trim(), [input]);
  const canSave = useMemo(
    () => !!result.ltOut && !!(result.enNatural || result.enLiteral),
    [result.ltOut, result.enNatural, result.enLiteral]
  );

  const handleClear = useCallback(() => {
    blurTextarea();
    setInput("");
    resetTranslation();
  }, [blurTextarea, resetTranslation]);

  // Save hook
  const { handleSaveToLibrary } = useSaveToLibrary({
    blurTextarea,
    canSave,
    input,
    result,
    rows,
    setRows,
    genId,
    nowTs,
    showToast,
  });

  const handleGenderChange = useCallback(
    (v) => {
      blurTextarea();
      setGender(v);
    },
    [blurTextarea]
  );

  const handleToneChange = useCallback(
    (v) => {
      blurTextarea();
      setTone(v);
    },
    [blurTextarea]
  );

  const handleTranslateClick = useCallback(() => {
    blurTextarea();
    translateText(input, false);
  }, [blurTextarea, input, translateText]);

  const handleTranslateAnywayClick = useCallback(() => {
    blurTextarea();
    translateText(input, true);
  }, [blurTextarea, input, translateText]);

  const handlePlay = useCallback(
    (text, opts) => {
      blurTextarea();
      if (!text) return;
      playText(text, opts);
    },
    [blurTextarea, playText]
  );

  const handleCopy = useCallback(() => {
    blurTextarea();
    if (!result.ltOut) return;
    navigator.clipboard.writeText(result.ltOut);
    showToast?.("Copied");
  }, [blurTextarea, result.ltOut, showToast]);

  const handleOpenAdd = useCallback(() => {
    blurTextarea();
    onOpenAddForm?.();
  }, [blurTextarea, onOpenAddForm]);

  // -------------------- STT hook --------------------
  const { sttState, sttSupported, startRecording, stopRecording, cancelStt } =
    useSpeechToTextHold({
      showToast,
      blurTextarea,
      translating,
      setInput,
      autoTranslate,
      onTranslateText: async (text) => translateText(text, false),
      onSpeechCaptured: () => {
        resetTranslation();
      },
    });

  const micLabel = (() => {
    if (sttState === "recording") return "Listening…";
    if (sttState === "transcribing") return "Transcribing…";
    if (sttState === "translating") return "Translating…";
    return "Hold to speak";
  })();

  const micDisabled =
    translating || sttState === "transcribing" || sttState === "translating";

  const micRing = (() => {
    if (!sttSupported()) return "shadow-[0_0_0_rgba(0,0,0,0)]";
    if (sttState === "recording")
      return "shadow-[0_0_46px_rgba(16,185,129,0.40)]";
    if (sttState === "transcribing" || sttState === "translating")
      return "shadow-[0_0_40px_rgba(16,185,129,0.28)] z-pulse";
    return "shadow-[0_0_28px_rgba(16,185,129,0.14)]";
  })();

  const micOuter = cn(
    "mx-auto rounded-full border select-none transition-transform active:scale-[0.99]",
    "bg-white/[0.04] border-white/10",
    micRing,
    micDisabled || !sttSupported() ? "opacity-70" : "hover:bg-white/[0.06]"
  );

  return (
    <div className="z-page pb-24">
      {/* HERO PANEL (matches render structure) */}
      <section className="z-card p-4 sm:p-5">
        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] uppercase tracking-wide text-zinc-400">
              Speaking to
            </div>
          </div>
          <Segmented
            compact
            value={gender}
            onChange={handleGenderChange}
            options={[
              { value: "neutral", label: "Neutral" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[12px] uppercase tracking-wide text-zinc-400">
              Tone
            </div>
          </div>
          <Segmented
            compact
            value={tone}
            onChange={handleToneChange}
            options={[
              { value: "friendly", label: "Friendly" },
              { value: "neutral", label: "Neutral" },
              { value: "polite", label: "Polite" },
            ]}
          />
        </div>

        {/* Prompt + input */}
        <div className="mt-4">
          <div className="text-center text-[16px] sm:text-[17px] font-semibold text-zinc-100">
            What would you like to say?
          </div>

          <div className="mt-3">
            <textarea
              ref={textareaRef}
              rows={3}
              className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          {/* Auto-Translate toggle (render-like row, compact) */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-500">Auto-Translate after speech</div>

            <button
              type="button"
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors select-none",
                autoTranslate
                  ? "bg-emerald-600/90 border-emerald-300/20"
                  : "bg-white/5 border-white/10"
              )}
              onClick={() => {
                blurTextarea();
                setAutoTranslateLS(autoTranslate ? "0" : "1");
                showToast?.(autoTranslate ? "Auto-Translate off" : "Auto-Translate on");
              }}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
            >
              <span
                className={cn(
                  "inline-block h-6 w-6 transform rounded-full bg-black/80 shadow transition-transform",
                  autoTranslate ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>

        {/* MIC centrepiece */}
        <div className="mt-5">
          <button
            type="button"
            className={cn(micOuter)}
            style={{ width: 130, height: 130 }}
            disabled={micDisabled || !sttSupported()}
            onMouseDown={(e) => {
              e.preventDefault();
              if (micDisabled) return;
              startRecording();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            onMouseLeave={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              if (micDisabled) return;
              startRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopRecording();
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              cancelStt();
            }}
          >
            <div className="h-full w-full flex flex-col items-center justify-center gap-2">
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center",
                  sttState === "recording" || sttState === "transcribing" || sttState === "translating"
                    ? "bg-emerald-600/90 text-black"
                    : "bg-white/[0.05] text-zinc-100 border border-white/10"
                )}
              >
                <span className="text-2xl">🎤</span>
              </div>

              <div className="text-sm font-semibold text-zinc-100">{micLabel}</div>
              <div className="text-[11px] text-zinc-400">
                {sttState === "idle" ? "Press & hold (max 15s)" : "Release to stop"}
              </div>
            </div>
          </button>
        </div>

        {/* Translate / Clear buttons (render-like row) */}
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            data-press
            className={cn(
              "z-btn px-6 py-3 rounded-2xl font-semibold",
              translating || !canTranslate ? "z-disabled" : "",
              "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
            )}
            onClick={handleTranslateClick}
            disabled={translating || !canTranslate}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          <button
            type="button"
            data-press
            className={cn("z-btn z-btn-secondary px-6 py-3 rounded-2xl", sttState !== "idle" ? "z-disabled" : "")}
            onClick={handleClear}
            disabled={sttState !== "idle"}
          >
            Clear
          </button>
        </div>

        {/* Add Entry manually (render-like, subtle) */}
        {typeof onOpenAddForm === "function" && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              data-press
              className="z-btn z-btn-quiet px-4 py-2 rounded-2xl text-sm"
              onClick={handleOpenAdd}
            >
              + Add Entry Manually
            </button>
          </div>
        )}
      </section>

      {/* Duplicate warning / existing entry view */}
      {duplicateEntry && (
        <section className="z-card mt-4 p-4 sm:p-5 border border-amber-500/25 bg-amber-950/15">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-semibold text-amber-300">
                Similar entry already in your library
              </div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                Use this one, or translate anyway for a new version.
              </div>
            </div>
            <button
              type="button"
              data-press
              className="z-btn z-btn-quiet px-3 py-2 rounded-xl text-xs"
              onClick={() => {
                blurTextarea();
                setDuplicateEntry(null);
              }}
            >
              Dismiss
            </button>
          </div>

          <div className="text-sm font-semibold text-zinc-100 truncate">
            {duplicateEntry.English || "—"}
          </div>
          <div className="text-sm text-zinc-200 truncate">
            {duplicateEntry.Lithuanian || "—"}
          </div>

          {duplicateEntry.Phonetic && (
            <div className="text-[11px] text-zinc-400 italic mt-1 truncate">
              {duplicateEntry.Phonetic}
            </div>
          )}

          {(duplicateEntry.Usage || duplicateEntry.Notes) && (
            <div className="mt-3 text-[11px] text-zinc-200 space-y-2">
              {duplicateEntry.Usage && (
                <div>
                  <span className="text-zinc-500">Usage: </span>
                  {duplicateEntry.Usage}
                </div>
              )}
              {duplicateEntry.Notes && (
                <div>
                  <span className="text-zinc-500">Notes: </span>
                  {duplicateEntry.Notes}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 flex-wrap pt-4">
            <button
              type="button"
              data-press
              className="z-btn px-4 py-2 rounded-2xl text-sm bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black font-semibold"
              onClick={() => duplicateEntry.Lithuanian && handlePlay(duplicateEntry.Lithuanian)}
            >
              ▶ Play
            </button>

            <button
              type="button"
              data-press
              className="z-btn z-btn-secondary px-4 py-2 rounded-2xl text-sm"
              onClick={handleTranslateAnywayClick}
            >
              Translate anyway
            </button>
          </div>
        </section>
      )}

      {/* Output */}
      {result.ltOut && (
        <section className="z-card mt-4 p-4 sm:p-5 space-y-3">
          <div className="text-xs text-zinc-500">
            Detected input:{" "}
            <span className="text-zinc-300">
              {result.sourceLang === "lt" ? "Lithuanian" : "English"}
            </span>
          </div>

          <div>
            <div className="text-[12px] uppercase tracking-wide text-zinc-400">
              Lithuanian
            </div>
            <div className="mt-1 text-lg font-semibold text-zinc-100 break-words">
              {result.ltOut}
            </div>

            {result.phonetics && (
              <div className="text-sm text-zinc-400 mt-1">{result.phonetics}</div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 space-y-1 text-sm text-zinc-200">
            <div>
              <span className="font-semibold">English meaning (natural): </span>
              <span>{result.enNatural || result.enLiteral}</span>
            </div>
            {result.enLiteral && (
              <div className="text-zinc-400">
                <span className="font-semibold text-zinc-300">Literal meaning: </span>
                <span>{result.enLiteral}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              data-press
              className="z-btn px-5 py-3 rounded-2xl text-base bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black font-semibold"
              onClick={() => handlePlay(result.ltOut)}
            >
              ▶ Normal
            </button>

            <button
              type="button"
              data-press
              className="z-btn px-5 py-3 rounded-2xl text-base bg-emerald-700/90 hover:bg-emerald-600 border-emerald-300/15 text-black font-semibold"
              onClick={() => handlePlay(result.ltOut, { slow: true })}
            >
              🐢 Slow
            </button>

            <button
              type="button"
              data-press
              className="z-btn z-btn-secondary px-5 py-3 rounded-2xl text-sm"
              onClick={handleCopy}
            >
              Copy
            </button>

            <button
              type="button"
              data-press
              className={cn("z-btn z-btn-secondary px-5 py-3 rounded-2xl text-sm", !canSave ? "z-disabled" : "")}
              onClick={handleSaveToLibrary}
              disabled={!canSave}
            >
              Save to library
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

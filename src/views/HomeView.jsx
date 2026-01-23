// src/views/HomeView.jsx
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import useSpeechToTextHold from "../hooks/useSpeechToTextHold";
import useTranslate from "../hooks/useTranslate";
import useSaveToLibrary from "../hooks/useSaveToLibrary";

const Segmented = memo(function Segmented({ value, onChange, options }) {
  return (
    <div className="z-inset p-1 flex w-full overflow-hidden rounded-2xl">
      {options.map((opt, idx) => {
        const active = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
            className={
              "flex-1 px-3 py-2 text-sm font-medium transition-colors select-none rounded-2xl " +
              (active
                ? "bg-emerald-600/90 text-black border border-emerald-300/20"
                : "bg-transparent text-zinc-200 hover:bg-white/5 border border-transparent") +
              (idx !== options.length - 1 ? " mr-1" : "")
            }
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
  // Stored as "1" or "0" because useLocalStorageState stores strings.
  const [autoTranslateLS, setAutoTranslateLS] = useLocalStorageState(
    "zodis_auto_translate",
    "1"
  );
  const autoTranslate = autoTranslateLS === "1";

  // Translation hook (extracted)
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

  // Save hook (extracted)
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

  // -------------------- STT hook (extracted) --------------------

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

  const micClasses = (() => {
    const base =
      "w-full rounded-2xl px-5 py-4 font-semibold select-none " +
      "transition-transform duration-150 active:scale-[0.99] " +
      "border ";

    if (!sttSupported()) {
      return base + "bg-white/5 text-zinc-500 border-white/10";
    }

    // Held = expanded glow
    if (sttState === "recording") {
      return (
        base +
        "bg-emerald-600/90 text-black border-emerald-300/25 " +
        "shadow-[0_0_38px_rgba(16,185,129,0.35)]"
      );
    }

    // Translating/transcribing = calm pulse (no spinner)
    if (sttState === "transcribing" || sttState === "translating") {
      return (
        base +
        "bg-emerald-600/90 text-black border-emerald-300/20 " +
        "shadow-[0_0_34px_rgba(16,185,129,0.25)] z-pulse"
      );
    }

    // Idle = subtle glow
    return (
      base +
      "bg-white/[0.06] text-zinc-100 border-white/10 " +
      "shadow-[0_0_22px_rgba(16,185,129,0.10)] hover:bg-white/10"
    );
  })();

  return (
    <div className="z-page pb-28 space-y-4">
      {/* Speaking to… */}
      <div className="z-card p-4 sm:p-5">
        <div className="text-sm font-semibold text-zinc-100 mb-2">
          Speaking to…
        </div>
        <Segmented
          value={gender}
          onChange={handleGenderChange}
          options={[
            { value: "neutral", label: "Neutral" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
      </div>

      {/* Tone */}
      <div className="z-card p-4 sm:p-5">
        <div className="text-sm font-semibold text-zinc-100 mb-2">Tone</div>
        <Segmented
          value={tone}
          onChange={handleToneChange}
          options={[
            { value: "friendly", label: "Friendly" },
            { value: "neutral", label: "Neutral" },
            { value: "polite", label: "Polite" },
          ]}
        />
      </div>

      {/* Input */}
      <div className="z-card p-4 sm:p-5">
        <label className="block text-sm text-zinc-200 mb-2">
          What would you like to say?
        </label>

        <textarea
          ref={textareaRef}
          rows={3}
          className="z-input w-full !rounded-2xl !px-4 !py-3 text-sm mb-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Auto-Translate toggle */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs text-zinc-500">Auto-Translate after speech</div>

          <button
            type="button"
            className={
              "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors select-none " +
              (autoTranslate
                ? "bg-emerald-600/90 border-emerald-300/20"
                : "bg-white/5 border-white/10")
            }
            onClick={() => {
              blurTextarea();
              setAutoTranslateLS(autoTranslate ? "0" : "1");
              showToast?.(
                autoTranslate ? "Auto-Translate off" : "Auto-Translate on"
              );
            }}
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            <span
              className={
                "inline-block h-6 w-6 transform rounded-full bg-black/80 shadow transition-transform " +
                (autoTranslate ? "translate-x-5" : "translate-x-0.5")
              }
            />
          </button>
        </div>

        {/* Big mic button (press-and-hold) */}
        <div className="mb-3">
          <button
            type="button"
            className={micClasses + (micDisabled ? " opacity-80" : "")}
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
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">🎤</span>
              <span className="text-base">{micLabel}</span>
            </div>
            <div className="text-xs mt-1 text-zinc-200/80">
              {sttState === "idle"
                ? "Press and hold (max 15s)"
                : "Release to stop"}
            </div>
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            data-press
            className={
              "z-btn px-5 py-3 rounded-2xl font-semibold " +
              (translating || !canTranslate ? "z-disabled " : "") +
              "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-300/20 text-black"
            }
            onClick={handleTranslateClick}
            disabled={translating || !canTranslate}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          <button
            type="button"
            data-press
            className={"z-btn z-btn-secondary px-5 py-3 rounded-2xl " + (sttState !== "idle" ? "z-disabled" : "")}
            onClick={handleClear}
            disabled={sttState !== "idle"}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Duplicate warning / existing entry view */}
      {duplicateEntry && (
        <div className="z-card p-4 sm:p-5 border border-amber-500/25 bg-amber-950/15">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-semibold text-amber-300">
                Similar entry already in your library
              </div>
              <div className="text-xs text-amber-200/80 mt-0.5">
                You can use this one, or translate anyway if you really want a new
                version.
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
              className="
                z-btn px-4 py-2 rounded-2xl text-sm
                bg-emerald-600/90 hover:bg-emerald-500
                border border-emerald-300/20
                text-black font-semibold
              "
              onClick={() =>
                duplicateEntry.Lithuanian && handlePlay(duplicateEntry.Lithuanian)
              }
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
        </div>
      )}

      {/* Output */}
      {result.ltOut && (
        <div className="z-card p-4 sm:p-5 space-y-3">
          <div className="text-xs text-zinc-500">
            Detected input:{" "}
            <span className="text-zinc-300">
              {result.sourceLang === "lt" ? "Lithuanian" : "English"}
            </span>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Lithuanian
            </label>
            <div className="text-lg font-semibold text-zinc-100 break-words">
              {result.ltOut}
            </div>

            {result.phonetics && (
              <div className="text-sm text-zinc-400 mt-1">
                {result.phonetics}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 space-y-1 text-sm text-zinc-200">
            <div>
              <span className="font-semibold">English meaning (natural): </span>
              <span>{result.enNatural || result.enLiteral}</span>
            </div>
            {result.enLiteral && (
              <div className="text-zinc-400">
                <span className="font-semibold text-zinc-300">
                  Literal meaning:{" "}
                </span>
                <span>{result.enLiteral}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              data-press
              className="
                z-btn px-5 py-3 rounded-2xl text-base
                bg-emerald-600/90 hover:bg-emerald-500
                border border-emerald-300/20
                text-black font-semibold
              "
              onClick={() => handlePlay(result.ltOut)}
            >
              ▶ Normal
            </button>

            <button
              type="button"
              data-press
              className="
                z-btn px-5 py-3 rounded-2xl text-base
                bg-emerald-700/90 hover:bg-emerald-600
                border border-emerald-300/15
                text-black font-semibold
              "
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
              className={
                "z-btn z-btn-secondary px-5 py-3 rounded-2xl text-sm " +
                (!canSave ? "z-disabled" : "")
              }
              onClick={handleSaveToLibrary}
              disabled={!canSave}
            >
              Save to library
            </button>
          </div>
        </div>
      )}

      {/* Add Entry manually */}
      {typeof onOpenAddForm === "function" && (
        <button
          type="button"
          data-press
          className="
            w-full
            z-btn px-5 py-4 rounded-2xl
            bg-emerald-600/90 hover:bg-emerald-500
            border border-emerald-300/20
            text-black font-semibold
            shadow-[0_12px_40px_rgba(0,0,0,0.30)]
            active:scale-[0.99] transition
          "
          onClick={handleOpenAdd}
        >
          + Add Entry Manually
        </button>
      )}
    </div>
  );
}

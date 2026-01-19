// src/views/HomeView.jsx
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { DEFAULT_CATEGORY } from "../constants/categories";
import useLocalStorageState from "../hooks/useLocalStorageState";
import useSpeechToTextHold from "../hooks/useSpeechToTextHold";
import useTranslate from "../hooks/useTranslate";

function mapEnrichCategoryToApp(category) {
  const c = String(category || "").trim();

  const map = {
    Food: "Food & Drink",
    Emergencies: "Emergency",
    "Daily life": "General",
    Emotions: "General",
    Relationships: "Social",
  };

  return map[c] || c || DEFAULT_CATEGORY;
}

const Segmented = memo(function Segmented({ value, onChange, options }) {
  return (
    <div className="flex w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] overflow-hidden">
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
              "flex-1 px-3 py-2 text-sm font-medium transition-colors select-none " +
              (active
                ? "bg-emerald-600 text-black"
                : "bg-zinc-950/60 text-zinc-200 hover:bg-zinc-800/60") +
              (idx !== options.length - 1 ? " border-r border-zinc-800" : "")
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

  async function enrichSavedRowSilently(row) {
    try {
      if (!row?._id) return;

      if (
        (row.Usage && String(row.Usage).trim()) ||
        (row.Notes && String(row.Notes).trim())
      ) {
        return;
      }

      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lt: row.Lithuanian,
          phonetics: row.Phonetic,
          en_natural: row.EnglishNatural || row.English || "",
          en_literal: row.EnglishLiteral || row.English || "",
        }),
      });

      if (!res.ok) return;

      const data = await res.json();
      const CategoryRaw = String(data?.Category || "").trim();
      const Usage = String(data?.Usage || "").trim();
      const Notes = String(data?.Notes || "").trim();

      if (!CategoryRaw || !Usage || !Notes) return;

      const Category = mapEnrichCategoryToApp(CategoryRaw);

      setRows((prev) =>
        prev.map((r) =>
          r._id === row._id
            ? {
                ...r,
                Category: Category || r.Category || DEFAULT_CATEGORY,
                Usage,
                Notes,
              }
            : r
        )
      );
    } catch (err) {
      console.error("Enrich failed (silent):", err);
    }
  }

  const handleSaveToLibrary = useCallback(() => {
    blurTextarea();

    if (!canSave) return;

    const rawInput = input.trim();
    if (!rawInput) return;

    const englishToSave = (result.enNatural || result.enLiteral || "").trim();
    const lithuanianToSave = (result.ltOut || "").trim();
    if (!englishToSave || !lithuanianToSave) return;

    const already = rows.some((r) => {
      const en = (r.EnglishNatural || r.EnglishLiteral || r.English || "").trim();
      const lt = (r.Lithuanian || "").trim();
      return (
        en.toLowerCase() === englishToSave.toLowerCase() &&
        lt.toLowerCase() === lithuanianToSave.toLowerCase()
      );
    });

    if (already) {
      showToast?.("Already in library");
      return;
    }

    const row = {
      English: englishToSave,
      EnglishOriginal: result.sourceLang === "en" ? rawInput : englishToSave,
      EnglishLiteral: (result.enLiteral || "").trim(),
      EnglishNatural: englishToSave,

      Lithuanian: lithuanianToSave,
      LithuanianOriginal:
        result.sourceLang === "lt" ? rawInput : lithuanianToSave,

      Phonetic: result.phonetics || "",

      Category: DEFAULT_CATEGORY,
      Usage: "",
      Notes: "",

      SourceLang: result.sourceLang,

      "RAG Icon": "🟠",
      Sheet: "Phrases",

      _id: genId(),
      _ts: nowTs(),
      _qstat: {
        red: { ok: 0, bad: 0 },
        amb: { ok: 0, bad: 0 },
        grn: { ok: 0, bad: 0 },
      },
    };

    setRows((prev) => [row, ...prev]);
    showToast?.("Entry saved to library");
    enrichSavedRowSilently(row);
  }, [
    blurTextarea,
    canSave,
    genId,
    input,
    nowTs,
    result.enLiteral,
    result.enNatural,
    result.ltOut,
    result.phonetics,
    result.sourceLang,
    rows,
    setRows,
    showToast,
  ]);

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
      return base + "bg-zinc-900/60 text-zinc-500 border-zinc-800";
    }

    if (sttState === "recording") {
      return (
        base +
        "bg-emerald-500 text-black border-emerald-400 " +
        "shadow-[0_0_30px_rgba(16,185,129,0.35)]"
      );
    }

    if (sttState === "transcribing" || sttState === "translating") {
      return (
        base +
        "bg-emerald-600 text-black border-emerald-400 " +
        "shadow-[0_0_30px_rgba(16,185,129,0.25)]"
      );
    }

    return (
      base +
      "bg-zinc-900/95 text-zinc-100 border-zinc-800 " +
      "shadow-[0_0_20px_rgba(0,0,0,0.25)] hover:bg-zinc-900"
    );
  })();

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-28">
      {/* Speaking to */}
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <div className="text-sm font-semibold mb-2">Speaking to…</div>
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
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <div className="text-sm font-semibold mb-2">Tone</div>
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
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 mb-5">
        <label className="block text-sm mb-2">What would you like to say?</label>

        <textarea
          ref={textareaRef}
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm mb-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* Auto-Translate toggle */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-xs text-zinc-400">
            Auto-Translate after speech
          </div>

          <button
            type="button"
            className={
              "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors select-none " +
              (autoTranslate
                ? "bg-emerald-500 border-emerald-400"
                : "bg-zinc-800 border-zinc-700")
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
            <div className="text-xs mt-1 opacity-80">
              {sttState === "idle"
                ? "Press and hold (max 15s)"
                : "Release to stop"}
            </div>
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            className="
              bg-emerald-500 text-black rounded-full px-5 py-2
              font-semibold shadow hover:bg-emerald-400 active:bg-emerald-300
              transition-transform duration-150 active:scale-95
              select-none
            "
            onClick={handleTranslateClick}
            disabled={translating || !canTranslate}
          >
            {translating ? "Translating…" : "Translate"}
          </button>

          <button
            type="button"
            className="
              bg-zinc-800 text-zinc-200 rounded-full px-5 py-2
              font-medium hover:bg-zinc-700 active:bg-zinc-600
              transition-transform duration-150 active:scale-95
              select-none
            "
            onClick={handleClear}
            disabled={sttState !== "idle"}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Duplicate warning / existing entry view */}
      {duplicateEntry && (
        <div className="bg-amber-950/70 border border-amber-500/70 rounded-2xl p-4 mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
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
              className="
                text-xs px-3 py-1 rounded-full
                bg-zinc-900/80 text-zinc-200
                hover:bg-zinc-800 active:bg-zinc-700
              "
              onClick={() => {
                blurTextarea();
                setDuplicateEntry(null);
              }}
            >
              Dismiss
            </button>
          </div>

          <div className="text-sm font-semibold truncate">
            {duplicateEntry.English || "—"}
          </div>
          <div className="text-sm text-emerald-300 truncate">
            {duplicateEntry.Lithuanian || "—"}
          </div>

          {duplicateEntry.Phonetic && (
            <div className="text-[11px] text-zinc-300 italic mt-1 truncate">
              {duplicateEntry.Phonetic}
            </div>
          )}

          {(duplicateEntry.Usage || duplicateEntry.Notes) && (
            <div className="mt-2 text-[11px] text-zinc-200 space-y-2">
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

          <div className="flex gap-3 flex-wrap pt-3">
            <button
              type="button"
              className="
                bg-emerald-500 text-black rounded-full
                px-4 py-2 text-sm font-semibold shadow
                hover:bg-emerald-400 active:bg-emerald-300
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() =>
                duplicateEntry.Lithuanian && handlePlay(duplicateEntry.Lithuanian)
              }
            >
              ▶ Play
            </button>

            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-4 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={handleTranslateAnywayClick}
            >
              Translate anyway
            </button>
          </div>
        </div>
      )}

      {/* Output */}
      {result.ltOut && (
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.25)] p-4 space-y-3">
          <div className="text-xs text-zinc-500">
            Detected input:{" "}
            <span className="text-zinc-300">
              {result.sourceLang === "lt" ? "Lithuanian" : "English"}
            </span>
          </div>

          <div>
            <label className="block text-sm mb-1">Lithuanian</label>
            <div className="text-lg font-semibold break-words">{result.ltOut}</div>

            {result.phonetics && (
              <div className="text-sm text-zinc-400 mt-1">{result.phonetics}</div>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-3 space-y-1 text-sm">
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
              className="
                bg-emerald-500 text-black rounded-full
                px-5 py-2 text-[18px] shadow
                hover:bg-emerald-400 active:bg-emerald-300
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => handlePlay(result.ltOut)}
            >
              ▶ Normal
            </button>

            <button
              type="button"
              className="
                bg-emerald-700 text-black rounded-full
                px-5 py-2 text-[18px] shadow
                hover:bg-emerald-600 active:bg-emerald-500
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={() => handlePlay(result.ltOut, { slow: true })}
            >
              🐢 Slow
            </button>

            <button
              type="button"
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
              "
              onClick={handleCopy}
            >
              Copy
            </button>

            <button
              className="
                bg-zinc-800 text-zinc-200 rounded-full
                px-5 py-2 text-sm font-medium
                hover:bg-zinc-700 active:bg-zinc-600
                transition-transform duration-150 active:scale-95
                select-none
                disabled:opacity-60
              "
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
          className="
            w-full mt-6 bg-emerald-500 text-black rounded-full
            px-5 py-3 font-semibold shadow text-center
            hover:bg-emerald-400 active:bg-emerald-300
            transition-transform duration-150 active:scale-95
            select-none
          "
          onClick={handleOpenAdd}
        >
          + Add Entry Manually
        </button>
      )}
    </div>
  );
}

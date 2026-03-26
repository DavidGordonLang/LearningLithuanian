// src/hooks/useTranslate.js
//
// Translation flow:
//  1. Translate call fires — result shown to user immediately on completion
//  2. Enrich call fires straight after (non-blocking) — fills in Usage, Notes, Category
//     when it arrives without making the user wait for it
//
// This means the user sees the Lithuanian output as fast as possible.

import { useCallback, useRef, useState } from "react";
import { makeLtKey } from "../utils/contentKey";

const EMPTY_RESULT = {
  ltOut: "",
  categoryOut: "",
  phonetics: "",
  phoneticsIpa: "",
  enLiteral: "",
  enNatural: "",
  usageOut: "",
  notesOut: "",
  sourceLang: "en",
};

function buildInputKey(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export default function useTranslate({
  rows = [],
  tone = "friendly",
  gender = "male",
  speakerGender = "male",
  onTranslated,
  setIsTranslating,
  showToast,
  appVersion,
} = {}) {
  const [result, setResult] = useState(EMPTY_RESULT);
  const [translating, setTranslating] = useState(false);

  // Tracks whether enrichment is in flight so callers can show a subtle indicator
  const [enriching, setEnriching] = useState(false);

  // Prevent stale callbacks from updating state after a newer translate started
  const inFlightIdRef = useRef(0);

  const [duplicateEntry, setDuplicateEntry] = useState(null);

  const translate = useCallback(
    async (
      text,
      {
        tone: overrideTone,
        gender: overrideGender,
        speakerGender: overrideSpeakerGender,
        force = false,
      } = {}
    ) => {
      const input = String(text || "").trim();
      if (!input) return;

      const resolvedTone = overrideTone || tone || "friendly";
      const resolvedGender = overrideGender || gender || "male";
      const resolvedSpeakerGender = overrideSpeakerGender || speakerGender || "male";

      const inputKey = buildInputKey(input);
      const activeRows = Array.isArray(rows) ? rows.filter((r) => !r?._deleted) : [];

      // Duplicate detection before translate
      if (!force && inputKey) {
        const existing = activeRows.find((r) => {
          const ltKey = String(
            r?.contentKey || makeLtKey({ Lithuanian: r?.Lithuanian || "" })
          ).trim();

          const englishKeys = [
            String(r?.English || ""),
            String(r?.EnglishNatural || ""),
            String(r?.EnglishLiteral || ""),
            String(r?.EnglishOriginal || ""),
          ]
            .map(buildInputKey)
            .filter(Boolean);

          return ltKey === inputKey || englishKeys.includes(inputKey);
        });

        if (existing) {
          setDuplicateEntry(existing);
          setResult(EMPTY_RESULT);
          showToast?.("Similar entry found in your library");
          return {
            duplicate: true,
            entry: existing,
          };
        }
      }

      const myId = ++inFlightIdRef.current;

      try {
        setDuplicateEntry(null);
        setIsTranslating?.(true);
        setTranslating(true);

        // -----------------------------------------------------------------------
        // STEP 1 — TRANSLATE
        // Show result to user as soon as this completes, without waiting for enrich
        // -----------------------------------------------------------------------
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: input,
            tone: resolvedTone,
            gender: resolvedGender,
            speakerGender: resolvedSpeakerGender,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = String(data?.error || "Translate failed");
          showToast?.(msg);
          throw new Error(msg);
        }

        const lt = String(data.lt || "").trim();
        const cat = String(data.category || "").trim();
        const pho = String(data.phonetics || "").trim();
        const ipa = String(data.phonetics_ipa || "").trim();
        const enLit = String(data.en_literal || "").trim();
        const enNat = String(data.en_natural || "").trim();

        if (!lt || !pho || !enLit || !enNat) {
          const msg = "Translate returned incomplete data";
          showToast?.(msg);
          throw new Error(msg);
        }

        // Build partial result — everything we have from translation alone
        const partialResult = {
          ltOut: lt,
          categoryOut: cat || "",
          phonetics: pho,
          phoneticsIpa: ipa,
          enLiteral: enLit,
          enNatural: enNat,
          usageOut: "",
          notesOut: "",
          sourceLang:
            String(data.source_lang || data.sourceLang || "en") === "lt"
              ? "lt"
              : "en",
        };

        // Show translation to user immediately — stop the translating spinner
        if (inFlightIdRef.current === myId) {
          setResult(partialResult);
          setTranslating(false);
          setIsTranslating?.(false);
          onTranslated?.(partialResult);
        }

        // -----------------------------------------------------------------------
        // STEP 2 — ENRICH (non-blocking — user already sees the translation)
        // -----------------------------------------------------------------------
        if (inFlightIdRef.current === myId) {
          setEnriching(true);
        }

        try {
          const enrichRes = await fetch("/api/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lt,
              phonetics: pho,
              phonetics_ipa: ipa,
              en_natural: enNat,
              en_literal: enLit,
              tone: resolvedTone,
              gender: resolvedGender,
              speakerGender: resolvedSpeakerGender,
            }),
          });

          const enrichData = await enrichRes.json().catch(() => ({}));

          if (enrichRes.ok && inFlightIdRef.current === myId) {
            const fullResult = {
              ...partialResult,
              categoryOut: String(enrichData?.Category || cat || "").trim(),
              usageOut: String(enrichData?.Usage || "").trim(),
              notesOut: String(enrichData?.Notes || "").trim(),
            };

            setResult(fullResult);
            onTranslated?.(fullResult);
          }
        } catch {
          // Swallow enrich errors — translation is already visible and valid
        } finally {
          if (inFlightIdRef.current === myId) {
            setEnriching(false);
          }
        }

        return partialResult;
      } catch (err) {
        // Only reset translating state here if we haven't already done so above
        if (inFlightIdRef.current === myId) {
          setIsTranslating?.(false);
          setTranslating(false);
          setEnriching(false);
        }
        throw err;
      }
    },
    [appVersion, gender, speakerGender, onTranslated, rows, setIsTranslating, showToast, tone]
  );

  const reset = useCallback(() => {
    inFlightIdRef.current++;
    setResult(EMPTY_RESULT);
    setDuplicateEntry(null);
    setIsTranslating?.(false);
    setTranslating(false);
    setEnriching(false);
  }, [setIsTranslating]);

  const translateText = useCallback(
    async (text, force = false, opts = undefined) => {
      return translate(text, {
        force: !!force,
        ...(opts || {}),
      });
    },
    [translate]
  );

  const resetTranslation = useCallback(() => {
    reset();
  }, [reset]);

  return {
    // current API
    result,
    setResult,
    translate,
    reset,

    // compat API
    translating,
    translateText,
    resetTranslation,
    duplicateEntry,
    setDuplicateEntry,

    // enrichment in-flight indicator — optional, callers can use to show a subtle spinner
    enriching,
  };
}

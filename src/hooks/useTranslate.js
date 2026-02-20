// src/hooks/useTranslate.js
import { useCallback, useRef, useState } from "react";

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

export default function useTranslate({
  onTranslated,
  setIsTranslating,
  showToast,
  appVersion,
} = {}) {
  const [result, setResult] = useState(EMPTY_RESULT);

  // Compatibility: HomeView expects `translating` state from the hook.
  const [translating, setTranslating] = useState(false);

  // Prevent stale finally() from flipping state if a newer translate started.
  const inFlightIdRef = useRef(0);

  const translate = useCallback(
    async (text, { tone = "casual", gender = "neutral" } = {}) => {
      const input = String(text || "").trim();
      if (!input) return;

      const myId = ++inFlightIdRef.current;

      try {
        setIsTranslating?.(true);
        setTranslating(true);

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input, tone, gender }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = String(data?.error || "Translate failed");
          showToast?.(msg);
          throw new Error(msg);
        }

        const lt = String(data.lt || "").trim();
        const cat = String(data.category || "").trim();

        // Backwards compatibility:
        // - server returns `phonetics` (EN-style) + `phonetics_ipa` (IPA)
        // - some older builds may have only `phonetics`
        const pho = String(data.phonetics || "").trim();
        const ipa = String(data.phonetics_ipa || "").trim();

        // Server returns snake_case for English meanings
        const enLit = String(data.en_literal || "").trim();
        const enNat = String(data.en_natural || "").trim();

        // If lt is empty, treat as failure (contract)
        if (!lt || !pho || !enLit || !enNat) {
          const msg = "Translate returned incomplete data";
          showToast?.(msg);
          throw new Error(msg);
        }

        // -------------------------------------------------------------------
        // Enrichment: Usage + Notes (separate endpoint by design).
        // IMPORTANT: This does NOT change translation prompt semantics.
        // If enrich fails, we keep translation result usable.
        // -------------------------------------------------------------------
        let usageOut = "";
        let notesOut = "";
        let categoryOut = cat || "";

        try {
          const enrichRes = await fetch("/api/enrich", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lt,
              phonetics: pho,
              en_natural: enNat,
              en_literal: enLit,
            }),
          });

          const enrichData = await enrichRes.json().catch(() => ({}));

          if (enrichRes.ok) {
            categoryOut = String(
              enrichData?.Category || categoryOut || ""
            ).trim();
            usageOut = String(enrichData?.Usage || "").trim();
            notesOut = String(enrichData?.Notes || "").trim();
          } else {
            // Don't fail translate just because enrich failed
          }
        } catch {
          // swallow enrich errors (translation is primary)
        }

        const next = {
          ltOut: lt,
          categoryOut,
          phonetics: pho,
          phoneticsIpa: ipa,
          enLiteral: enLit,
          enNatural: enNat,
          usageOut,
          notesOut,
          // translate endpoint does silent source-lang detection;
          // we keep existing default contract
          sourceLang:
            String(data.source_lang || data.sourceLang || "en") === "lt"
              ? "lt"
              : "en",
        };

        // Only update state if this is still the newest in-flight request.
        if (inFlightIdRef.current === myId) {
          setResult(next);
          onTranslated?.(next);
        }

        // Optional analytics hook placeholder (kept to preserve signature usage)
        try {
          // eslint-disable-next-line no-unused-expressions
          appVersion;
        } catch {}

        return next;
      } finally {
        // Only end "translating" for the latest request.
        if (inFlightIdRef.current === myId) {
          setIsTranslating?.(false);
          setTranslating(false);
        }
      }
    },
    [appVersion, onTranslated, setIsTranslating, showToast]
  );

  const reset = useCallback(() => {
    // Cancel any pending completion toggles
    inFlightIdRef.current++;
    setResult(EMPTY_RESULT);
    setIsTranslating?.(false);
    setTranslating(false);
  }, [setIsTranslating]);

  // ---------------------------------------------------------------------------
  // Compatibility layer for HomeView (and other older callers)
  // HomeView expects:
  // - translating
  // - translateText(input, force?)  (we ignore force; behaviour unchanged)
  // - resetTranslation()
  // - (sometimes) duplicateEntry + setDuplicateEntry
  // ---------------------------------------------------------------------------

  const [duplicateEntry, setDuplicateEntry] = useState(null);

  const translateText = useCallback(
    async (text, _force = false, opts = undefined) => {
      // keep existing semantics: translate() uses default { tone, gender }
      // callers can optionally pass opts as 3rd param without breaking old signature
      return translate(text, opts || undefined);
    },
    [translate]
  );

  const resetTranslation = useCallback(() => {
    setDuplicateEntry(null);
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
  };
}
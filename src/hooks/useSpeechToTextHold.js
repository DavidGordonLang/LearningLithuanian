// src/hooks/useSpeechToTextHold.js
//
// Press-and-hold Speech-to-Text hook (MediaRecorder).
//
// CHANGE: Added optional `language` parameter.
// When provided, the ISO 639-1 language code (e.g. "lt" for Lithuanian)
// is sent to /api/stt which passes it to Whisper — forcing single-language
// decoding and preventing misdetection on short phrases.
// When omitted (default), Whisper auto-detects as before (HomeView behaviour).
//
// All other behaviour is unchanged from the original.

import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeechToTextHold({
  showToast,
  blurTextarea,
  translating,
  setInput,
  autoTranslate,
  onTranslateText,
  onSpeechCaptured,
  language = null, // NEW: optional ISO 639-1 code e.g. "lt"
} = {}) {
  const [sttState, setSttState] = useState("idle");
  const sttStateRef = useRef("idle");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopTimerRef = useRef(null);
  const stopGraceRef = useRef(null);
  const processWatchdogRef = useRef(null);

  const STT_MAX_MS = 15000;
  const STT_FETCH_TIMEOUT_MS = 20000;
  const STT_PROCESS_WATCHDOG_MS = 30000;
  const STOP_GRACE_MS = 2500;

  const setSttStateSafe = useCallback((next) => {
    sttStateRef.current = next;
    setSttState(next);
  }, []);

  const clearStopTimers = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (stopGraceRef.current) {
      clearTimeout(stopGraceRef.current);
      stopGraceRef.current = null;
    }
  }, []);

  const clearProcessWatchdog = useCallback(() => {
    if (processWatchdogRef.current) {
      clearTimeout(processWatchdogRef.current);
      processWatchdogRef.current = null;
    }
  }, []);

  const sttSupported = useCallback(() => {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    );
  }, []);

  const forceResetStt = useCallback(
    (reasonToast) => {
      clearStopTimers();
      clearProcessWatchdog();

      try {
        const mr = mediaRecorderRef.current;
        if (mr && mr.state !== "inactive") {
          try {
            mr.ondataavailable = null;
            mr.onstop = null;
            mr.stop();
          } catch {}
        }
      } catch {}

      try {
        const s = streamRef.current;
        if (s) {
          try {
            s.getTracks().forEach((t) => t.stop());
          } catch {}
        }
      } catch {}

      mediaRecorderRef.current = null;
      streamRef.current = null;
      chunksRef.current = [];

      setSttStateSafe("idle");
      if (reasonToast) showToast?.(reasonToast);
    },
    [clearProcessWatchdog, clearStopTimers, setSttStateSafe, showToast]
  );

  const cancelStt = useCallback(() => {
    forceResetStt();
  }, [forceResetStt]);

  const stopRecording = useCallback(() => {
    if (sttStateRef.current !== "recording") return;

    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();

        if (!stopGraceRef.current) {
          stopGraceRef.current = setTimeout(() => {
            if (sttStateRef.current !== "idle") {
              forceResetStt("Speech processing failed");
            }
          }, STOP_GRACE_MS);
        }
      } else {
        forceResetStt();
      }
    } catch (err) {
      console.error(err);
      forceResetStt("Speech processing failed");
    }
  }, [forceResetStt]);

  const startRecording = useCallback(async () => {
    if (!sttSupported()) {
      showToast?.("Speech input not supported on this device/browser");
      return;
    }

    if (sttStateRef.current !== "idle") {
      if (sttStateRef.current === "recording") {
        showToast?.("Already listening");
      } else if (sttStateRef.current === "transcribing") {
        showToast?.("Still transcribing — please wait");
      } else if (sttStateRef.current === "translating") {
        showToast?.("Still translating — please wait");
      } else {
        showToast?.("Speech input is busy — please wait");
      }
      return;
    }

    if (translating) {
      showToast?.("Translation in progress — please wait");
      return;
    }

    blurTextarea?.();
    onSpeechCaptured?.();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mimeType = candidates.find((t) => {
        try {
          return MediaRecorder.isTypeSupported(t);
        } catch {
          return false;
        }
      });

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        clearStopTimers();

        try {
          const s = streamRef.current;
          if (s) s.getTracks().forEach((t) => t.stop());
        } catch {}

        if (sttStateRef.current === "idle") {
          return;
        }

        clearProcessWatchdog();
        processWatchdogRef.current = setTimeout(() => {
          forceResetStt("Speech processing timed out");
        }, STT_PROCESS_WATCHDOG_MS);

        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });

        if (!blob || blob.size < 1000) {
          forceResetStt("No audio detected");
          return;
        }

        setSttStateSafe("transcribing");

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), STT_FETCH_TIMEOUT_MS);

        try {
          const fd = new FormData();
          fd.append("file", blob, "speech.webm");
          fd.append("model", "gpt-4o-mini-transcribe");
          fd.append("max_seconds", "15");

          // NEW: attach language hint if provided
          if (language) {
            fd.append("language", language);
          }

          const resp = await fetch("/api/stt", {
            method: "POST",
            body: fd,
            signal: controller.signal,
          });

          let data = {};
          try {
            data = await resp.json();
          } catch {
            data = {};
          }

          if (!resp.ok) {
            console.error("STT failed:", data);
            forceResetStt("Speech recognition failed");
            return;
          }

          const text = String(data?.text || "").trim();
          if (!text) {
            forceResetStt("Didn't catch that — try again");
            return;
          }

          setInput?.(text);

          if (autoTranslate) {
            setSttStateSafe("translating");
            try {
              await onTranslateText?.(text);
            } catch (err) {
              console.error(err);
            }
            forceResetStt();
            return;
          }

          showToast?.("Speech captured");
          forceResetStt();
        } catch (err) {
          console.error(err);
          if (err?.name === "AbortError") {
            forceResetStt("Speech recognition timed out");
          } else {
            forceResetStt("Speech recognition failed");
          }
        } finally {
          clearTimeout(t);
        }
      };

      setSttStateSafe("recording");
      mr.start();

      clearStopTimers();
      stopTimerRef.current = setTimeout(() => {
        try {
          stopRecording();
        } catch {}
      }, STT_MAX_MS);
    } catch (err) {
      console.error(err);
      forceResetStt();
      if (String(err?.name || "").includes("NotAllowed")) {
        showToast?.("Microphone permission denied");
      } else {
        showToast?.("Couldn't access microphone");
      }
    }
  }, [
    autoTranslate,
    blurTextarea,
    clearProcessWatchdog,
    clearStopTimers,
    forceResetStt,
    language,
    onSpeechCaptured,
    onTranslateText,
    setInput,
    setSttStateSafe,
    showToast,
    stopRecording,
    sttSupported,
    translating,
  ]);

  useEffect(() => {
    return () => {
      forceResetStt();
    };
  }, [forceResetStt]);

  return {
    sttState,
    sttSupported,
    startRecording,
    stopRecording,
    cancelStt,
    forceResetStt,
  };
}

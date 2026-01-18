// src/hooks/useSpeechToTextHold.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Press-and-hold Speech-to-Text hook (MediaRecorder).
 *
 * This is a SAFE extraction of the existing working inline STT logic from HomeView.
 * It preserves the same timers, watchdogs, cleanup, and /api/stt contract.
 *
 * Key contract:
 * - startRecording() is called on press (mouseDown / touchStart)
 * - stopRecording() is called on release (mouseUp / touchEnd / mouseLeave)
 * - cancelStt() is called on touchCancel
 *
 * Hook dependencies are injected so HomeView keeps ownership of UI + translation flow.
 */
export default function useSpeechToTextHold({
  showToast,
  blurTextarea,
  translating, // HomeView "translating" (translate API in-flight)
  setInput, // HomeView setInput
  autoTranslate, // boolean toggle controlled by HomeView (localStorage)
  onTranslateText, // async (text) => Promise<void>  (HomeView translateText)
  onSpeechCaptured, // optional: () => void  (e.g. clear duplicate + reset result)
} = {}) {
  // STT state machine: idle | recording | transcribing | translating
  const [sttState, setSttState] = useState("idle");
  const sttStateRef = useRef("idle");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopTimerRef = useRef(null);
  const stopGraceRef = useRef(null);
  const processWatchdogRef = useRef(null);

  // Constants (must match previous behaviour)
  const STT_MAX_MS = 15000;
  const STT_FETCH_TIMEOUT_MS = 20000; // stt should be quick for short clips
  const STT_PROCESS_WATCHDOG_MS = 30000; // absolute UI recovery cap
  const STOP_GRACE_MS = 2500; // if onstop never fires, recover

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
    // immediate cancel / reset
    forceResetStt();
  }, [forceResetStt]);

  const stopRecording = useCallback(() => {
    if (sttStateRef.current !== "recording") return;

    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();

        // If onstop doesn’t fire, recover anyway (prevents “stuck transcribing”)
        if (!stopGraceRef.current) {
          stopGraceRef.current = setTimeout(() => {
            // If we’re still not idle, force recover
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

    // No silent early exits: explain why we’re not starting.
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

        // Stop mic tracks immediately
        try {
          const s = streamRef.current;
          if (s) s.getTracks().forEach((t) => t.stop());
        } catch {}

        // If user cancelled and we pre-set idle, ignore work
        if (sttStateRef.current === "idle") {
          return;
        }

        // Start watchdog so we never get stuck
        clearProcessWatchdog();
        processWatchdogRef.current = setTimeout(() => {
          forceResetStt("Speech processing timed out");
        }, STT_PROCESS_WATCHDOG_MS);

        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });

        // “No audio” case
        if (!blob || blob.size < 1000) {
          forceResetStt("No audio detected");
          return;
        }

        setSttStateSafe("transcribing");

        // Abortable STT fetch
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), STT_FETCH_TIMEOUT_MS);

        try {
          const fd = new FormData();
          fd.append("file", blob, "speech.webm");
          fd.append("model", "gpt-4o-mini-transcribe");
          fd.append("max_seconds", "15");

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
            forceResetStt("Didn’t catch that — try again");
            return;
          }

          // Populate input immediately (same as previous behaviour)
          setInput?.(text);

          if (autoTranslate) {
            setSttStateSafe("translating");
            try {
              await onTranslateText?.(text);
            } catch (err) {
              console.error(err);
              // translateText already handles its own UI error state; we just recover STT.
            }
            forceResetStt();
            return;
          }

          // Auto-translate OFF
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

      // Hard stop at 15 seconds
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
        showToast?.("Couldn’t access microphone");
      }
    }
  }, [
    autoTranslate,
    blurTextarea,
    clearProcessWatchdog,
    clearStopTimers,
    forceResetStt,
    onSpeechCaptured,
    onTranslateText,
    setInput,
    setSttStateSafe,
    showToast,
    stopRecording,
    sttSupported,
    translating,
  ]);

  // Safety: never leave mic or timers alive on unmount
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
    forceResetStt, // exposed for emergency/manual reset if HomeView ever needs it
  };
}

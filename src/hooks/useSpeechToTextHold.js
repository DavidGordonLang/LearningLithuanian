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
// Also keeps "pending" separate from actual recording so hold-to-speak UIs do
// not show a listening state before the recorder has really started.

import { useCallback, useEffect, useRef, useState } from "react";

export default function useSpeechToTextHold({
  showToast,
  blurTextarea,
  translating,
  setInput,
  autoTranslate,
  onTranslateText,
  onSpeechCaptured,
  onRecordingStart,
  shortRecordingMessage = "Hold a little longer and speak after the mic turns green.",
  language = null, // NEW: optional ISO 639-1 code e.g. "lt"
} = {}) {
  const [sttState, setSttState] = useState("idle");
  const sttStateRef = useRef("idle");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const sessionRef = useRef(0);
  const activeSessionRef = useRef(null);
  const recordingStartedAtRef = useRef(0);

  const stopTimerRef = useRef(null);
  const stopGraceRef = useRef(null);
  const processWatchdogRef = useRef(null);
  // Tracks whether the user requested stop during the async getUserMedia init.
  // Without this, a quick tap fires stopRecording() before state reaches
  // "recording", the guard returns early, and getUserMedia resolves into a
  // runaway recording with no way to stop it.
  const stopRequestedDuringInitRef = useRef(false);

  const STT_MAX_MS = 15000;
  const STT_FETCH_TIMEOUT_MS = 20000;
  const STT_PROCESS_WATCHDOG_MS = 30000;
  const STOP_GRACE_MS = 2500;
  const MIN_RECORDING_MS = 650;
  const MIN_AUDIO_BYTES = 1000;

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
      sessionRef.current += 1;
      activeSessionRef.current = null;
      stopRequestedDuringInitRef.current = false;
      recordingStartedAtRef.current = 0;

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
    // If still initialising (getUserMedia not yet resolved), flag the intent.
    // startRecording will abort cleanly once getUserMedia resolves.
    if (sttStateRef.current === "pending") {
      stopRequestedDuringInitRef.current = true;
      forceResetStt(shortRecordingMessage);
      return;
    }

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
  }, [forceResetStt, shortRecordingMessage]);

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

    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;
    activeSessionRef.current = sessionId;

    // Move to "pending" immediately so stopRecording knows we're initialising.
    // Any stop requested before getUserMedia resolves sets stopRequestedDuringInitRef.
    stopRequestedDuringInitRef.current = false;
    recordingStartedAtRef.current = 0;
    setSttStateSafe("pending");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // User released the button (or tapped again) before we even got the mic.
      // Abort cleanly without starting a recording.
      if (
        activeSessionRef.current !== sessionId ||
        sttStateRef.current !== "pending" ||
        stopRequestedDuringInitRef.current
      ) {
        stream.getTracks().forEach((t) => t.stop());
        if (activeSessionRef.current === sessionId) setSttStateSafe("idle");
        return;
      }

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

      const markRecordingStarted = () => {
        if (activeSessionRef.current !== sessionId) return;
        if (sttStateRef.current !== "pending") return;
        recordingStartedAtRef.current = Date.now();
        setSttStateSafe("recording");
        onRecordingStart?.();

        clearStopTimers();
        stopTimerRef.current = setTimeout(() => {
          try {
            stopRecording();
          } catch {}
        }, STT_MAX_MS);
      };

      mr.onstart = markRecordingStarted;

      mr.onerror = () => {
        if (activeSessionRef.current !== sessionId) return;
        forceResetStt("Speech recording failed");
      };

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        clearStopTimers();

        try {
          const s = streamRef.current;
          if (s) s.getTracks().forEach((t) => t.stop());
        } catch {}

        if (sttStateRef.current === "idle" || activeSessionRef.current !== sessionId) {
          return;
        }

        clearProcessWatchdog();
        processWatchdogRef.current = setTimeout(() => {
          forceResetStt("Speech processing timed out");
        }, STT_PROCESS_WATCHDOG_MS);

        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });

        const recordingMs = recordingStartedAtRef.current
          ? Date.now() - recordingStartedAtRef.current
          : 0;

        if (recordingMs < MIN_RECORDING_MS || !blob || blob.size < MIN_AUDIO_BYTES) {
          forceResetStt(shortRecordingMessage);
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

          // Attach language hint if provided — both as FormData field AND
          // as a query param so the server can reliably read it either way.
          if (language) {
            fd.append("language", language);
          }

          const sttUrl = language ? `/api/stt?lang=${encodeURIComponent(language)}` : "/api/stt";

          const resp = await fetch(sttUrl, {
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

          if (activeSessionRef.current !== sessionId) return;

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

      try {
        mr.start();
        if (mr.state === "recording") {
          setTimeout(markRecordingStarted, 0);
        }
      } catch (err) {
        console.error(err);
        forceResetStt("Couldn't start microphone recording");
      }
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
    onRecordingStart,
    onSpeechCaptured,
    onTranslateText,
    setInput,
    setSttStateSafe,
    showToast,
    shortRecordingMessage,
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

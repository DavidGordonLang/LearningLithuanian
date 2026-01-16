// src/hooks/useSttPressHold.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Press-and-hold Speech-to-Text hook.
 *
 * Option A (recommended): this hook returns transcripts only.
 * The view decides what to do next (e.g. auto-translate toggle).
 *
 * State machine: idle | recording | transcribing
 */
export default function useSttPressHold({
  endpoint = "/api/stt",
  maxMs = 15000,
  fetchTimeoutMs = 20000,
  processWatchdogMs = 30000,
  stopGraceMs = 2500,
  disabled = false,
  onTranscript,
  onToast,
}) {
  const [sttState, setSttState] = useState("idle");
  const sttStateRef = useRef("idle");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const stopTimerRef = useRef(null);
  const stopGraceRef = useRef(null);
  const processWatchdogRef = useRef(null);

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

  const supported = useCallback(() => {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    );
  }, []);

  const forceReset = useCallback(
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
      if (reasonToast) onToast?.(reasonToast);
    },
    [clearProcessWatchdog, clearStopTimers, onToast, setSttStateSafe]
  );

  const stop = useCallback(() => {
    if (sttStateRef.current !== "recording") return;

    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") {
        mr.stop();

        if (!stopGraceRef.current) {
          stopGraceRef.current = setTimeout(() => {
            if (sttStateRef.current !== "idle") {
              forceReset("Speech processing failed");
            }
          }, stopGraceMs);
        }
      } else {
        forceReset();
      }
    } catch (err) {
      console.error(err);
      forceReset("Speech processing failed");
    }
  }, [forceReset, stopGraceMs]);

  const cancel = useCallback(() => {
    forceReset();
  }, [forceReset]);

  const start = useCallback(async () => {
    if (disabled) return;
    if (!supported()) {
      onToast?.("Speech input not supported on this device/browser");
      return;
    }
    if (sttStateRef.current !== "idle") return;

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

        if (sttStateRef.current === "idle") return;

        clearProcessWatchdog();
        processWatchdogRef.current = setTimeout(() => {
          forceReset("Speech processing timed out");
        }, processWatchdogMs);

        const blob = new Blob(chunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });

        // “No audio” case
        if (!blob || blob.size < 1000) {
          forceReset("No audio detected");
          return;
        }

        setSttStateSafe("transcribing");

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), fetchTimeoutMs);

        try {
          const fd = new FormData();
          fd.append("file", blob, "speech.webm");
          fd.append("model", "gpt-4o-mini-transcribe");
          fd.append("max_seconds", String(Math.ceil(maxMs / 1000)));

          const resp = await fetch(endpoint, {
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
            forceReset("Speech recognition failed");
            return;
          }

          const text = String(data?.text || "").trim();
          if (!text) {
            forceReset("Didn’t catch that — try again");
            return;
          }

          // Option A: return transcript only
          try {
            onTranscript?.(text);
          } catch {}

          forceReset(); // idle
        } catch (err) {
          console.error(err);
          if (err?.name === "AbortError") {
            forceReset("Speech recognition timed out");
          } else {
            forceReset("Speech recognition failed");
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
          stop();
        } catch {}
      }, maxMs);
    } catch (err) {
      console.error(err);
      forceReset();
      if (String(err?.name || "").includes("NotAllowed")) {
        onToast?.("Microphone permission denied");
      } else {
        onToast?.("Couldn’t access microphone");
      }
    }
  }, [
    clearProcessWatchdog,
    clearStopTimers,
    disabled,
    endpoint,
    fetchTimeoutMs,
    forceReset,
    maxMs,
    onToast,
    onTranscript,
    processWatchdogMs,
    setSttStateSafe,
    stop,
    supported,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        forceReset();
      } catch {}
    };
  }, [forceReset]);

  return {
    sttState,
    supported: supported(),
    start,
    stop,
    cancel,
  };
}

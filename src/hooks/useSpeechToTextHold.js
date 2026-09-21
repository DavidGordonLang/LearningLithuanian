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


async function speechBlobToMonoWav(blob) {
  if (typeof window === "undefined") {
    throw new Error("Audio conversion unavailable");
  }

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error("Audio conversion unavailable");
  }

  const audioContext = new AudioContextCtor();
  try {
    const encoded = await blob.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(encoded.slice(0));
    const frameCount = decoded.length;
    const channelCount = Math.max(1, decoded.numberOfChannels || 1);
    const mono = new Float32Array(frameCount);

    for (let channel = 0; channel < channelCount; channel += 1) {
      const samples = decoded.getChannelData(channel);
      for (let i = 0; i < frameCount; i += 1) {
        mono[i] += samples[i] / channelCount;
      }
    }

    const bytesPerSample = 2;
    const dataBytes = frameCount * bytesPerSample;
    const wav = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(wav);

    const writeAscii = (offset, value) => {
      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    };

    writeAscii(0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeAscii(8, "WAVE");
    writeAscii(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, decoded.sampleRate, true);
    view.setUint32(28, decoded.sampleRate * bytesPerSample, true);
    view.setUint16(32, bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeAscii(36, "data");
    view.setUint32(40, dataBytes, true);

    let offset = 44;
    for (let i = 0; i < frameCount; i += 1) {
      const sample = Math.max(-1, Math.min(1, mono[i]));
      const pcm = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
      view.setInt16(offset, pcm, true);
      offset += bytesPerSample;
    }

    return new Blob([wav], { type: "audio/wav" });
  } finally {
    try {
      await audioContext.close();
    } catch {}
  }
}

export default function useSpeechToTextHold({
  showToast,
  blurTextarea,
  translating,
  setInput,
  autoTranslate,
  onTranslateText,
  onSpeechCaptured,
  onRecordingStart,
  onNoSpeech,
  shortRecordingMessage = "Hold a little longer and speak after the mic turns green.",
  language = null,
  transcriptionModel = "gpt-4o-mini-transcribe",
  transcriptionPrompt = null,
  transcriptionKeywords = [],
  comparisonTranscriptionUrl = null,
  onComparisonTranscript,
  minRecordingMs = 650,
  showCapturedToast = true,
  showNoSpeechToast = true,
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
  const MIN_RECORDING_MS = Math.max(0, Number(minRecordingMs) || 0);
  const MIN_AUDIO_BYTES = 700;

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
          const recordedMimeType = String(blob.type || mr.mimeType || "").toLowerCase();
          const filename = recordedMimeType.includes("mp4")
            ? "speech.mp4"
            : recordedMimeType.includes("ogg")
            ? "speech.ogg"
            : recordedMimeType.includes("wav")
            ? "speech.wav"
            : "speech.webm";
          fd.append("file", blob, filename);
          fd.append("model", transcriptionModel);

          if (transcriptionPrompt) {
            fd.append("prompt", String(transcriptionPrompt));
          }

          const safeKeywords = Array.isArray(transcriptionKeywords)
            ? transcriptionKeywords.map((value) => String(value || "").trim()).filter(Boolean)
            : [];
          safeKeywords.forEach((keyword) => fd.append("keywords[]", keyword));

          if (language) {
            if (transcriptionModel === "gpt-transcribe") {
              fd.append("languages[]", language);
            } else {
              fd.append("language", language);
            }
          }

          let comparisonPromise = null;
          if (comparisonTranscriptionUrl) {
            const separator = comparisonTranscriptionUrl.includes("?") ? "&" : "?";
            const comparisonUrl = language
              ? `${comparisonTranscriptionUrl}${separator}lang=${encodeURIComponent(language)}`
              : comparisonTranscriptionUrl;

            comparisonPromise = speechBlobToMonoWav(blob)
              .then((comparisonBlob) =>
                fetch(comparisonUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "audio/wav",
                  },
                  body: comparisonBlob,
                  signal: controller.signal,
                })
              )
              .then(async (comparisonResp) => {
                let comparisonData = {};
                try {
                  comparisonData = await comparisonResp.json();
                } catch {
                  comparisonData = {};
                }
                if (!comparisonResp.ok) {
                  throw new Error(comparisonData?.error || "Comparison transcription failed");
                }
                return String(comparisonData?.text || "").trim();
              })
              .then((comparisonText) => {
                onComparisonTranscript?.({ text: comparisonText, error: null });
                return comparisonText;
              })
              .catch((comparisonError) => {
                if (comparisonError?.name !== "AbortError") {
                  console.error("Comparison STT failed:", comparisonError);
                }
                onComparisonTranscript?.({
                  text: "",
                  error:
                    comparisonError?.name === "AbortError"
                      ? "Comparison transcription timed out"
                      : String(comparisonError?.message || "Comparison transcription failed"),
                });
                return "";
              });
          }

          const sttUrl = "/api/stt";

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

          if (comparisonPromise) {
            await comparisonPromise;
          }

          const text = String(data?.text || "").trim();
          if (!text) {
            onNoSpeech?.();
            forceResetStt(showNoSpeechToast ? "Didn't catch that — try again" : null);
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

          if (showCapturedToast) showToast?.("Speech captured");
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
    minRecordingMs,
    onNoSpeech,
    onRecordingStart,
    onSpeechCaptured,
    onTranslateText,
    setInput,
    setSttStateSafe,
    showCapturedToast,
    showNoSpeechToast,
    showToast,
    transcriptionKeywords,
    transcriptionModel,
    transcriptionPrompt,
    comparisonTranscriptionUrl,
    onComparisonTranscript,
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

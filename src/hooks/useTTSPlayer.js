// src/hooks/useTTSPlayer.js
import { useCallback, useMemo, useRef, useState } from "react";
import { ttsIdbGet, ttsIdbSet } from "../utils/ttsCache";

// Fast deterministic hash (FNV-1a 32-bit)
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    // h *= 16777619 (with 32-bit overflow)
    h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function normalizeText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ");
}

function makeCacheKey({ text, voice, slow }) {
  const norm = normalizeText(text);
  const mode = slow ? "slow" : "normal";
  return `tts:v1:${voice}:${mode}:${fnv1a(norm)}`;
}

/**
 * useTTSPlayer
 * - Plays Lithuanian TTS via /api/azure-tts
 * - Memory cache (session) + IndexedDB cache (persistent)
 * - Stops any currently playing audio before starting a new one
 * - Supports preloadText() to warm cache without playback
 */
export default function useTTSPlayer({
  initialVoice = "lt-LT-LeonasNeural",
  maxIdbEntries = 200,
  onError,
} = {}) {
  const [voice, setVoice] = useState(initialVoice);

  // Session cache: key -> Blob
  const mem = useRef(new Map());

  // Current audio instance
  const audioRef = useRef(null);

  // Deduplicate concurrent fetches/preloads
  const inflight = useRef(new Map());

  const stop = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } catch {
      audioRef.current = null;
    }
  }, []);

  const playBlob = useCallback(async (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      if (audioRef.current === audio) audioRef.current = null;
    };

    try {
      await audio.play();
    } catch (e) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      if (audioRef.current === audio) audioRef.current = null;
      throw e;
    }
  }, []);

  const fetchTTS = useCallback(
    async ({ text, slow }) => {
      const resp = await fetch("/api/azure-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, slow }),
      });

      if (!resp.ok) {
        const msg = `Azure TTS failed (${resp.status})`;
        throw new Error(msg);
      }

      return await resp.blob();
    },
    [voice]
  );

  const getOrFetchBlob = useCallback(
    async (text, { slow = false } = {}) => {
      const raw = String(text || "");
      if (!raw.trim()) return null;

      const key = makeCacheKey({ text: raw, voice, slow });

      const memHit = mem.current.get(key);
      if (memHit) return memHit;

      const idbHit = await ttsIdbGet(key);
      if (idbHit) {
        mem.current.set(key, idbHit);
        return idbHit;
      }

      const inflightHit = inflight.current.get(key);
      if (inflightHit) {
        return await inflightHit;
      }

      const job = (async () => {
        const blob = await fetchTTS({ text: raw, slow });
        mem.current.set(key, blob);
        ttsIdbSet(key, blob, { maxEntries: maxIdbEntries }).catch(() => {});
        return blob;
      })();

      inflight.current.set(key, job);

      try {
        return await job;
      } finally {
        inflight.current.delete(key);
      }
    },
    [fetchTTS, maxIdbEntries, voice]
  );

  const preloadText = useCallback(
    async (text, { slow = false } = {}) => {
      const raw = String(text || "");
      if (!raw.trim()) return;

      // Preload failures are always silent — audio is fetched live on demand if cache misses.
      try {
        await getOrFetchBlob(raw, { slow });
      } catch {
        // Intentionally swallowed — a missed preload is not user-visible
      }
    },
    [getOrFetchBlob]
  );

  const playText = useCallback(
    async (text, { slow = false } = {}) => {
      const raw = String(text || "");
      if (!raw.trim()) return;

      stop();

      try {
        const blob = await getOrFetchBlob(raw, { slow });
        if (!blob) return;
        await playBlob(blob);
      } catch (e) {
        if (typeof onError === "function") {
          onError(e);
        } else {
          alert("Voice error: " + (e?.message || "Unknown error"));
        }
      }
    },
    [getOrFetchBlob, onError, playBlob, stop]
  );

  return useMemo(
    () => ({
      voice,
      setVoice,
      playText,
      preloadText,
      stop,
    }),
    [playText, preloadText, stop, voice]
  );
}

// /api/stt-speechmatics.js
// Dev diagnostic Lithuanian speech-to-text path using Speechmatics Realtime.
// Server-side only. Uses SPEECHMATICS_API_KEY from Vercel env.
//
// The browser transcodes the already-recorded mic take to mono WAV, then this
// function streams that exact take through Speechmatics Realtime. OpenAI still
// controls lesson pass/fail while the A/B diagnostic is running.

import { createSpeechmaticsJWT } from "@speechmatics/auth";
import { RealtimeClient } from "@speechmatics/real-time-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

const CHUNK_BYTES = 4096;
const TRANSCRIPT_TIMEOUT_MS = 8000;

function compactTranscript(parts) {
  return parts
    .join(" ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    console.error("SPEECHMATICS_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  try {
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const audio = Buffer.concat(chunks);
    if (!audio.length) return res.status(400).json({ error: "No audio received" });

    const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (contentType !== "audio/wav" && contentType !== "audio/x-wav") {
      return res.status(415).json({ error: "Speechmatics diagnostic expects WAV audio" });
    }

    const requestedLanguage = String(req.query?.lang || "lt").trim().toLowerCase();
    const language = /^[a-z]{2,3}$/.test(requestedLanguage) ? requestedLanguage : "lt";

    const client = new RealtimeClient({
      connectionTimeout: TRANSCRIPT_TIMEOUT_MS,
      appId: "zodis-say-it-out-loud-diagnostic",
    });

    const finalParts = [];
    let resolveTranscript;
    let rejectTranscript;
    let settled = false;

    const transcriptPromise = new Promise((resolve, reject) => {
      resolveTranscript = resolve;
      rejectTranscript = reject;
    });

    const settleSuccess = () => {
      if (settled) return;
      settled = true;
      resolveTranscript(compactTranscript(finalParts));
    };

    const settleError = (error) => {
      if (settled) return;
      settled = true;
      rejectTranscript(error instanceof Error ? error : new Error(String(error || "Speechmatics realtime error")));
    };

    client.addEventListener("receiveMessage", ({ data }) => {
      if (data.message === "AddTranscript") {
        const text = (data.results || [])
          .map((result) => result?.alternatives?.[0]?.content || "")
          .filter(Boolean)
          .join(" ")
          .trim();
        if (text) finalParts.push(text);
      } else if (data.message === "EndOfTranscript") {
        settleSuccess();
      } else if (data.message === "Error") {
        settleError(new Error(data.reason || data.type || "Speechmatics realtime error"));
      }
    });

    const jwt = await createSpeechmaticsJWT({
      type: "rt",
      apiKey,
      ttl: 60,
    });

    await client.start(jwt, {
      transcription_config: {
        language,
        model: "enhanced",
        max_delay: 0.7,
        enable_partials: false,
      },
      audio_format: {
        type: "file",
      },
    });

    for (let offset = 0; offset < audio.length; offset += CHUNK_BYTES) {
      client.sendAudio(audio.subarray(offset, Math.min(audio.length, offset + CHUNK_BYTES)));
    }

    client.stopRecognition({ noTimeout: true });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Speechmatics realtime transcription timed out")),
        TRANSCRIPT_TIMEOUT_MS
      );
    });

    const transcript = await Promise.race([transcriptPromise, timeoutPromise]);
    return res.status(200).json({ text: String(transcript || "").trim() });
  } catch (err) {
    console.error("Speechmatics realtime STT error:", err);
    return res.status(502).json({
      error: err?.message === "Speechmatics realtime transcription timed out"
        ? "Speechmatics realtime transcription timed out"
        : "Speechmatics realtime transcription failed",
    });
  }
}

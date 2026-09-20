// /api/stt-speechmatics.js
// Diagnostic Lithuanian speech-to-text path using Speechmatics.
// Server-side only. Uses SPEECHMATICS_API_KEY from Vercel env.
//
// The client sends the recorded audio blob directly (not multipart) so the
// exact same recording can be compared with the existing OpenAI STT result.

export const config = {
  api: {
    bodyParser: false,
  },
};

function filenameForMime(contentType = "") {
  const mime = String(contentType).toLowerCase();
  if (mime.includes("mp4")) return "speech.mp4";
  if (mime.includes("ogg")) return "speech.ogg";
  if (mime.includes("wav")) return "speech.wav";
  return "speech.webm";
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

    const contentType = String(req.headers["content-type"] || "audio/webm").split(";")[0].trim();
    const requestedLanguage = String(req.query?.lang || "lt").trim().toLowerCase();
    const language = /^[a-z]{2,3}$/.test(requestedLanguage) ? requestedLanguage : "lt";

    const form = new FormData();
    form.append(
      "data_file",
      new Blob([audio], { type: contentType || "audio/webm" }),
      filenameForMime(contentType)
    );
    form.append(
      "config",
      JSON.stringify({
        type: "transcription",
        transcription_config: {
          language,
          model: "enhanced",
        },
      })
    );

    const create = await fetch(
      "https://eu1.asr.api.speechmatics.com/v2/jobs/?wait=20&format=txt",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: form,
      }
    );

    const bodyText = await create.text();
    let payload = null;
    try {
      payload = JSON.parse(bodyText);
    } catch {}

    if (!create.ok) {
      console.error("Speechmatics STT error:", create.status, bodyText);
      return res.status(502).json({ error: "Speechmatics STT error" });
    }

    if (payload?.status === "done") {
      return res.status(200).json({ text: String(payload?.txt || "").trim() });
    }

    // Very short clips should normally finish inside the synchronous wait, but
    // handle the documented created state rather than treating it as failure.
    if (payload?.status === "created" && payload?.id) {
      const transcript = await fetch(
        `https://eu1.asr.api.speechmatics.com/v2/jobs/${encodeURIComponent(payload.id)}/transcript?wait=10&format=txt`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const transcriptText = await transcript.text();
      if (transcript.ok) {
        return res.status(200).json({ text: transcriptText.trim() });
      }

      console.error("Speechmatics transcript wait error:", transcript.status, transcriptText);
      return res.status(504).json({ error: "Speechmatics transcription still processing" });
    }

    console.error("Unexpected Speechmatics response:", bodyText);
    return res.status(502).json({ error: "Unexpected Speechmatics response" });
  } catch (err) {
    console.error("Speechmatics STT function error:", err);
    return res.status(500).json({ error: "Speechmatics STT failed" });
  }
}

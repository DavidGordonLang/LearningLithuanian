// /api/azure-tts.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice, slow } = req.body || {};

  if (!text || !voice) {
    return res.status(400).json({ error: "Missing text or voice." });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    console.error("Azure vars not configured.");
    return res.status(500).json({ error: "Azure config missing." });
  }

  // Slow speech adjustment
  const rateDelta = slow ? "-40%" : "0%";

  const ssml = `
    <speak version="1.0" xml:lang="lt-LT">
      <voice name="${voice}">
        <prosody rate="${rateDelta}">
          ${escapeXml(text)}
        </prosody>
      </voice>
    </speak>
  `;

  try {
    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const resp = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"
      },
      body: ssml
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error("Azure TTS error:", errTxt);
      return res.status(500).json({ error: "Azure TTS failed" });
    }

    const arrayBuf = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("Azure request error:", err);
    return res.status(500).json({ error: "Azure error during request." });
  }
}

// Small XML escaping util
function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

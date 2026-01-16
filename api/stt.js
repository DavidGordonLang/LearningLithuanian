// /api/stt.js
// Speech-to-text (press-and-hold audio) -> transcript
// Server-side only. Uses OPENAI_API_KEY from Vercel env.

export const config = {
  api: {
    bodyParser: false, // IMPORTANT: we accept multipart/form-data
  },
};

function readJsonSafely(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  try {
    // We expect multipart/form-data with:
    // - file: audio blob
    // - model: (optional) defaults to "gpt-4o-mini-transcribe"
    // - max_seconds: (optional)
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on("data", (c) => chunks.push(c));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const contentType = req.headers["content-type"] || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return res.status(400).json({ error: "Expected multipart/form-data" });
    }

    // Pass through the multipart body directly to OpenAI
    const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": contentType,
      },
      body: Buffer.concat(chunks),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("OpenAI STT error:", upstream.status, text);
      return res.status(500).json({ error: "OpenAI STT error" });
    }

    // OpenAI returns JSON (typically { text: "..." })
    const payload = readJsonSafely(text);
    const transcript = (payload?.text || "").toString().trim();

    if (!transcript) {
      return res.status(200).json({ text: "" });
    }

    return res.status(200).json({ text: transcript });
  } catch (err) {
    console.error("STT function error:", err);
    return res.status(500).json({ error: "STT failed" });
  }
}

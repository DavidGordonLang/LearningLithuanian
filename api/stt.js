// /api/stt.js
// Speech-to-text (press-and-hold audio) -> transcript
// Server-side only. Uses OPENAI_API_KEY from Vercel env.
//
// Accepts optional `language` field in the multipart form.
// When provided (e.g. "lt" for Lithuanian), Whisper is forced to decode
// in that language only — prevents misdetection on short phrases.
// When omitted, Whisper auto-detects (used by HomeView for EN input).

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

// Parse a multipart/form-data boundary from Content-Type header
function getBoundary(contentType) {
  const match = contentType.match(/boundary=([^\s;]+)/i);
  return match ? match[1] : null;
}

// Extract a named text field from raw multipart body
// Returns the string value or null if not found
function extractTextField(buffer, boundary, fieldName) {
  try {
    const body = buffer.toString("latin1");
    const delimRegex = new RegExp(
      `--${boundary}[\\s\\S]*?name="${fieldName}"[\\s\\S]*?\\r\\n\\r\\n([^\\r\\n]*)`,
      "i"
    );
    const match = body.match(delimRegex);
    return match ? match[1].trim() : null;
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

    const rawBody = Buffer.concat(chunks);

    // Language can arrive as a query parameter (preferred — reliable) or
    // as a multipart field (legacy fallback). Query param takes precedence.
    const queryLang = req.query?.lang || null;
    const boundary = getBoundary(contentType);
    const bodyLang = boundary
      ? extractTextField(rawBody, boundary, "language")
      : null;
    const language = queryLang || bodyLang || null;

    // If a language was provided, we need to rebuild the request to OpenAI
    // with the language field added. The cleanest approach is to pass the
    // raw body through as-is (same boundary) and append a language part.
    //
    // However the simplest safe approach: pass the raw body through directly
    // if no language override needed, OR rebuild with node-fetch FormData
    // when a language is specified.

    if (language) {
      // Rebuild using FormData so we can cleanly add the language field.
      // We need to extract the audio blob from the raw body first.
      // Since we can't easily parse multipart in vanilla Node, we forward
      // the original body AND append language as a separate field by
      // rewriting the multipart body.

      // Append a new part for `language` to the existing multipart body.
      const langPart =
        `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="language"\r\n\r\n` +
        `${language}`;

      // Also ensure model is present — append if not already in body
      const bodyStr = rawBody.toString("latin1");
      const hasModel = bodyStr.includes(`name="model"`);
      const modelPart = hasModel
        ? ""
        : `\r\n--${boundary}\r\n` +
          `Content-Disposition: form-data; name="model"\r\n\r\n` +
          `gpt-4o-mini-transcribe`;

      // Find the closing boundary and insert our new parts before it
      const closingBoundary = `\r\n--${boundary}--`;
      const closingIdx = rawBody.lastIndexOf(`--${boundary}--`);

      let newBody;
      if (closingIdx !== -1) {
        const before = rawBody.slice(0, closingIdx);
        const extras = Buffer.from(langPart + modelPart, "latin1");
        const closing = Buffer.from(closingBoundary, "latin1");
        newBody = Buffer.concat([before, extras, closing]);
      } else {
        // Fallback: just append
        newBody = Buffer.concat([
          rawBody,
          Buffer.from(langPart + modelPart, "latin1"),
        ]);
      }

      const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": contentType,
        },
        body: newBody,
      });

      const text = await upstream.text();

      if (!upstream.ok) {
        console.error("OpenAI STT error:", upstream.status, text);
        return res.status(500).json({ error: "OpenAI STT error" });
      }

      const payload = readJsonSafely(text);
      const transcript = (payload?.text || "").toString().trim();
      return res.status(200).json({ text: transcript });
    }

    // No language override — pass through as before (auto-detect)
    const upstream = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": contentType,
      },
      body: rawBody,
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error("OpenAI STT error:", upstream.status, text);
      return res.status(500).json({ error: "OpenAI STT error" });
    }

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

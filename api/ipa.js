// /api/ipa.js
//
// Lithuanian → IPA only.
// Used for backfilling existing library entries without changing translation output.

async function readJsonBody(req) {
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  return body || {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = await readJsonBody(req);
  const lt = String(body?.lt || "").trim();

  if (!lt) {
    return res.status(400).json({ error: "Missing lt" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  const systemPrompt = `
You are generating Lithuanian IPA for learners.

Return ONE valid JSON object and NOTHING else:
{ "ipa": "<IPA for the exact Lithuanian input>" }

Rules:
- The input will be Lithuanian. Do NOT translate. Do NOT rewrite.
- Output ONLY IPA symbols (no slashes / /, no brackets [ ]).
- Keep the whole phrase (include spaces between words).
- No extra keys. No commentary.
- The value must be a non-empty string.
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: lt },
        ],
        temperature: 0,
        max_tokens: 120,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI IPA API error:", response.status, errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content;

    let payload;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      console.error("Bad JSON from OpenAI (IPA):", raw);
      return res.status(500).json({ error: "Bad JSON from OpenAI" });
    }

    const ipa = String(payload?.ipa || "").trim();
    if (!ipa) {
      return res.status(500).json({ error: "Missing ipa" });
    }

    return res.status(200).json({ ipa });
  } catch (err) {
    console.error("IPA function error:", err);
    return res.status(500).json({ error: "IPA failed" });
  }
}
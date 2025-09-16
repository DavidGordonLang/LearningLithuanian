// api/translate.js
// Simple translator function for Vercel (Node.js runtime)

export default async function handler(req, res) {
  // Quick GET so you can verify the route exists in a browser
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      hint: "POST { text, from: 'en'|'lt'|'auto', to: 'lt'|'en' } to translate."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { text, from = "auto", to = "lt" } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing 'text' (string)" });
    }
    if (!["en", "lt", "auto"].includes(from) || !["en", "lt"].includes(to)) {
      return res.status(400).json({ error: "Invalid 'from'/'to' values" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: OPENAI_API_KEY is missing" });
    }

    const system = [
      "You are a precise EN↔LT translator.",
      "Return **strict JSON** only, matching this schema:",
      '{ "sourceLang": "en|lt", "targetLang": "en|lt",',
      '  "translation": "string", "phonetic": "string",',
      '  "usage": "string", "notes": "string" }',
      "Prefer natural, idiomatic phrasing. If 'from' is 'auto', detect the language first.",
      "For phonetic, use a simple learner-friendly pronunciation (not full IPA unless helpful).",
    ].join(" ");

    const user = JSON.stringify({
      text,
      from,
      to
    });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return res
        .status(502)
        .json({ error: "OpenAI error", details: txt || r.statusText });
    }

    const data = await r.json();
    const content =
      data?.choices?.[0]?.message?.content?.trim() || "{}";

    // Ensure it's JSON (response_format already enforces it)
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { translation: content };
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err?.message || err) });
  }
}

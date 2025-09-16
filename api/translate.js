// Force a versioned Node runtime for this Serverless Function (required by Vercel)
export const config = { runtime: 'nodejs20.x' };

// /api/translate.js
// Node.js Serverless Function (Vercel) — requires OPENAI_API_KEY in project env (Production)

export default async function handler(req, res) {
  try {
    // Simple health check so /api/translate in a browser doesn't 405
    if (req.method === 'GET') {
      return res
        .status(200)
        .json({ ok: true, hint: "POST { text, from:'en'|'lt'|'auto', to:'lt'|'en' } to translate." });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, GET");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[/api/translate] Missing OPENAI_API_KEY");
      return res.status(500).json({ ok: false, error: "Server not configured (no API key)" });
    }

    // Parse body
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON body" });
    }
    const text = (body?.text || "").trim();
    const from = (body?.from || "auto").trim();   // 'en' | 'lt' | 'auto'
    const to   = (body?.to   || "lt").trim();     // 'lt' | 'en'

    if (!text) return res.status(400).json({ ok: false, error: "Missing 'text'" });
    if (!["en", "lt", "auto"].includes(from)) return res.status(400).json({ ok: false, error: "Bad 'from' value" });
    if (!["en", "lt"].includes(to)) return res.status(400).json({ ok: false, error: "Bad 'to' value" });

    const model = process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini";

    const sys = [
      `You translate between English and Lithuanian.`,
      `Return ONLY a single JSON object with keys:`,
      `sourcelang ("en"|"lt"), targetlang ("en"|"lt"),`,
      `translation (string), phonetic (string, simple Latin with hyphens, no IPA),`,
      `usage (very short, e.g. "greeting", "polite request"), notes (short, may include alternatives).`,
      `Keep "usage" to 1–3 words max. Do not wrap the JSON in code fences.`
    ].join(" ");

    const messages = [
      { role: "system", content: sys },
      { role: "user",   content: `from=${from}, to=${to}, text="""${text}"""` }
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error("[/api/translate] OpenAI HTTP error:", resp.status, errText);
      return res.status(502).json({ ok: false, error: "Upstream error", status: resp.status });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("[/api/translate] JSON parse fail:", e, "content=", content);
      return res.status(502).json({ ok: false, error: "Model returned non-JSON" });
    }

    const out = {
      sourcelang: String(parsed.sourcelang || (from === "auto" ? "" : from)).toLowerCase(),
      targetlang: String(parsed.targetlang || to).toLowerCase(),
      translation: String(parsed.translation || "").trim(),
      phonetic: String(parsed.phonetic || "").trim(),
      usage: String(parsed.usage || "").trim(),
      notes: String(parsed.notes || "").trim()
    };

    if (!out.translation) {
      console.error("[/api/translate] Missing translation in model output:", parsed);
      return res.status(502).json({ ok: false, error: "No translation from model" });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, ...out });
  } catch (err) {
    console.error("[/api/translate] Uncaught error:", err);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}

// /api/translate.js  (full replace)
const MODEL = "gpt-4o-mini"; // fast & cheap; change if you prefer

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function forceJSON(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/\{[\s\S]*\}$/); // take the last JSON-ish block
  try { return JSON.parse(m ? m[0] : s); } catch { return null; }
}

function simplifyUsage(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  const first = s.split(/(?<=\.)\s+|;|\n/)[0];
  return first.length <= 140 ? first : first.slice(0, 140) + "…";
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      hint: "POST { text, from: 'en'|'lt'|'auto', to: 'lt'|'en' } to translate."
    });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ ok: false, error: "Missing OPENAI_API_KEY" });
  }

  let body;
  try { body = await readBody(req); }
  catch { return res.status(400).json({ ok: false, error: "Invalid JSON body" }); }

  const text = String(body?.text || "").trim();
  let from = String(body?.from || "auto").toLowerCase();
  let to = String(body?.to || "lt").toLowerCase();

  if (!text) return res.status(400).json({ ok: false, error: "Missing 'text'." });
  if (!(to === "en" || to === "lt")) return res.status(400).json({ ok: false, error: "Invalid 'to'." });
  if (!["en", "lt", "auto"].includes(from)) from = "auto";
  if (from !== "auto" && from === to) return res.status(400).json({ ok: false, error: "from and to cannot match." });

  // Build a strict instruction for a compact JSON answer
  const sys = [
    "You are an English↔Lithuanian translator.",
    "Return a single JSON object ONLY, with keys:",
    'english, lithuanian, phonetic, usage, notes.',
    "Rules:",
    "- Translate naturally and succinctly.",
    "- phonetic: simple hyphenated *target-language* pronunciation (no IPA).",
    '- usage: 1–5 words like "greeting", "restaurant", "small talk".',
    "- notes: optional brief alternates or inflection hints.",
  ].join(" ");

  const user = JSON.stringify({ text, from, to });

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user }
        ]
      }),
    });

    if (!r.ok) {
      const msg = await r.text().catch(() => "");
      return res.status(502).json({ ok: false, error: "Upstream error", detail: msg });
    }

    const out = await r.json();
    const raw = out?.choices?.[0]?.message?.content?.trim() || "";
    let data = forceJSON(raw) || {};

    // Normalize shape, tolerate older keys
    const english = (data.english ?? (from === "lt" ? (data.translation || data.toEnglish) : text) ?? "").trim();
    const lithuanian = (data.lithuanian ?? (from === "en" ? (data.translation || data.toLithuanian) : text) ?? "").trim();
    const phonetic = (data.phonetic || "").trim();
    const usage = simplifyUsage(data.usage || "");
    const notes = (data.notes || "").trim();

    // Guard: must have both sides
    if (!english || !lithuanian) {
      return res.status(200).json({
        ok: false,
        error: "Normalization failed",
        received: data,
      });
    }

    return res.status(200).json({
      ok: true,
      data: { english, lithuanian, phonetic, usage, notes }
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
};

// /api/translate.js  — full replace

const MODEL = "gpt-4o-mini";

// ---------- utils ----------
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

function extractJSON(str) {
  if (typeof str !== "string") return null;
  // Try strict JSON first
  try { return JSON.parse(str); } catch {}
  // Fallback: last JSON-looking block
  const m = str.match(/\{[\s\S]*\}$/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function shortUsage(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  const first = s.split(/(?<=\.)\s+|;|\n/)[0];
  return first.length <= 140 ? first : first.slice(0, 140) + "…";
}

// ---------- handler ----------
module.exports = async (req, res) => {
  try {
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

    // read body safely
    let body;
    try { body = await readBody(req); }
    catch (e) {
      console.error("Bad JSON body:", e);
      return res.status(400).json({ ok: false, error: "Invalid JSON body" });
    }

    const text = String(body?.text || "").trim();
    let from = String(body?.from || "auto").toLowerCase();
    let to = String(body?.to || "lt").toLowerCase();

    if (!text) return res.status(400).json({ ok: false, error: "Missing 'text'." });
    if (!["en", "lt"].includes(to)) return res.status(400).json({ ok: false, error: "Invalid 'to'." });
    if (!["en", "lt", "auto"].includes(from)) from = "auto";
    if (from !== "auto" && from === to) {
      return res.status(400).json({ ok: false, error: "from and to cannot match." });
    }

    const sys = [
      "You are an English↔Lithuanian translator.",
      "Return only a single JSON object with keys:",
      "english, lithuanian, phonetic, usage, notes.",
      "Rules:",
      "- Translate naturally and succinctly.",
      "- phonetic: simple hyphenated *target-language* pronunciation (no IPA).",
      '- usage: 1–5 words like "greeting", "restaurant", "small talk".',
      "- notes: short alternates or brief grammar hint; may be empty."
    ].join(" ");

    const user = JSON.stringify({ text, from, to });

    const headers = {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    };
    const url = "https://api.openai.com/v1/chat/completions";

    // Try with response_format first
    const basePayload = {
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    };

    async function call(payload) {
      const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
      const text = await r.text(); // never assume valid JSON
      return { ok: r.ok, status: r.status, text };
    }

    let first = await call({ ...basePayload, response_format: { type: "json_object" } });

    // Fallback without response_format if needed (older model behaviors, etc.)
    if (!first.ok) {
      console.warn("Upstream not OK (first attempt):", first.status, first.text.slice(0, 400));
      const second = await call(basePayload);
      if (!second.ok) {
        console.error("Upstream not OK (second attempt):", second.status, second.text.slice(0, 400));
        return res.status(502).json({ ok: false, error: "Upstream error", status: second.status, detail: second.text });
      }
      first = second;
    }

    // Parse model output robustly
    let parsed;
    try { parsed = JSON.parse(first.text); } catch { parsed = null; }
    const rawContent = parsed?.choices?.[0]?.message?.content?.trim?.() ?? first.text.trim();
    const data = extractJSON(rawContent) || {};

    // Normalize fields + defaults
    const english = (data.english ?? (from === "lt" ? data.translation : text) ?? "").toString().trim();
    const lithuanian = (data.lithuanian ?? (from === "en" ? data.translation : "") ?? "").toString().trim();
    const phonetic = (data.phonetic || "").toString().trim();
    const usageField = shortUsage(data.usage || "");
    const notes = (data.notes || "").toString().trim();

    if (!english || !lithuanian) {
      console.warn("Normalization failed; raw content:", rawContent.slice(0, 400));
      return res.status(200).json({
        ok: false,
        error: "Normalization failed",
        received: data,
      });
    }

    return res.status(200).json({
      ok: true,
      data: { english, lithuanian, phonetic, usage: usageField, notes }
    });
  } catch (e) {
    // absolute last-resort guard so the function never hard-crashes
    console.error("translate.js fatal:", e);
    return res.status(500).json({ ok: false, error: "Server error", detail: String(e?.message || e) });
  }
};

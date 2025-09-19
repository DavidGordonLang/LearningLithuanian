// api/translate.js
// Edge runtime; returns JSON; produces { lt, ph, usage, notes } both top-level and nested.
export const config = { runtime: "edge" };

function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

async function readJson(req) {
  try {
    return await req.json();
  } catch (err) {
    return { __parse_error: String(err?.message || err) };
  }
}

// Extract first JSON object from a string as a fallback.
function extractFirstJsonObject(text = "") {
  const s = String(text);
  let depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const chunk = s.slice(start, i + 1);
        try {
          return JSON.parse(chunk);
        } catch {}
      }
    }
  }
  return null;
}

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, { status: 405 });
    }

    const body = await readJson(req);
    if (body && body.__parse_error) {
      return json({ ok: false, error: "Invalid JSON body", detail: body.__parse_error }, { status: 400 });
    }

    const {
      english = "",
      direction = "EN2LT",
      options = {}, // tone, audience, register, variants (reserved)
    } = body || {};

    if (!english || typeof english !== "string") {
      return json({ ok: false, error: 'Missing or invalid "english" string' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // ---------- reply helper: mirror fields at top-level & nested ----------
    const reply = ({ lt = "", ph = "", usage = "", notes = "", meta = {} }) => {
      const payload = {
        ok: true,
        lt,
        ph,
        usage,
        notes,
        data: { lt, ph, usage, notes, meta },
      };
      return json(payload);
    };

    // ---------- Demo fallback (no key set) ----------
    if (!apiKey) {
      // simple stub so the UI flow works
      const targetIsLt = direction === "EN2LT";
      return reply({
        lt: targetIsLt ? `${english} (LT — demo)` : english,
        ph: targetIsLt ? "(demo phonetic)" : "",
        usage: "(demo) Short note on when to use this phrase.",
        notes: "(demo) Alternatives or grammar tips would appear here.",
        meta: { stub: true, direction, options },
      });
    }

    const targetIsLt = direction === "EN2LT";

    // ---------- Build structured prompt ----------
    const sys = [
      "You are a careful Lithuanian/English translator.",
      "Return natural everyday phrasing. Be concise and accurate.",
      "Output ONLY JSON with keys: lt, ph, usage, notes.",
      "Constraints:",
      `- 'lt': the translated line in the TARGET language (${targetIsLt ? "Lithuanian" : "English"}), no quotes.`,
      `- 'ph': ${targetIsLt ? "a simple Latin phonetic guide for the Lithuanian line (no IPA), e.g., 'Kah too hoo-ree oh-men-yee-eh'." : "empty string (\"\")"}.`,
      "- 'usage': a short one-sentence context (≤ 120 chars).",
      "- 'notes': brief helpful notes: alternatives/grammar/register (≤ 220 chars).",
    ].join("\n");

    const user = targetIsLt
      ? `Translate to NATURAL Lithuanian. Source: "${english}".`
      : `Translate to NATURAL English. Source (Lithuanian): "${english}".`;

    // Soft influence—doesn't have to be wired yet, but helps the output quality.
    const styleHints = [];
    if (options?.tone) styleHints.push(`tone=${options.tone}`);
    if (options?.audience) styleHints.push(`audience=${options.audience}`);
    if (options?.register) styleHints.push(`register=${options.register}`);
    const hint =
      styleHints.length > 0
        ? `Hints: ${styleHints.join(", ")}`
        : "Hints: none.";

    const messages = [
      { role: "system", content: sys },
      { role: "user", content: `${user}\n${hint}\nReturn JSON only.` },
    ];

    // ---------- Call OpenAI ----------
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        // Ask for structured JSON; some models may ignore this—fallback below handles that.
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return json(
        { ok: false, error: "OpenAI request failed", status: resp.status, detail: text?.slice(0, 800) },
        { status: 502 }
      );
    }

    const raw = await resp.text(); // read as text first to be robust
    let parsed = null;

    // Try direct JSON parse
    try { parsed = JSON.parse(raw); } catch {}

    // If it's a chat-completions payload with choices
    let content = parsed?.choices?.[0]?.message?.content;
    if (!content && typeof raw === "string" && !parsed) {
      // response_format sometimes yields the JSON directly (no wrapper)
      content = raw;
    }

    // Try to parse content as JSON
    let obj = null;
    if (content) {
      try { obj = JSON.parse(content); } catch {
        obj = extractFirstJsonObject(content);
      }
    }

    // Final guards
    const lt = String(obj?.lt || "").trim();
    const ph = String(obj?.ph || "").trim();
    const usage = String(obj?.usage || "").trim();
    const notes = String(obj?.notes || "").trim();

    if (!lt) {
      // As a last resort, try to pull a plain string from the model
      const fallbackLt =
        parsed?.choices?.[0]?.message?.content?.trim?.() ||
        content?.trim?.() ||
        "";
      return reply({ lt: fallbackLt, ph: targetIsLt ? ph : "", usage, notes, meta: { structured: false } });
    }

    return reply({ lt, ph: targetIsLt ? ph : "", usage, notes, meta: { structured: true } });
  } catch (err) {
    return json(
      { ok: false, error: "Server error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

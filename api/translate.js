// /api/translate.js
// Variant-aware translate endpoint
// Expects JSON: { english, direction, options: { tone, audience, register, variants: {general, female, male}, includeBalanced } }
//
// Returns JSON:
// { ok: true, variants: [{ key, lt, ph, usage, notes }...], balanced?: { lt, ph, usage, notes } }

export const config = {
  runtime: "edge",
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function coerceStr(x) {
  if (typeof x === "string") return x.trim();
  if (x == null) return "";
  return String(x).trim();
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ALT;

const SYS_PROMPT = `
You are a Lithuanian translation assistant for a phrasebook app.
Your job is to produce short, natural Lithuanian lines, plus a simple phonetic hint (Latin letters),
a one-line usage/context, and concise notes (only if genuinely useful).

CRITICAL:
- Keep Lithuanian lines short and natural for everyday speech.
- When the caller asks for multiple "variants" (general, addressing_female, addressing_male),
  ONLY change the Lithuanian if Lithuanian actually changes by addressee; otherwise reuse the same line.
- Do NOT invent gender differences where Lithuanian does not vary; Lithuanian often remains the same.
- If there is *no* change between variants, still include each requested variant (with the same Lithuanian),
  so the client can collapse them.
- "Balanced" is an explanatory peek: provide a slightly more literal paraphrase/word-choice explanation.
  Do not be verbose; 1–2 sentences max. Use English for explanations.

Output schema (MUST be valid JSON):
{
  "variants": [
    { "key": "general", "lt": "...", "ph": "...", "usage": "...", "notes": "..." },
    { "key": "addressing_female", "lt": "...", "ph": "...", "usage": "...", "notes": "..." },
    { "key": "addressing_male", "lt": "...", "ph": "...", "usage": "...", "notes": "..." }
  ],
  "balanced": { "lt": "...", "ph": "...", "usage": "...", "notes": "..." } // include ONLY if requested
}

Rules:
- "ph" is a rough, friendly phonetic; keep it short (no IPA).
- "usage" is one concise sentence.
- "notes" is optional; keep it tight (alternatives/register/grammar only if helpful).
- Never include Markdown or backticks.
`;

async function callOpenAI({ english, direction, options }) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const wantGeneral = !!(options?.variants?.general);
  const wantFemale  = !!(options?.variants?.female);
  const wantMale    = !!(options?.variants?.male);
  const wantBalanced = !!options?.includeBalanced;

  const requestedKeys = [];
  if (wantGeneral) requestedKeys.push("general");
  if (wantFemale)  requestedKeys.push("addressing_female");
  if (wantMale)    requestedKeys.push("addressing_male");

  // Simple guard – always request at least general
  if (requestedKeys.length === 0) requestedKeys.push("general");

  const userPrompt = {
    english: coerceStr(english),
    direction: direction === "LT2EN" ? "LT2EN" : "EN2LT",
    tone: coerceStr(options?.tone || "neutral"),
    audience: coerceStr(options?.audience || "general"),
    register: coerceStr(options?.register || "natural"),
    requestedVariants: requestedKeys,
    includeBalanced: wantBalanced,
  };

  const messages = [
    { role: "system", content: SYS_PROMPT },
    {
      role: "user",
      content:
        `Translate with the constraints below and return EXACTLY the JSON schema:

Task:
- Direction: ${userPrompt.direction}
- English: "${userPrompt.english}"

Style:
- Tone: ${userPrompt.tone}
- Audience: ${userPrompt.audience}
- Register: ${userPrompt.register}

Variants to produce: ${userPrompt.requestedVariants.join(", ")}
Include balanced: ${userPrompt.includeBalanced ? "yes" : "no"}

Remember: produce JSON only, no extra text.`,
    },
  ];

  // Use the Chat Completions API via fetch to avoid SDK coupling
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`OpenAI HTTP ${resp.status}: ${txt || resp.statusText}`);
  }

  const data = await resp.json();
  const raw = data?.choices?.[0]?.message?.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Model did not return valid JSON.");
  }

  const cleanedVariants = Array.isArray(parsed.variants) ? parsed.variants : [];
  const clean = (v, key) => ({
    key: key || coerceStr(v.key),
    lt: coerceStr(v.lt),
    ph: coerceStr(v.ph),
    usage: coerceStr(v.usage),
    notes: coerceStr(v.notes),
  });

  const out = {
    ok: true,
    variants: cleanedVariants.map((v) => clean(v)),
  };

  if (userPrompt.includeBalanced && parsed.balanced) {
    out.balanced = clean(parsed.balanced, "balanced");
  }

  return out;
}

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return json(405, { ok: false, error: "Method not allowed" });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return json(400, { ok: false, error: "Expected JSON body" });
    }

    const english = coerceStr(body.english);
    const direction = coerceStr(body.direction || "EN2LT");
    const options = body.options || {};

    if (!english) {
      return json(400, { ok: false, error: 'Missing or invalid "english" string' });
    }

    const result = await callOpenAI({ english, direction, options });
    return json(200, result);
  } catch (err) {
    return json(500, {
      ok: false,
      error: String(err?.message || err || "Server error"),
    });
  }
}
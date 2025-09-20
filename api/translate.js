// api/translate.js
// Vercel serverless function — returns JSON only.
// Requires: OPENAI_API_KEY (environment variable)

export const config = {
  // IMPORTANT: use a supported runtime
  runtime: "nodejs",
};

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"; // fallback model name
const OPENAI_URL =
  process.env.OPENAI_API_BASE?.replace(/\/+$/, "") ||
  "https://api.openai.com/v1/chat/completions";

const jsonHeader = { "content-type": "application/json; charset=utf-8" };

// Helper: build strict system prompt
function systemPrompt() {
  return `
You are a Lithuanian language assistant for a flashcard app.

### CRITICAL OUTPUT RULES
- **Always return ALL requested variants** as separate objects: "general", "female", "male".
- **Never collapse** or omit variants in the API response, even if identical. The UI will handle collapsing.
- If Lithuanian forms are **truly identical**, still return them separately with the **same "lt"**. (The UI will collapse.)
- Output **ONLY** valid JSON that matches the schema below. No prose, no code fences.

### TARGET DIALECT
- Standard Lithuanian.

### FIELDS PER VARIANT
- "lt": Lithuanian translation (one concise line).
- "ph": phonetic hint for English speakers; keep short and consistent with prior examples (ASCII, hyphenate syllables, e.g., "ash tah-veh mee-lyoo").
- "usage": one-line usage (what situation this card is used in).
- "notes": brief nuance/grammar/register notes. OK to be empty "" if nothing important.

### SCHEMA (STRICT)
{
  "variants": [
    { "key": "general", "lt": "...", "ph": "...", "usage": "...", "notes": "..." },
    { "key": "female",  "lt": "...", "ph": "...", "usage": "...", "notes": "..." },
    { "key": "male",    "lt": "...", "ph": "...", "usage": "...", "notes": "..." }
  ]
}

### CONTEXT HINTS
- Consider tone/audience/register if provided; keep translations natural and polite by default.
- For adjectives (e.g., “good”), **gendered** forms typically differ:
  - "good" → general: **gerai** (adverb), female (addressing female or feminine predicate): **gera**, male: **geras**.
- For fixed phrases/verbs (e.g., “I love you”), all three may be identical: **Aš tave myliu**.
- Examples you MUST follow:
  - Input: "Good" → general: "gerai", female: "gera", male: "geras".
  - Input: "I love you" → general/female/male all: "Aš tave myliu".

Return **only** the JSON object described in the schema.
`;
}

// Helper: user prompt
function userPrompt({ english, tone, audience, register }) {
  return `
English: ${english}

Tone: ${tone || "neutral"}
Audience: ${audience || "general"}
Register: ${register || "natural"}

Return JSON for three variants exactly as per schema.
`;
}

// Call OpenAI
async function callOpenAI({ english, tone, audience, register }) {
  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: userPrompt({ english, tone, audience, register }) },
    ],
  };

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Upstream ${res.status}: ${txt || res.statusText}`);
  }

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.message; // very defensive

  return typeof content === "string" ? content : JSON.stringify(content || {});
}

// Normalize/validate model output into {variants:[...]}
function normalize(raw) {
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    // Sometimes models add code fences; try to salvage
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) obj = JSON.parse(m[0]);
  }

  if (!obj || !Array.isArray(obj.variants)) {
    throw new Error("Model returned unexpected shape (missing variants array).");
  }

  // Ensure exactly three keys and required fields
  const wanted = new Set(["general", "female", "male"]);
  const cleaned = obj.variants
    .filter(
      (v) =>
        v &&
        typeof v === "object" &&
        wanted.has(v.key) &&
        typeof v.lt === "string" &&
        v.lt.trim().length > 0
    )
    .map((v) => ({
      key: v.key,
      lt: (v.lt || "").trim(),
      ph: (v.ph || "").trim(),
      usage: (v.usage || "").trim(),
      notes: (v.notes || "").trim(),
    }));

  // Fill any missing variant with placeholders to avoid 0-length array
  ["general", "female", "male"].forEach((k) => {
    if (!cleaned.find((v) => v.key === k)) {
      cleaned.push({
        key: k,
        lt: "",
        ph: "",
        usage: "",
        notes: "",
      });
    }
  });

  // Sort by desired order
  cleaned.sort((a, b) =>
    ["general", "female", "male"].indexOf(a.key) -
    ["general", "female", "male"].indexOf(b.key)
  );

  return { variants: cleaned };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.writeHead(405, jsonHeader);
      res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    const body = await readJson(req);
    const english = safeString(body.english);
    const tone = safeString(body.tone);
    const audience = safeString(body.audience);
    const register = safeString(body.register);

    if (!english) {
      res.writeHead(400, jsonHeader);
      res.end(JSON.stringify({ ok: false, error: 'Missing or invalid "english" string' }));
      return;
    }

    // Call LLM
    const raw = await callOpenAI({ english, tone, audience, register });
    const parsed = normalize(raw);

    // Ensure at least one usable Lithuanian string exists
    const hasLt = parsed.variants.some((v) => v.lt && v.lt.trim());
    if (!hasLt) {
      res.writeHead(200, jsonHeader);
      res.end(
        JSON.stringify({
          ok: false,
          error: "No usable Lithuanian found in model response",
          raw,
        })
      );
      return;
    }

    res.writeHead(200, jsonHeader);
    res.end(JSON.stringify({ ok: true, ...parsed }));
  } catch (err) {
    res.writeHead(500, jsonHeader);
    res.end(
      JSON.stringify({
        ok: false,
        error: "Server error",
        detail: String(err?.message || err),
      })
    );
  }
}

// --- helpers ---
function safeString(v) {
  return typeof v === "string" ? v.trim() : "";
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.setEncoding("utf8");
    req.on("data", (c) => (buf += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(buf || "{}"));
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}
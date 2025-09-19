// api/translate.js
export const config = { runtime: "nodejs" };

/* ----------------------------- helpers ----------------------------- */
function bad(res, msg = "Bad Request", code = 400) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: false, error: msg }));
}
function ok(res, data) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true, ...data }));
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.on("data", (c) => (buf += c));
    req.on("end", () => {
      try { resolve(JSON.parse(buf || "{}")); }
      catch (e) { reject(e); }
    });
  });
}

// Naive LT → phonetic fallback
function ltToPhonetic(s = "") {
  const mapSingles = { č:"ch", š:"sh", ž:"zh", ą:"ah", ę:"eh", į:"ee", ų:"oo", ū:"oo", ė:"eh" };
  let out = s.normalize("NFC");
  out = out.replace(/[čšžąęįųūė]/gi, (ch) => {
    const lower = ch.toLowerCase();
    const rep = mapSingles[lower] || ch;
    return ch === lower ? rep : rep.charAt(0).toUpperCase() + rep.slice(1);
  });
  out = out
    .replace(/j/gi, (ch) => (ch === "j" ? "y" : "Y"))
    .replace(/y/gi, (ch) => (ch === "y" ? "ee" : "Ee"))
    .replace(/\s+/g, " ")
    .trim();
  return out;
}
function dedupeByLt(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const key = (v.lt || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key); out.push(v);
  }
  return out;
}
function stripCodeFences(s = "") {
  const t = String(s || "");
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1] : t;
}
function wantedVariants(body) {
  const list = [];
  if (body.includeGeneral) list.push("general");
  if (body.includeFemale) list.push("female");
  if (body.includeMale) list.push("male");
  if (!list.length) list.push("general");
  return list;
}

/* ----------------------------- prompt ------------------------------ */
function buildPrompt(input) {
  const {
    english,
    tone = "neutral",
    audience = "general",
    register = "natural",
    direction = "EN2LT",
    sheet = "Phrases",
  } = input;

  const isEN2LT = String(direction || "").toUpperCase() === "EN2LT";

  const matrixRules = `
MATRIX (Lithuanian)
- "General / plural" MUST use polite/plural 2nd-person: **jūs / jus / jums / jūsų** with plural/polite verb agreement.
- "Addressing female" & "Addressing male" MUST use informal singular **tu / tave / tau / tavo** with singular verb agreement.
- If female & male end up identical, return the same LT for both and note "Gender-neutral in Lithuanian."
- Respect tone/audience/register when possible, without breaking pronoun/verb rules.

OUTPUT JSON SHAPE (STRICT):
{
  "variants": [
    {
      "variant": "general|female|male",
      "lt": "Lithuanian",
      "ph": "Beginner-friendly phonetics (not IPA)",
      "usage": "Short usage line",
      "notes": "0–2 concise hints (may be empty)"
    }
  ]
}
NO markdown, NO comments, NO extra keys. If you can only produce one Lithuanian sentence, produce it for all requested variants with correct pronoun/verb.
`;

  const system = `You are a careful Lithuanian translator for a beginner phrasebook app. Keep it idiomatic and safe.`;
  const user = [
    `DIRECTION: ${isEN2LT ? "EN → LT" : "LT → EN"}`,
    `SHEET: ${sheet}`,
    `TONE: ${tone}`,
    `AUDIENCE: ${audience}`,
    `REGISTER: ${register} (Natural default; Balanced/Literal can be left as hints in notes)`,
    `ENGLISH INPUT: "${String(english || "").trim()}"`,
    matrixRules,
  ].join("\n\n");

  return { system, user };
}

/* ------------------------ OpenAI call + unwrap ---------------------- */
async function openAIJson(prompt, model = "gpt-4o-mini", temperature = 0.2) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BETA || "";
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user },
      ],
    }),
  });

  const rawText = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${rawText}`);

  // Parse the envelope
  let envelope;
  try { envelope = JSON.parse(rawText); }
  catch { throw new Error(`Non-JSON envelope from OpenAI: ${rawText.slice(0, 200)}…`); }

  const content = envelope?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response missing message content");

  // Content itself is a JSON string (per response_format)
  const clean = stripCodeFences(content);
  let obj;
  try { obj = JSON.parse(clean); }
  catch { throw new Error(`Model returned non-JSON content: ${clean.slice(0, 200)}…`); }

  return obj;
}

/* ----------------------------- shape fixers ----------------------------- */
function normalizeVariantObj(v, fallbackVariant = "general") {
  const variant = String(v.variant || fallbackVariant || "general").toLowerCase();
  const lt = String(v.lt || v.lithuanian || v.text || "").trim();
  const ph = String(v.ph || v.phonetics || v.phonetic || "").trim();
  const usage = String(v.usage || v.context || "").trim();
  const notes = String(v.notes || v.note || v.hint || "").trim();
  if (!lt) return null;
  return { variant, lt, ph, usage, notes };
}
function coerceToVariantArray(json) {
  if (Array.isArray(json?.variants)) {
    return json.variants.map((x) => normalizeVariantObj(x)).filter(Boolean);
  }
  const buckets = [];
  ["general", "female", "male"].forEach((k) => {
    if (json && typeof json[k] === "object") {
      const n = normalizeVariantObj({ ...json[k], variant: k });
      if (n) buckets.push(n);
    }
  });
  if (buckets.length) return buckets;
  if (json && typeof json === "object" && (json.lt || json.lithuanian || json.text)) {
    const one = normalizeVariantObj(json, "general");
    return one ? [one] : [];
  }
  if (Array.isArray(json)) {
    return json.map((x, i) => normalizeVariantObj(x, i === 0 ? "general" : "female")).filter(Boolean);
  }
  return [];
}

/* ------------------------------- handler ------------------------------- */
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Use POST");

  let body;
  try { body = await parseBody(req); }
  catch { return bad(res, "Invalid JSON body"); }

  const english = String(body.english || "").trim();
  if (!english) return bad(res, 'Missing or invalid "english" string');

  const wanted = wantedVariants(body);
  const prompt = buildPrompt(body);

  try {
    const modelObj = await openAIJson(prompt);
    let variants = coerceToVariantArray(modelObj);

    // keep only requested ones
    const wantedSet = new Set(wanted);
    variants = variants.filter((v) => wantedSet.has(v.variant));

    // If unlabeled or single only, replicate to requested set
    if (!variants.length) {
      const one = coerceToVariantArray(modelObj)[0];
      if (one) variants = wanted.map((k) => ({ ...one, variant: k }));
    }

    // Phonetic fallback
    variants = variants.map((v) => ({
      ...v,
      ph: v.ph && v.ph.trim() ? v.ph : ltToPhonetic(v.lt),
    }));

    // Dedupe identical LT
    variants = dedupeByLt(variants);

    if (!variants.length) return ok(res, { variants: [] });
    return ok(res, { variants });
  } catch (e) {
    return bad(res, `Translation failed: ${e?.message || e}`, 500);
  }
}
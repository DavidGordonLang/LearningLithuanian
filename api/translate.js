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

// Naive LT → phonetic fallback (keeps it readable; not IPA)
function ltToPhonetic(s = "") {
  const m = {
    č: "ch", š: "sh", ž: "zh",
    ą: "ah", ę: "eh", į: "ee", ų: "oo", ū: "oo",
    ė: "eh", į̃: "ee", ą̃: "ah",
    gy: "gee", gi: "gee",
    j: "y", y: "ee", i: "ee", u: "oo", e: "eh", a: "ah", o: "oh",
  };
  let out = s.normalize("NFC");
  // double-pass for digraph-ish and single letters
  out = out.replace(/č|š|ž|ą|ę|į|ų|ū|ė/gi, (ch) => {
    const lower = ch.toLowerCase();
    const rep = m[lower] || ch;
    return ch === lower ? rep : rep.charAt(0).toUpperCase() + rep.slice(1);
  });
  out = out
    .replace(/j/gi, (ch) => (ch === "j" ? "y" : "Y"))
    .replace(/y/gi, (ch) => (ch === "y" ? "ee" : "Ee"));
  // Light cleanup of doubled spaces, punctuation spacing
  return out.replace(/\s+/g, " ").trim();
}

// collapse duplicate variants by identical LT
function dedupeByLt(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const key = (v.lt || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

// tolerate ```json … ``` wrappers
function stripCodeFences(s = "") {
  const t = String(s || "");
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const m = t.match(fence);
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
- Respect tone/audience/register when possible, without breaking the pronoun/verb rules.

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

async function openAIJson(prompt, model = "gpt-4o-mini", temperature = 0.2) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BETA || "";
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
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

  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${text}`);

  // tolerate rare accidental fences even with response_format
  const clean = stripCodeFences(text);
  let data;
  try { data = JSON.parse(clean); }
  catch { throw new Error(`Non-JSON from OpenAI: ${text.slice(0, 200)}…`); }
  return data;
}

/* ----------------------------- shape fixers ----------------------------- */
function normalizeVariantObj(v, fallbackVariant = "general") {
  // accept aliases: lithuanian, lt, text; phonetics, phonetic, ph; etc.
  const variant = String(v.variant || fallbackVariant || "general").toLowerCase();
  const lt = String(v.lt || v.lithuanian || v.text || "").trim();
  const ph = String(v.ph || v.phonetics || v.phonetic || "").trim();
  const usage = String(v.usage || v.context || "").trim();
  const notes = String(v.notes || v.note || v.hint || "").trim();
  if (!lt) return null;
  return { variant, lt, ph, usage, notes };
}

function coerceToVariantArray(json) {
  // Preferred: { variants: [...] }
  if (Array.isArray(json?.variants)) {
    return json.variants.map((x) => normalizeVariantObj(x)).filter(Boolean);
  }

  // Accept separate keys: { general: {...}, female: {...}, male: {...} }
  const keys = ["general", "female", "male"];
  const found = [];
  keys.forEach((k) => {
    if (json && typeof json[k] === "object" && json[k]) {
      const n = normalizeVariantObj({ ...json[k], variant: k });
      if (n) found.push(n);
    }
  });
  if (found.length) return found;

  // Accept a single object: { lt, ph, ... }
  if (json && typeof json === "object" && (json.lt || json.lithuanian || json.text)) {
    const one = normalizeVariantObj(json, "general");
    return one ? [one] : [];
  }

  // Accept an array of objects directly
  if (Array.isArray(json)) {
    return json.map((x, i) => normalizeVariantObj(x, i === 0 ? "general" : "female")).filter(Boolean);
  }

  return [];
}

/* ------------------------------- handler ------------------------------- */
export default async function handler(req, res) {
  if (req.method !== "POST") return bad(res, "Use POST");

  let body;
  try {
    body = await parseBody(req);
  } catch {
    return bad(res, "Invalid JSON body");
  }

  const english = String(body.english || "").trim();
  if (!english) return bad(res, 'Missing or invalid "english" string');

  const wanted = wantedVariants(body); // ["general", "female", "male"] subset
  const prompt = buildPrompt(body);

  try {
    const raw = await openAIJson(prompt);
    let variants = coerceToVariantArray(raw);

    // Keep only requested ones (but allow us to remap below)
    const wantedSet = new Set(wanted);
    variants = variants.filter((v) => wantedSet.has(v.variant));

    // If model didn’t label variants, copy the first across the requested set
    if (!variants.length && raw) {
      const one = coerceToVariantArray(raw)[0];
      if (one) variants = wanted.map((k) => ({ ...one, variant: k }));
    }

    // Fallback phonetic if missing
    variants = variants.map((v) => ({
      ...v,
      ph: v.ph && v.ph.trim() ? v.ph : ltToPhonetic(v.lt),
    }));

    // Dedupe identical LT (model may produce same LT for female/male)
    variants = dedupeByLt(variants);

    // Final sanity: keep at least one
    if (!variants.length) {
      return ok(res, { variants: [] }); // front-end will show the soft error you saw
    }

    return ok(res, { variants });
  } catch (e) {
    return bad(res, `Translation failed: ${e?.message || e}`, 500);
  }
}
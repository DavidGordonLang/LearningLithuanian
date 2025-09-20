// api/translate.js
// Vercel Node runtime (NOT nodejs18.x)
export const config = { runtime: "nodejs" };

const MODEL = "gpt-4o-mini"; // small + good enough for this task

/**
 * Small helper: send JSON with proper status
 */
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

/**
 * Validate a non-empty string
 */
function s(x) {
  return typeof x === "string" ? x.trim() : "";
}

/**
 * Safe JSON parse from model text
 */
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, { ok: false, error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return send(res, 500, {
      ok: false,
      error:
        "Missing OPENAI_API_KEY. Add it to your Vercel/Env settings for server functions.",
    });
  }

  let body = null;
  try {
    body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (c) => (data += c));
      req.on("end", () => {
        try {
          resolve(JSON.parse(data || "{}"));
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });
  } catch {
    return send(res, 400, { ok: false, error: "Invalid JSON body" });
  }

  const english = s(body.english);
  if (!english) {
    return send(res, 400, { ok: false, error: 'Missing or invalid "english" string' });
  }

  // Optional context knobs from the form (all strings; UI decides allowed values)
  const tone = s(body.tone); // "neutral" | "friendly" | "formal" | "reserved"
  const audience = s(body.audience); // "general" | "peer" | "respectful" | "intimate"
  const register = s(body.register); // "natural" | "balanced" | "literal"

  // Which variants the user asked us to generate
  const variantsRequested = {
    general: !!body?.variants?.general,
    female: !!body?.variants?.female,
    male: !!body?.variants?.male,
  };

  // If nothing specified, default to general only
  if (!variantsRequested.general && !variantsRequested.female && !variantsRequested.male) {
    variantsRequested.general = true;
  }

  // Build the instruction for the model
  const system = [
    "You are a careful Lithuanian translator and linguist.",
    "Return JSON ONLY. Do not include any other text.",
    "You translate the given English line into Lithuanian with short, clear phonetic hints (ASCII, hyphenated syllables).",
    "Also provide a one-line usage and a short notes line.",
    "You MUST return one object per requested variant (general, female, male) even if identical.",
    "If a variant is truly identical in Lithuanian, set neutral=true and include 'Gender-neutral in Lithuanian.' in notes.",
    "If gender affects the Lithuanian form (e.g., adjectives like 'good' → geras/gera/gerai; past-tense verbs; addressed person), output distinct forms and set neutral=false.",
    "Keep it concise and natural; obey any tone/audience/register hints.",
  ].join(" ");

  const user = {
    english,
    tone,
    audience,
    register,
    variantsRequested,
    // Output contract the UI expects
    schema: {
      type: "object",
      properties: {
        variants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { enum: ["general", "female", "male"] },
              lt: { type: "string" }, // Lithuanian
              ph: { type: "string" }, // phonetic, ASCII, hyphenated
              usage: { type: "string" },
              notes: { type: "string" },
              neutral: { type: "boolean" }, // true if identical across genders
            },
            required: ["key", "lt", "ph", "usage", "notes", "neutral"],
          },
        },
      },
      required: ["variants"],
    },
    // Examples to steer
    examples: [
      {
        english: "Good",
        expectation:
          "Return: general→'gerai' (neutral=true), female→'gera' (neutral=false), male→'geras' (neutral=false) when all three requested.",
      },
      {
        english: "I love you",
        expectation:
          "Often gender-neutral: all variants identical 'Aš tave myliu' and notes must include 'Gender-neutral in Lithuanian.' with neutral=true.",
      },
      {
        english: "Can you help me?",
        expectation:
          "Polite form 'Ar galite man padėti?' across variants likely neutral=true; add a short usage and appropriate notes.",
      },
    ],
    // The actual task input (kept at the end)
    task: "Translate the given english. Produce ONLY the JSON for { variants: [...] }.",
  };

  // Compose a single Chat Completions request
  let raw;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(user) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return send(res, 502, {
        ok: false,
        error: "Upstream model error",
        detail: text.slice(0, 1000),
      });
    }

    const data = await resp.json();
    raw = data?.choices?.[0]?.message?.content ?? "";
  } catch (e) {
    return send(res, 500, { ok: false, error: "OpenAI request failed", detail: String(e) });
  }

  // Parse/validate JSON coming back
  const parsed = safeJsonParse(raw);
  const arr = Array.isArray(parsed?.variants) ? parsed.variants : [];

  // Keep only requested keys + minimal validation
  const keep = new Set(
    Object.entries(variantsRequested)
      .filter(([, on]) => on)
      .map(([k]) => k)
  );

  const clean = arr
    .filter(
      (v) =>
        v &&
        keep.has(v.key) &&
        s(v.lt) &&
        typeof v.neutral === "boolean" &&
        s(v.ph) &&
        s(v.usage) &&
        s(v.notes)
    )
    .map((v) => ({
      key: v.key,
      lt: s(v.lt),
      ph: s(v.ph),
      usage: s(v.usage),
      notes: s(v.notes),
      neutral: !!v.neutral,
    }));

  if (!clean.length) {
    return send(res, 200, {
      ok: false,
      error:
        "Translate returned, but no usable Lithuanian was found. Ensure the model returns { variants: [{ key, lt, ph, usage, notes, neutral }] }.",
      raw, // help debugging in devtools
    });
  }

  // Optional: light post-processing – trim trailing punctuation mismatch etc.
  for (const v of clean) {
    v.lt = v.lt.replace(/\s+/g, " ").trim();
    v.ph = v.ph.replace(/\s+/g, " ").trim();
    v.usage = v.usage.replace(/\s+/g, " ").trim();
    v.notes = v.notes.replace(/\s+/g, " ").trim();
  }

  return send(res, 200, { ok: true, variants: clean });
}
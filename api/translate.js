// api/translate.js
export const config = {
  runtime: "nodejs18.x",
};

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
      try {
        resolve(JSON.parse(buf || "{}"));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function wantedVariants(body) {
  const list = [];
  if (body.includeGeneral) list.push({ key: "general", label: "General / plural" });
  if (body.includeFemale) list.push({ key: "female", label: "Addressing female" });
  if (body.includeMale) list.push({ key: "male", label: "Addressing male" });
  // If none checked, default to general (prevents empty previews)
  if (!list.length) list.push({ key: "general", label: "General / plural" });
  return list;
}

function buildPrompt(input) {
  const {
    english,
    tone = "neutral",
    audience = "general",
    register = "natural",
    direction = "EN2LT",
    sheet = "Phrases",
  } = input;

  // We only enforce the matrix when EN -> LT (your current flow)
  const isEN2LT = String(direction || "").toUpperCase() === "EN2LT";

  // Hard rule set: how “you” should map in Lithuanian by variant.
  // These are *requirements*, not suggestions.
  const matrixRules = `
MATRIX RULES (Lithuanian)
- "General / plural" MUST use formal/plural 2nd-person: **jūs (nom.) / jus (acc.) / jums (dat.) / jūsų (gen.)**, with matching verb agreement (plural/polite).
- "Addressing female" and "Addressing male" MUST use informal singular: **tu (nom.) / tave (acc.) / tau (dat.) / tavo (gen.)**, with singular verb agreement.

GUIDANCE
- If the phrase has no grammatical difference between male vs female (e.g., "Aš tave myliu"), produce identical LT text for those two and add a short note: "Gender-neutral in Lithuanian."
- If the phrase uses adjectives or past participles that change by addressee gender (rare for direct address), inflect appropriately.
- Respect requested tone/audience/register when word choice allows, but DO NOT violate the pronoun/verb-agreement rules above.

EXAMPLES (not to be copied literally unless they match the input):
- "I love you."
  • general → "Aš jus myliu."
  • addressing female → "Aš tave myliu."
  • addressing male → "Aš tave myliu." (note gender-neutral)
- "Do you have time?"
  • general → "Ar turite laiko?" (polite) 
  • addressing female/male → "Ar turi laiko?"
`;

  // Output schema
  const schema = `
OUTPUT
Return ONLY JSON with this shape:
{
  "variants": [
    { "variant": "general|female|male",
      "lt": "Lithuanian",
      "ph": "English-friendly phonetics",
      "usage": "1 concise sentence of usage",
      "notes": "0-2 concise lines of guidance/alternatives; may be empty"
    }
  ]
}
No markdown, no extra keys, no comments.
`;

  const sys = [
    `You are a careful Lithuanian translator for a phrasebook app.`,
    `Target users are beginners; keep translations idiomatic, clean, and safe.`,
    `Keep usage/notes short.`,
  ].join(" ");

  const user = [
    `DIRECTION: ${isEN2LT ? "EN → LT" : "LT → EN"}`,
    `SHEET: ${sheet}`,
    `TONE: ${tone}`,
    `AUDIENCE: ${audience}`,
    `REGISTER: ${register} (Natural default; Balanced/Literal are reference-only for notes)`,
    matrixRules,
    `INPUT ENGLISH: "${english.trim()}"`,
    schema,
  ].join("\n\n");

  return { system: sys, user };
}

async function openAIJson(prompt, model = "gpt-4o-mini", temperature = 0.3) {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BETA || "";
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY");
  }

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

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${txt || res.statusText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

function sanitizeVariant(v) {
  const variant = String(v?.variant || "").toLowerCase();
  const lt = String(v?.lt || "").trim();
  const ph = String(v?.ph || "").trim();
  const usage = String(v?.usage || "").trim();
  const notes = String(v?.notes || "").trim();
  if (!["general", "female", "male"].includes(variant)) return null;
  if (!lt) return null;
  return { variant, lt, ph, usage, notes };
}

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

  // Compose
  const variantsWanted = wantedVariants(body);
  const prompt = buildPrompt(body);

  try {
    const json = await openAIJson(prompt);

    // Filter to only the variants we asked for, and sanitize
    const got = Array.isArray(json?.variants) ? json.variants : [];
    const mapWanted = new Set(variantsWanted.map((v) => v.key));
    const cleaned = got
      .map(sanitizeVariant)
      .filter(Boolean)
      .filter((v) => mapWanted.has(v.variant));

    // If model returned fewer variants than requested, try to synthesize missing ones
    const have = new Set(cleaned.map((v) => v.variant));
    variantsWanted.forEach((w) => {
      if (have.has(w.key)) return;
      // Minimal fallback: reuse any available as a placeholder and mark note.
      const reuse = cleaned[0];
      if (reuse) {
        cleaned.push({
          ...reuse,
          variant: w.key,
          notes:
            (reuse.notes ? reuse.notes + " " : "") +
            "(Auto-filled: verify pronoun/register for this variant.)",
        });
      }
    });

    // Return strictly what the client expects
    return ok(res, { variants: cleaned });
  } catch (e) {
    return bad(
      res,
      `Translation failed: ${e?.message || e || "Unknown error"}`,
      500
    );
  }
}
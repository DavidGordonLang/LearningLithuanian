// api/translate.js
export const config = {
  runtime: "nodejs",
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

  const isEN2LT = String(direction || "").toUpperCase() === "EN2LT";

  const matrixRules = `
MATRIX RULES (Lithuanian)
- "General / plural" MUST use formal/plural 2nd-person: **jūs (nom.) / jus (acc.) / jums (dat.) / jūsų (gen.)**, with matching verb agreement (plural/polite).
- "Addressing female" and "Addressing male" MUST use informal singular: **tu (nom.) / tave (acc.) / tau (dat.) / tavo (gen.)**, with singular verb agreement.

GUIDANCE
- If male vs female are identical in Lithuanian, return the same LT for both and add note "Gender-neutral in Lithuanian."
- Respect tone/audience/register when word choice allows, but DO NOT violate the pronoun/verb rules.

EXAMPLES:
- "I love you."
  • general → "Aš jus myliu."
  • addressing female → "Aš tave myliu."
  • addressing male → "Aš tave myliu." (note gender-neutral)
- "Do you have time?"
  • general → "Ar turite laiko?" (polite) 
  • addressing female/male → "Ar turi laiko?"
`;

  const schema = `
OUTPUT
Return ONLY JSON:
{
  "variants": [
    { "variant": "general|female|male",
      "lt": "Lithuanian",
      "ph": "English-friendly phonetics",
      "usage": "1 concise sentence of usage",
      "notes": "0-2 concise lines; may be empty"
    }
  ]
}
No markdown, extra keys, or comments.
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
    `INPUT ENGLISH: "${String(english || "").trim()}"`,
    schema,
  ].join("\n\n");

  return { system: sys, user };
}

async function openAIJson(prompt, model = "gpt-4o-mini", temperature = 0.3) {
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

  const variantsWanted = wantedVariants(body);
  const prompt = buildPrompt(body);

  try {
    const json = await openAIJson(prompt);
    const got = Array.isArray(json?.variants) ? json.variants : [];
    const wantedSet = new Set(variantsWanted.map((v) => v.key));
    const cleaned = got
      .map(sanitizeVariant)
      .filter(Boolean)
      .filter((v) => wantedSet.has(v.variant));

    const have = new Set(cleaned.map((v) => v.variant));
    variantsWanted.forEach((w) => {
      if (have.has(w.key)) return;
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

    return ok(res, { variants: cleaned });
  } catch (e) {
    return bad(`Translation failed: ${e?.message || e || "Unknown error"}`, 500);
  }
}
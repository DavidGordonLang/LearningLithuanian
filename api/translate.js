// File: api/translate.js
// Vercel Edge Function – robust JSON parsing + clearer errors + backward compatibility.

export const config = { runtime: "edge" };

const MODEL = (process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini").trim();
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

/* ------------------------- helpers ------------------------- */
const j = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const s = (x, f = "") => (typeof x === "string" ? x : f).trim();
const b = (x) => x === true || x === "true" || x === 1 || x === "1";

const pickCategory = (txt = "") =>
  txt.trim().endsWith("?") ? "Questions" : "Phrases";

/* Build prompt */
function buildPrompt(payload) {
  const {
    direction = "EN2LT",
    english = "",
    lithuanian = "",
    tone = "Neutral",
    audience = "General",
    register = "Natural",
    variants = {},
  } = payload || {};

  const src = s(direction) === "LT2EN" ? "Lithuanian" : "English";
  const dst = s(direction) === "LT2EN" ? "English" : "Lithuanian";
  const userText = src === "English" ? s(english) : s(lithuanian);

  const wantGeneral = b(variants?.general ?? true);
  const wantFemale = b(variants?.female);
  const wantMale = b(variants?.male);
  const variantList = [
    ...(wantGeneral ? ["general"] : []),
    ...(wantFemale ? ["female"] : []),
    ...(wantMale ? ["male"] : []),
  ];
  const wantVariants =
    variantList.length > 1 || (variantList.length === 1 && variantList[0] !== "general");
  const includeBalanced = register === "Balanced";

  const regNote =
    register === "Literal"
      ? "Produce a literal, word-for-word style where feasible, even if slightly stiff."
      : register === "Balanced"
      ? "Produce a balanced rendering (close to the source wording but still natural)."
      : "Default to natural, idiomatic modern usage.";

  const sys = [
    "You are a careful bilingual translator between English and Lithuanian.",
    "Return concise fields in strict JSON as instructed.",
    "Never invent facts; keep usage and notes practical for a learner.",
  ].join(" ");

  const user = [
    `Translate the following ${src} text into ${dst}.`,
    `Source (${src}): """${userText}"""`,
    `Tone: ${tone}. Audience: ${audience}. Register: ${register}. ${regNote}`,
    wantVariants
      ? `Also generate ${variantList.length} ${dst} variants as appropriate: ${variantList.join(", ")}.`
      : "A single best rendering is fine.",
    includeBalanced
      ? `Additionally provide a "balanced" ${dst} rendering (closer to source wording but still natural).`
      : "",
    `Return JSON with keys:`,
    wantVariants
      ? `  - "lithuanian" (primary), "phonetic", "usage", "notes", "category", "variants" (array of {key, lithuanian, phonetic, usage, notes}),`
      : `  - "lithuanian" (primary), "phonetic", "usage", "notes", "category",`,
    includeBalanced ? `  - "balanced"` : ``,
    `Category must be "Phrases", "Questions", "Words", or "Numbers".`,
  ]
    .filter(Boolean)
    .join("\n");

  return { sys, user, includeBalanced };
}

function normalizeResponse(payload, ai) {
  const direction = payload?.direction || "EN2LT";

  let lithuanian = s(ai.lithuanian);
  let phonetic = s(ai.phonetic);
  let usage = s(ai.usage);
  let notes = s(ai.notes);
  let category = ai.category && ["Phrases", "Questions", "Words", "Numbers"].includes(ai.category)
    ? ai.category
    : pickCategory(payload?.english || payload?.lithuanian || "");

  const balanced = s(ai.balanced);

  const variants = Array.isArray(ai.variants)
    ? ai.variants
        .map((v) => ({
          key: s(v.key),
          lithuanian: s(v.lithuanian),
          phonetic: s(v.phonetic),
          usage: s(v.usage),
          notes: s(v.notes),
        }))
        .filter((v) => v.lithuanian)
    : [];

  if (balanced) {
    const cue = `\n\nBalanced peek: ${balanced}`;
    notes = notes ? notes + cue : cue.trim();
  }

  if (!lithuanian && direction === "EN2LT") lithuanian = "";
  if (!phonetic) phonetic = "";

  return {
    lithuanian,
    phonetic,
    usage,
    notes,
    category,
    balanced: balanced || undefined,
    variants: variants.length ? variants : undefined,
  };
}

/* ------------------------- handler ------------------------- */
export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return j({ error: "Method not allowed" }, 405);
    }

    if (!process.env.OPENAI_API_KEY) {
      return j({ error: "OPENAI_API_KEY is not configured" }, 500);
    }

    const payload = await req.json().catch(() => ({}));
    const { sys, user } = buildPrompt(payload);

    const oaRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!oaRes.ok) {
      const txt = await oaRes.text().catch(() => "");
      return j(
        {
          error: "openai_request_failed",
          status: oaRes.status,
          detail: txt || oaRes.statusText,
        },
        502
      );
    }

    const data = await oaRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let ai;
    try {
      ai = JSON.parse(content);
    } catch {
      ai = {};
    }

    const out = normalizeResponse(payload, ai);
    return j(out, 200);
  } catch (err) {
    return j({ error: "translate_unexpected", detail: String(err?.message || err) }, 500);
  }
}

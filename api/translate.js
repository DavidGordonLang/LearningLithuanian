// Vercel Serverless Function (Node.js)
// File: api/translate.js
// Reads body JSON and returns a translation object your client already understands,
// plus optional `variants` and `balanced`.

const MODEL = process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function safeStr(x, fallback = "") {
  return (typeof x === "string" ? x : fallback).trim();
}

function bool(x) {
  return x === true || x === "true" || x === 1 || x === "1";
}

function pickCategory(txt = "") {
  // Very light heuristic; the UI can still override.
  const t = txt.trim();
  if (t.endsWith("?")) return "Questions";
  return "Phrases";
}

// Compose a single instruction for one variant
function variantInstruction(variantKey) {
  if (variantKey === "female") {
    return "Addressed person is female; use forms that agree with addressing a woman when gendered forms differ.";
  }
  if (variantKey === "male") {
    return "Addressed person is male; use forms that agree with addressing a man when gendered forms differ.";
  }
  // general
  return "Addressed person is unspecified or plural; prefer neutral/general address.";
}

function makeMessages(payload) {
  const {
    direction = "EN2LT",
    english = "",
    lithuanian = "",
    tone = "Neutral",
    audience = "General",
    register = "Natural",
    variants = {},
  } = payload || {};

  // We translate either EN→LT or LT→EN; current app focuses on EN→LT.
  const src = safeStr(direction) === "LT2EN" ? "Lithuanian" : "English";
  const dst = safeStr(direction) === "LT2EN" ? "English" : "Lithuanian";

  const userText =
    src === "English" ? safeStr(english) : safeStr(lithuanian);

  const wantGeneral = bool(variants?.general ?? true);
  const wantFemale = bool(variants?.female);
  const wantMale = bool(variants?.male);

  const variantList = [
    ...(wantGeneral ? ["general"] : []),
    ...(wantFemale ? ["female"] : []),
    ...(wantMale ? ["male"] : []),
  ];

  // Register guidance
  const regNote =
    register === "Literal"
      ? "Produce a literal, word-for-word style where feasible, even if a bit stiff."
      : register === "Balanced"
      ? "Produce a balanced rendering (close to the source wording but still natural)."
      : "Default to natural, idiomatic modern usage.";

  const sys = [
    "You are a careful bilingual translator between English and Lithuanian.",
    "Return concise fields in strict JSON as instructed.",
    "Never invent facts; keep usage and notes practical for a learner.",
  ].join(" ");

  const style = `Tone: ${tone}. Audience: ${audience}. Register: ${register}. ${regNote}`;

  // When multiple variants are requested, we’ll ask for an array of variants too.
  const wantVariants = variantList.length > 1 || (variantList.length === 1 && variantList[0] !== "general");

  // Balanced “peek” (for Notes/aux info)
  const includeBalanced = register === "Balanced";

  const user = [
    `Translate the following ${src} text into ${dst}.`,
    `Source (${src}): """${userText}"""`,
    style,
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
    `Notes should include brief alternatives, register/grammar tips where useful.`,
    `Category should be one of "Phrases", "Questions", "Words", or "Numbers".`,
  ]
    .filter(Boolean)
    .join("\n");

  return { sys, user, wantVariants, includeBalanced, variantList };
}

async function callOpenAI(messages) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: messages.sys },
        { role: "user", content: messages.user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error (${res.status}): ${txt || res.statusText}`);
  }

  const out = await res.json();
  const content = out?.choices?.[0]?.message?.content ?? "{}";
  let json;
  try {
    json = JSON.parse(content);
  } catch {
    json = {};
  }
  return json;
}

function normalizeResponse(payload, ai) {
  const direction = payload?.direction || "EN2LT";

  // Primary fields
  let lithuanian = safeStr(ai.lithuanian);
  let phonetic = safeStr(ai.phonetic);
  let usage = safeStr(ai.usage);
  let notes = safeStr(ai.notes);
  let category = ai.category && ["Phrases", "Questions", "Words", "Numbers"].includes(ai.category)
    ? ai.category
    : pickCategory(payload?.english || payload?.lithuanian || "");

  // Optional Balanced
  const balanced = safeStr(ai.balanced);

  // Variants, if any
  const variants = Array.isArray(ai.variants)
    ? ai.variants
        .map(v => ({
          key: safeStr(v.key),
          lithuanian: safeStr(v.lithuanian),
          phonetic: safeStr(v.phonetic),
          usage: safeStr(v.usage),
          notes: safeStr(v.notes),
        }))
        .filter(v => v.lithuanian)
    : [];

  // If balanced exists, tuck a short cue into notes (non-destructive)
  if (balanced) {
    const cue = `\n\nBalanced peek: ${balanced}`;
    notes = notes ? notes + cue : cue.trim();
  }

  // Fallbacks: if the model somehow didn’t return Lithuanian for EN→LT, keep client stable
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

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
      return;
    }

    const payload = req.body || {};
    const { sys, user } = makeMessages(payload);

    const ai = await callOpenAI({ sys, user });
    const out = normalizeResponse(payload, ai);

    // Backward compatible: ensure top-level keys exist
    res.status(200).json(out);
  } catch (err) {
    console.error("[/api/translate] error:", err);
    res.status(500).json({ error: "Translate failed" });
  }
};

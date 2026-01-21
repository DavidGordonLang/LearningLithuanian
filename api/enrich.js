// /api/enrich.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const lt = typeof body.lt === "string" ? body.lt.trim() : "";
  const phonetics = typeof body.phonetics === "string" ? body.phonetics.trim() : "";
  const en_natural = typeof body.en_natural === "string" ? body.en_natural.trim() : "";
  const en_literal = typeof body.en_literal === "string" ? body.en_literal.trim() : "";

  if (!lt) {
    return res.status(400).json({ error: "Missing lt" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // AUTHORITATIVE CATEGORY LIST (LOCKED)
  // ---------------------------------------------------------------------------
  const CATEGORIES = [
    "General",
    "Travel",
    "Food & Drink",
    "Shopping",
    "Health",
    "Work",
    "Housing",
    "Bureaucracy",
    "Emergency",
    "Social",
    "Romantic",
    "Sexual",
    "Parenting",
    "Education",
    "Numbers",
    "Time & Dates",
  ];

  // ---------------------------------------------------------------------------
  // ENRICHMENT PROMPT (USAGE + NOTES ONLY)
  // ---------------------------------------------------------------------------
  const enrichSystemPrompt = `
You are a language enrichment engine for English speakers learning Lithuanian.

Your job is NOT to translate.
Your job is to ENRICH an existing, already-correct translation.

Return ONE valid JSON object with EXACTLY these keys:
{
  "Usage": "",
  "Notes": ""
}

Rules:
- Do NOT include Category.
- Do NOT retranslate the phrase.
- Do NOT explain grammar formally.
- Notes must be multi-line with clear spacing.
- If variants are useful, include them inside Notes.
- If you include Lithuanian variants, put phonetics on the line directly underneath each variant.
- Do NOT assume gender unless the Lithuanian wording itself encodes it.
- Output ONLY valid JSON. No extra text.
`.trim();

  // ---------------------------------------------------------------------------
  // CATEGORY CLASSIFICATION PROMPT (INTENT-BASED, DOMINANT RULES)
  // ---------------------------------------------------------------------------
  const categorySystemPrompt = `
You are a strict intent classifier.

Your task:
- Read the Lithuanian phrase and its English meanings.
- Choose EXACTLY ONE category from the allowed list.

Allowed categories:
${CATEGORIES.join(", ")}

CRITICAL DOMINANCE RULES (MUST FOLLOW):
- If the phrase expresses sexual arousal, desire, sexual activity, or being "turned on", the category MUST be "Sexual".
- Sexual intent OVERRIDES Romantic, Social, and General.
- Romantic is ONLY for emotional bonding, affection, or love without sexual arousal.
- Social is for greetings, small talk, arguments, or casual interaction without intimacy.
- Use General ONLY if no other category clearly applies.

Return ONLY this JSON:
{ "Category": "<one category from the list>" }

Rules:
- Category must match one of the allowed values EXACTLY.
- No explanation.
- No extra keys.
- No text outside JSON.
`.trim();

  const enrichUser = `
LITHUANIAN:
${lt}

PHONETICS:
${phonetics || "(not provided)"}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  const categoryUser = `
LITHUANIAN:
${lt}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  try {
    // 1) Generate enrichment (Usage + Notes)
    const enrichResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: enrichSystemPrompt },
          { role: "user", content: enrichUser },
        ],
        temperature: 0.2,
        max_tokens: 420,
      }),
    });

    const enrichJson = await enrichResp.json();
    const enrichRaw = enrichJson?.choices?.[0]?.message?.content;
    const enrichPayload = JSON.parse(enrichRaw);

    const Usage = String(enrichPayload?.Usage || "").trim();
    const Notes = String(enrichPayload?.Notes || "").trim();

    if (!Usage || !Notes) {
      throw new Error("Incomplete enrichment payload");
    }

    // 2) Classify category (translation intent only)
    const catResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: categorySystemPrompt },
          { role: "user", content: categoryUser },
        ],
        temperature: 0.0,
        max_tokens: 60,
      }),
    });

    const catJson = await catResp.json();
    const catRaw = catJson?.choices?.[0]?.message?.content;
    const catPayload = JSON.parse(catRaw);

    let Category = String(catPayload?.Category || "").trim();
    if (!CATEGORIES.includes(Category)) {
      Category = "General";
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich error:", err);

    return res.status(200).json({
      Category: "General",
      Usage: "Used when a Lithuanian speaker would naturally say this in context.",
      Notes: "Enrichment could not be generated this time.",
    });
  }
}

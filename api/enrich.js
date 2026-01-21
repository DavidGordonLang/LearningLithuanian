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

  const categories = [
    "Social",
    "Travel",
    "Food",
    "Work",
    "Health",
    "Emotions",
    "Relationships",
    "Daily life",
    "Emergencies",
    "Education",
    "General",
  ];

  // Lightweight fallback categoriser (only used if LLM classification fails)
  const fallbackCategory = () => {
    const s = `${lt} ${en_natural} ${en_literal}`.toLowerCase();

    if (
      s.includes("turns me on") ||
      s.includes("slept with") ||
      s.includes("sex") ||
      s.includes("sexual") ||
      s.includes("užveda") ||
      s.includes("uzveda") ||
      s.includes("mylėjausi") ||
      s.includes("mylejausi")
    ) {
      return "Relationships";
    }

    if (s.includes("fuck off") || s.includes("atsiknisk") || s.includes("atsipisk")) {
      return "Social";
    }

    if (
      s.includes("don't touch") ||
      s.includes("stop touching") ||
      s.includes("hands off") ||
      s.includes("get off me") ||
      s.includes("neliesk") ||
      s.includes("neliestyk")
    ) {
      return "Emergencies";
    }

    if (s.includes("business") || s.includes("project") || s.includes("verslas") || s.includes("projektas")) {
      return "Work";
    }

    if (s.includes("it hit me") || s.includes("realised") || s.includes("supratau")) {
      return "Emotions";
    }

    return "General";
  };

  const enrichSystemPrompt = `
You are a language enrichment engine for English speakers learning Lithuanian.

Your job is NOT to translate.
Your job is to ENRICH an existing, already-correct translation.

You MUST return ONE valid JSON object and NOTHING else.

The JSON object MUST have EXACTLY these keys:
{
  "Usage": "",
  "Notes": ""
}

Rules:
- Do NOT include Category.
- Do NOT include extra keys.
- No markdown.
- No grammar jargon (no genitive/dative/reflexive/etc.).
- Notes must be multi-line with clear spacing.
- If variants are useful, include a "Variants:" block inside Notes.
- If you include a Lithuanian variant in Notes, put its phonetics on the next line underneath it.
- Do NOT assume gender (man/woman) unless the Lithuanian wording itself encodes it.
`.trim();

  const categorySystemPrompt = `
You are a strict classifier.

Choose exactly ONE Category from this fixed list:
${categories.join(", ")}

You will be given a Lithuanian phrase and its English meanings.
Pick the most useful category for a learner.

Return ONE valid JSON object and NOTHING else:
{ "Category": "<one of the allowed categories>" }

Rules:
- Category must be exactly one of the allowed values (case-sensitive).
- No extra keys.
- No explanation.
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

  // For classification we use only translation outputs (no enrich notes)
  const categoryUser = `
LITHUANIAN:
${lt}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  try {
    // 1) Enrich (Usage + Notes)
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
    const enrichRaw = enrichJson?.choices?.[0]?.message?.content?.trim();
    const enrichPayload = JSON.parse(enrichRaw);

    const Usage = String(enrichPayload?.Usage || "").trim();
    const Notes = String(enrichPayload?.Notes || "").trim();

    if (!Usage || !Notes) {
      throw new Error("Incomplete enrichment payload");
    }

    // 2) Category classification (from translation only)
    let Category = "";
    try {
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
      const catRaw = catJson?.choices?.[0]?.message?.content?.trim();
      const catPayload = JSON.parse(catRaw);

      Category = String(catPayload?.Category || "").trim();
      if (!categories.includes(Category)) {
        Category = "";
      }
    } catch {
      Category = "";
    }

    if (!Category) {
      Category = fallbackCategory();
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich function error:", err);

    return res.status(200).json({
      Category: fallbackCategory(),
      Usage: "Used when a Lithuanian speaker would naturally say this in context.",
      Notes: "Enrichment could not be generated this time.",
    });
  }
}

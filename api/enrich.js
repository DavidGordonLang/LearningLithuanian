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
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // SINGLE SOURCE OF TRUTH FOR CATEGORY
  // ---------------------------------------------------------------------------
  function determineCategory() {
    const s = `${lt} ${en_natural} ${en_literal}`.toLowerCase();

    if (
      s.includes("turns me on") ||
      s.includes("sexual") ||
      s.includes("arousal") ||
      s.includes("slept with") ||
      s.includes("užveda") ||
      s.includes("kaitina") ||
      s.includes("mylėjausi")
    ) {
      return "Relationships";
    }

    if (
      s.includes("fuck off") ||
      s.includes("atsiknisk") ||
      s.includes("atsipisk")
    ) {
      return "Social";
    }

    if (
      s.includes("don't touch") ||
      s.includes("hands off") ||
      s.includes("get off me") ||
      s.includes("neliesk") ||
      s.includes("neliestyk")
    ) {
      return "Emergencies";
    }

    if (
      s.includes("business") ||
      s.includes("project") ||
      s.includes("verslas") ||
      s.includes("projektas")
    ) {
      return "Work";
    }

    if (
      s.includes("it hit me") ||
      s.includes("realised") ||
      s.includes("supratau")
    ) {
      return "Emotions";
    }

    return "Social"; // safe default for conversational language
  }

  const Category = determineCategory();

  const systemPrompt = `
You are a language enrichment engine for English speakers learning Lithuanian.

Your job is NOT to translate.
Your job is to ENRICH an existing, already-correct translation.

You MUST NOT change:
- The Lithuanian phrase
- The English meanings
- The phonetics

You ONLY add learning context.

────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────
Return ONE valid JSON object with ONLY:

{
  "Usage": "",
  "Notes": ""
}

Do NOT include Category.
Do NOT include any other fields.
`.trim();

  const userMessage = `
LITHUANIAN:
${lt}

PHONETICS:
${phonetics || "(not provided)"}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 350,
      }),
    });

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content;
    const payload = JSON.parse(raw);

    return res.status(200).json({
      Category,
      Usage: payload.Usage.trim(),
      Notes: payload.Notes.trim(),
    });
  } catch (err) {
    console.error("Enrich error:", err);

    return res.status(200).json({
      Category,
      Usage: "Used when a Lithuanian speaker would naturally say this in context.",
      Notes: "Enrichment could not be generated this time.",
    });
  }
}

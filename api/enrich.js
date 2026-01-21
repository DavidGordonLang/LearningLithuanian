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

  const { lt, phonetics, en_natural, en_literal } = body;

  if (!lt || !phonetics || !en_natural || !en_literal) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server config error" });
  }

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
Return ONE valid JSON object, and NOTHING else.

{
  "Category": "",
  "Usage": "",
  "Notes": ""
}

────────────────────────────────
CATEGORY RULES (DETERMINISTIC)
────────────────────────────────
You MUST choose the category using these rules, in order:

1) If the phrase expresses sexual attraction, arousal, flirting, desire, intimacy, or sex → Category MUST be "Relationships".
2) If the phrase is swearing, insults, confrontation → "Social".
3) If the phrase is physical boundaries or safety (don’t touch me, get off me) → "Emergencies".
4) If the phrase is about emotions, realisations, emotional impact → "Emotions".
5) If the phrase is about business or work → "Work".
6) Otherwise choose the closest category.
7) Use "General" ONLY if nothing fits.

You are NOT allowed to override rule 1.

────────────────────────────────
USAGE RULES
────────────────────────────────
1–2 sentences describing when a Lithuanian speaker would use this phrase.
No assumptions about gender or target unless the Lithuanian wording changes.

────────────────────────────────
NOTES RULES
────────────────────────────────
Notes must:
- Be multi-line
- Use plain British English
- Explain meaning, tone, and common learner mistakes
- Avoid grammar jargon

────────────────────────────────
VARIANTS — STRICT RULES
────────────────────────────────
Include variants ONLY if:
- The Lithuanian wording is different
- The variant helps a learner avoid sounding rude or inappropriate

DO NOT:
- Repeat the base phrase as a variant
- Put explanations inside the Variants list

If variants exist, format like this:

Variants:
- Formal / polite: Kaip Jūs?
  Phonetics: kai-p yoos

If NO useful variants exist:
- Add one line in Notes: "No useful variants for this phrase."

────────────────────────────────
ALTERNATIVE PHRASE (OPTIONAL)
────────────────────────────────
Include ONE alternative only if it adds real learning value.

Format:

An alternative phrase is:

[Lithuanian phrase] — [English meaning]
[phonetics]

Then a short explanation.

────────────────────────────────
ABSOLUTE BANS
────────────────────────────────
- No retranslation
- No emojis
- No commentary outside JSON
`.trim();

  const userMessage = `
LITHUANIAN:
${lt}

PHONETICS:
${phonetics}

ENGLISH (NATURAL):
${en_natural}

ENGLISH (LITERAL):
${en_literal}
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${apiKey}\`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.15,
        max_tokens: 400,
      }),
    });

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content;
    const payload = JSON.parse(raw);

    return res.status(200).json({
      Category: payload.Category.trim(),
      Usage: payload.Usage.trim(),
      Notes: payload.Notes.trim(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Enrichment failed" });
  }
}

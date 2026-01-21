// /api/enrich.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel sometimes passes body as a string
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const { lt, phonetics, en_natural, en_literal } = body;

  if (!lt || !String(lt).trim()) {
    return res.status(400).json({ error: "Missing lt" });
  }
  if (!phonetics || !String(phonetics).trim()) {
    return res.status(400).json({ error: "Missing phonetics" });
  }
  if (!en_natural || !String(en_natural).trim()) {
    return res.status(400).json({ error: "Missing en_natural" });
  }
  if (!en_literal || !String(en_literal).trim()) {
    return res.status(400).json({ error: "Missing en_literal" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
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

Exact shape required:

{
  "Category": "",
  "Usage": "",
  "Notes": ""
}

Rules:
- No extra keys.
- No missing keys.
- No markdown.
- Every value must be a non-empty string.

────────────────────────────────
CATEGORY RULES (FOLLOW THESE STRICTLY)
────────────────────────────────
Choose ONE category only from this list:

Social
Travel
Food
Work
Health
Emotions
Relationships
Daily life
Emergencies
Education
General

Pick the most useful category for a learner.
Avoid "General" when a more specific category clearly fits.

STRICT mapping rules (use these first):
- If the phrase is about attraction, flirting, sex, arousal, dating, intimacy → Category MUST be "Relationships".
- If the phrase is swearing, insults, arguments, blunt confrontation → Category MUST be "Social".
- If the phrase is physical boundaries, safety, “don’t touch me”, threats → Category MUST be "Emergencies".
- If the phrase is feelings, realisations, emotional impact → Category MUST be "Emotions".
- If the phrase is business, work, jobs, office talk → Category MUST be "Work".

Only if none of these match, choose the closest category.
Use "General" ONLY if truly unclear.

Never invent new categories.

────────────────────────────────
USAGE RULES
────────────────────────────────
Usage must be 1–2 sentences:
- Describe WHEN a Lithuanian speaker would actually use this phrase.
- Describe realistic situations (not abstract).
- Avoid vague filler like “used in everyday conversation”.
- Do NOT add assumptions that aren't present (e.g., do not assume “towards a man/woman” unless the Lithuanian itself changes).

Do NOT explain grammar here.

────────────────────────────────
NOTES RULES (LEARNER-FOCUSED)
────────────────────────────────
Notes must be:
- Multi-line
- Clear spacing between ideas (blank lines between blocks)
- Plain, human British English
- No grammar terminology (no “genitive/dative/reflexive/etc.”)

Notes should focus on:
1) What the phrase is doing/expressing (meaning + tone)
2) What an English speaker might get wrong (common misconception)
3) Variants (see below) ONLY if useful and ONLY as real Lithuanian variants

────────────────────────────────
VARIANTS — STRICT FORMAT AND CONTENT
────────────────────────────────
Include variants ONLY when they help a learner avoid sounding rude/awkward AND the Lithuanian wording actually changes.

Allowed reasons to include variants:
- Formal/polite vs friendly (common greetings, requests, etc.)
- Male vs female form ONLY if the Lithuanian wording changes
- A common alternative wording used in the same situation (if truly useful)

IMPORTANT:
- The “Variants:” section may ONLY contain Lithuanian phrases.
- Do NOT put commentary inside Variants.
- If there are no useful variants, DO NOT include a Variants section.

Formatting rule (mandatory):
For every Lithuanian variant you include, put the phonetics on the NEXT LINE underneath it.

Example:

Variants:
- Formal / polite: Kaip Jūs?
  Phonetics: kai-p yoos
- Friendly (to one person): Kaip tu?
  Phonetics: kai-p too

If there are NO useful variants:
- Add one line in Notes: “No useful variants for this phrase.”

────────────────────────────────
ALTERNATIVE PHRASE (OPTIONAL)
────────────────────────────────
If there is a genuinely useful alternative phrase (different meaning/usage), include ONE alternative using this exact structure:

An alternative phrase is:

[Lithuanian phrase] — [natural English meaning]
[phonetics]

[blank line]

A short explanation (1–2 sentences) of how it differs in meaning or usage.

Only include an alternative if it adds real learning value.

────────────────────────────────
ABSOLUTE BANS
────────────────────────────────
- No placeholders
- No boilerplate tips
- No emojis
- No commentary outside JSON
- No re-translation
`.trim();

  const userMessage = `
LITHUANIAN (FINAL, DO NOT CHANGE):
${String(lt).trim()}

PHONETICS (FINAL, DO NOT CHANGE):
${String(phonetics).trim()}

ENGLISH MEANING (NATURAL, FINAL, DO NOT CHANGE):
${String(en_natural).trim()}

ENGLISH MEANING (LITERAL, FINAL, DO NOT CHANGE):
${String(en_literal).trim()}
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
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content;

    let payload;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      console.error("Bad JSON from OpenAI:", raw);
      return res.status(500).json({ error: "Bad JSON from OpenAI" });
    }

    const Category = String(payload?.Category || "").trim();
    const Usage = String(payload?.Usage || "").trim();
    const Notes = String(payload?.Notes || "").trim();

    if (!Category || !Usage || !Notes) {
      console.error("Incomplete enrich payload:", payload);
      return res.status(500).json({ error: "Incomplete enrichment" });
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich function error:", err);
    return res.status(500).json({ error: "Enrichment failed" });
  }
}

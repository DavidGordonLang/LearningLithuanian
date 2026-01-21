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

  // ---------------------------------------------------------------------------
  // SYSTEM PROMPT — ENRICH ONLY (ADDITIVE ONLY)
  // ---------------------------------------------------------------------------
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
CATEGORY RULES
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

Strong guidance:
- Attraction, flirting, sex, arousal, dating, intimacy → Relationships
- Swearing, arguments, blunt talk → Social (or Emotions if it’s primarily about feelings)
- Personal boundaries / safety / “don’t touch me” → Emergencies
- Feelings, realisations, emotional impact → Emotions
- Business, jobs, office talk → Work

Use "General" ONLY if none of the above clearly fits.
Never invent new categories.

────────────────────────────────
USAGE RULES
────────────────────────────────
Usage must be 1–2 sentences:
- Describe WHEN a Lithuanian speaker would actually use this phrase.
- Describe realistic situations (not abstract).
- Avoid vague filler like “used in everyday conversation”.

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
3) Variants (see below) when useful

────────────────────────────────
VARIANTS (FORMAL / FRIENDLY, MALE / FEMALE) — INCLUDE WHEN USEFUL
────────────────────────────────
If there is a clear, common variant that helps a learner avoid sounding rude/awkward, you MUST include it.

Examples where variants are usually useful:
- Common greetings / “How are you?” phrases → include a formal/polite option.
- Phrases that change with who you’re addressing (formal vs friendly).
- Phrases that change for male/female (only if the wording changes).

If included, format them as a “Variants:” section.

IMPORTANT FORMATTING RULE:
For every Lithuanian variant you include, you MUST put the phonetics on the NEXT LINE directly underneath it.

Example:

Variants:
- Formal / polite: Kaip Jūs?
  Phonetics: kai-p yoos
- Friendly (to one person): Kaip tu?
  Phonetics: kai-p too

Rules:
- Keep variants short and practical.
- Only include variants that actually change the Lithuanian wording.
- Do not add slang unless the source phrase is clearly slang/vulgar.

If there are NO useful variants:
- Say so explicitly in Notes (one line), e.g. “There are no polite variants of this phrase; it is always rude/vulgar.”

────────────────────────────────
ALTERNATIVE PHRASE (OPTIONAL, ONLY IF TRULY HELPFUL)
────────────────────────────────
If there is a genuinely useful alternative phrase (different meaning/usage), include ONE alternative using this exact structure:

An alternative phrase is:

[Lithuanian phrase] — [natural English meaning]
[phonetics]

[blank line]

A short explanation (1–2 sentences) of how it differs in meaning or usage.

IMPORTANT: The phonetics line MUST be directly underneath the Lithuanian phrase line.

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

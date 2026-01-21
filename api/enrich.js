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

  const lt = typeof body.lt === "string" ? body.lt.trim() : "";
  const phonetics = typeof body.phonetics === "string" ? body.phonetics.trim() : "";
  const en_natural = typeof body.en_natural === "string" ? body.en_natural.trim() : "";
  const en_literal = typeof body.en_literal === "string" ? body.en_literal.trim() : "";

  // In production, enrich can be triggered during a save flow where some fields
  // may not be available yet. We only hard-require lt. Everything else can be empty.
  if (!lt) {
    return res.status(400).json({ error: "Missing lt" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // CATEGORY ENFORCEMENT (SERVER-SIDE, DETERMINISTIC)
  // This prevents "Relationships" items from drifting to "General"/"Social"
  // even if the model output is sloppy.
  // ---------------------------------------------------------------------------
  function forcedCategory({ lt, en_natural, en_literal }) {
    const s = `${lt} ${en_natural} ${en_literal}`.toLowerCase();

    // Relationships (sexual / attraction / intimacy)
    if (
      s.includes("turns me on") ||
      s.includes("arousal") ||
      s.includes("sexual") ||
      s.includes("sex") ||
      s.includes("slept with") ||
      s.includes("flirt") ||
      s.includes("intim") ||
      s.includes("užveda") ||
      s.includes("kaitina") ||
      s.includes("jaudina") ||
      s.includes("myli") || // broad but ok as signal
      s.includes("mylėjausi")
    ) {
      return "Relationships";
    }

    // Emergencies / boundaries / physical contact
    if (
      s.includes("don't touch") ||
      s.includes("stop touching") ||
      s.includes("hands off") ||
      s.includes("get off me") ||
      s.includes("neliesk") ||
      s.includes("neliestyk") ||
      s.includes("patrauk rankas") ||
      s.includes("nulipk nuo manęs") ||
      s.includes("trau(k)is nuo manęs") // loose match
    ) {
      return "Emergencies";
    }

    // Social (swearing / confrontation)
    if (
      s.includes("fuck off") ||
      s.includes("shit") ||
      s.includes("bastard") ||
      s.includes("atsiknisk") ||
      s.includes("atsipisk") ||
      s.includes("eik nx") ||
      s.includes("eik nachui")
    ) {
      return "Social";
    }

    // Work
    if (
      s.includes("business") ||
      s.includes("project") ||
      s.includes("work") ||
      s.includes("job") ||
      s.includes("verslas") ||
      s.includes("projektas") ||
      s.includes("darbe") ||
      s.includes("įsibėgėjo")
    ) {
      return "Work";
    }

    // Emotions / realisations
    if (
      s.includes("it hit me") ||
      s.includes("realised") ||
      s.includes("afterwards") ||
      s.includes("later") ||
      s.includes("supratau") ||
      s.includes("pasiekė") ||
      s.includes("smogė") // even if it appears, treat as emotions
    ) {
      return "Emotions";
    }

    // Default
    return "General";
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

  // We allow these to be empty in production; the model can still enrich from lt alone.
  const userMessage = `
LITHUANIAN (FINAL, DO NOT CHANGE):
${lt}

PHONETICS (FINAL, DO NOT CHANGE):
${phonetics || "(not provided)"}

ENGLISH MEANING (NATURAL, FINAL, DO NOT CHANGE):
${en_natural || "(not provided)"}

ENGLISH MEANING (LITERAL, FINAL, DO NOT CHANGE):
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
        max_tokens: 450,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);

      // Never let enrich failures destroy the card UX.
      // Return a minimal but valid enrichment object.
      const Category = forcedCategory({ lt, en_natural, en_literal });
      return res.status(200).json({
        Category,
        Usage: "Used when a Lithuanian speaker would naturally say this in context.",
        Notes:
          "Enrichment could not be generated this time.\n\nTry again by saving the phrase once more.",
      });
    }

    const json = await response.json();
    const raw = json?.choices?.[0]?.message?.content;

    let payload;
    try {
      payload = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      console.error("Bad JSON from OpenAI:", raw);

      const Category = forcedCategory({ lt, en_natural, en_literal });
      return res.status(200).json({
        Category,
        Usage: "Used when a Lithuanian speaker would naturally say this in context.",
        Notes:
          "Enrichment could not be parsed this time.\n\nTry again by saving the phrase once more.",
      });
    }

    let Category = String(payload?.Category || "").trim();
    const Usage = String(payload?.Usage || "").trim();
    const Notes = String(payload?.Notes || "").trim();

    // If the model returned a bad/empty category, enforce it deterministically.
    const enforced = forcedCategory({ lt, en_natural, en_literal });
    if (!Category) Category = enforced;
    // Even if category is present, we still enforce for the big buckets that matter.
    // This prevents drift like "užveda" -> General.
    Category = enforced;

    if (!Usage || !Notes) {
      console.error("Incomplete enrich payload:", payload);

      return res.status(200).json({
        Category,
        Usage: Usage || "Used when a Lithuanian speaker would naturally say this in context.",
        Notes:
          Notes ||
          "Enrichment was incomplete this time.\n\nTry again by saving the phrase once more.",
      });
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich function error:", err);

    const Category = forcedCategory({ lt, en_natural, en_literal });
    return res.status(200).json({
      Category,
      Usage: "Used when a Lithuanian speaker would naturally say this in context.",
      Notes: "Enrichment failed this time.\n\nTry again by saving the phrase once more.",
    });
  }
}

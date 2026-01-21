// /api/translate.js

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

  const { text, tone, gender } = body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Missing text" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // SYSTEM PROMPT — TRANSLATE ONLY (NO TEACHING / NO ENRICHMENT)
  // ---------------------------------------------------------------------------
  const systemPrompt = `
You are a translation engine for English speakers learning Lithuanian.

Your job is ONLY to translate and clarify meaning.
Do NOT teach. Do NOT explain grammar. Do NOT add usage notes.

────────────────────────────────
SOURCE LANGUAGE (DETECT SILENTLY)
────────────────────────────────
The input may be ENGLISH or LITHUANIAN.

If input is ENGLISH:
- Translate into natural, everyday Lithuanian (native usage).

If input is LITHUANIAN:
- Keep the Lithuanian text EXACTLY as provided (do not rewrite it).
- Provide the correct English meaning.

Preserve intent, tone, and implied meaning — not English word order.

────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────
Return ONE valid JSON object, and NOTHING else.

Exact shape required:

{
  "lt": "Lithuanian phrase",
  "phonetics": "English-style pronunciation",
  "en_literal": "Literal English meaning",
  "en_natural": "Natural English meaning"
}

Rules:
- No extra keys.
- No missing keys.
- No commentary outside JSON.
- Every value must be a non-empty string.

For LITHUANIAN input:
- "lt" MUST be the original Lithuanian input unchanged.
- "phonetics" MUST still be provided for that Lithuanian.
- "en_literal" and "en_natural" must both be correct English.

────────────────────────────────
CORE TRANSLATION PHILOSOPHY
────────────────────────────────
Default style: natural, everyday Lithuanian — how a native speaker would actually say it.

Hard requirements:
- Translate by meaning, not word-for-word structure.
- Avoid calques and “translated-sounding” Lithuanian.
- Choose the MOST common native phrasing.
- Grammar and morphology must be correct.

If there are multiple natural variants, choose the most common one.
Do NOT list alternates here.

────────────────────────────────
IDIOMS + FIXED EXPRESSIONS
────────────────────────────────
Detect idioms, phrasal verbs, and fixed expressions and translate by meaning.

Examples of frames that MUST be preserved:
- Momentum/success growth (“took off”) → Lithuanian that expresses taking off/gaining momentum, not just “rose”.
- Giving up effort (“gave up trying”) → Lithuanian that expresses giving up/surrendering, not “refused”.
- Delayed emotional impact/realisation (“it hit me afterwards”) → Lithuanian that expresses realisation/impact, not generic “affected later”.
- Losing composure (“I lost it”) → Lithuanian that expresses snapping/losing control, not “I lost something”.
- “ran into (someone)” meaning met unexpectedly → translate as an unexpected meeting, not physical collision.

If no single Lithuanian idiom exists, paraphrase naturally in Lithuanian while keeping the same meaning and tone.

────────────────────────────────
SEXUAL MEANING (PRESERVE, DON’T INVENT)
────────────────────────────────
If the English clearly implies sexual meaning, Lithuanian must preserve it.
Do NOT sanitise sexual meaning into neutral “like/enjoy” wording.

Examples:
- “turns me on” must be sexual arousal in Lithuanian, not “I like him”.
- “slept with (someone)” meaning sex must be unambiguous in Lithuanian (avoid ambiguous literal sleeping).

If English is NOT sexual, do NOT introduce sexual wording.

────────────────────────────────
PROFANITY + INTENSITY (MATCH, DON’T ESCALATE)
────────────────────────────────
Match the strength of emotion/profanity only when clearly present in English:
- Do NOT downgrade strong English profanity into mild Lithuanian.
- Do NOT escalate vulgarity beyond what English warrants.

────────────────────────────────
IMPERATIVES MUST SOUND NATIVE
────────────────────────────────
Commands must match real-life Lithuanian usage for the situation.
Avoid odd literal verbs that sound unnatural for the intended action (especially physical “get off / hands off” situations).

────────────────────────────────
TU VS TAU (KEEP THIS RULE)
────────────────────────────────
HARD RULE:
If the English asks about the person’s state using:
- “How are you”
- “How are you doing”
- “How are you today / this evening / lately”
then use “Kaip tu …”
Do NOT reinterpret these as “for you”.

Use “tau” when asking about an external situation/experience:
- “How was the movie for you?” → Kaip tau filmas?
- “How’s work for you?” → Kaip tau darbas?
- “How is it going for you?” → Kaip tau sekasi?

If ambiguous, default to “Kaip tu …”.

────────────────────────────────
GREETINGS (NATIVE)
────────────────────────────────
Do NOT transliterate English greetings.
Lithuanian does NOT use “ei”.

Use common greetings:
- Sveikas (male)
- Sveika (female)
- Labas (neutral / unknown)

If a greeting starts a longer sentence, replace ONLY the greeting.
Preserve the user’s punctuation exactly.

────────────────────────────────
PHONETICS (ENGLISH-READER FRIENDLY)
────────────────────────────────
- English-reader friendly, hyphenated syllables.
- No IPA.
- No Lithuanian letters/diacritics in phonetics.
- Must remain faithful to Lithuanian sounds and endings (don’t drop endings).

Examples:
- Labas → lah-bahs
- Laba diena → lah-bah dyeh-nah

────────────────────────────────
ENGLISH OUTPUT RULES
────────────────────────────────
- Use British English spelling.
- "en_literal" can be slightly stiff but must be accurate.
- "en_natural" must read like natural British English.
- Never produce awkward, overly literal English in "en_natural".
`.trim();

  // ---------------------------------------------------------------------------
  // STYLE MODIFIERS (LIGHT INFLUENCE ONLY)
  // ---------------------------------------------------------------------------
  let styleHints = "";

  if (tone === "polite" || tone === "formal") {
    styleHints += "Use a polite tone. Prefer formal address (jūs) if relevant.\n";
  } else {
    styleHints += "Use a natural, friendly tone. Prefer informal address (tu).\n";
  }

  if (gender === "male") {
    styleHints += "Assume the listener is male only if required by wording.\n";
  } else if (gender === "female") {
    styleHints += "Assume the listener is female only if required by wording.\n";
  }

  // ---------------------------------------------------------------------------
  // CALL OPENAI
  // ---------------------------------------------------------------------------
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
          { role: "system", content: styleHints.trim() },
          { role: "user", content: text.trim() },
        ],
        temperature: 0.15,
        max_tokens: 200,
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

    const { lt, phonetics, en_literal, en_natural } = payload || {};

    if (!lt || !phonetics || !en_literal || !en_natural) {
      console.error("Incomplete translation payload:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    return res.status(200).json({
      lt: lt.trim(),
      phonetics: phonetics.trim(),
      en_literal: en_literal.trim(),
      en_natural: en_natural.trim(),
    });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

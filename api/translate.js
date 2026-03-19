// /api/translate.js
//
// Translation endpoint (EN <-> LT) used by the Home view.
// IMPORTANT: We keep the existing translation system prompt intact to avoid translation drift.
// IPA is now generated in the SAME call as translation (merged into the JSON schema).
// This halves latency vs. the previous two-call sequential approach.
//
// Returns (client contract):
//  - lt
//  - phonetics (English-style)
//  - phonetics_ipa (IPA)
//  - en_literal
//  - en_natural

async function readJsonBody(req) {
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  return body || {};
}

async function callOpenAIChat({
  apiKey,
  messages,
  response_format,
  temperature,
  max_tokens,
}) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      response_format,
      messages,
      temperature,
      max_tokens,
    }),
  });

  return resp;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = await readJsonBody(req);
  const { text, tone, gender, speakerGender } = body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Missing text" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // SYSTEM PROMPT — TRANSLATE ONLY (NO TEACHING / NO ENRICHMENT)
  // NOTE: This is intentionally preserved verbatim to prevent drift.
  // IPA has been added as a fifth output key — this does not affect translation
  // behaviour, only adds an additional output field.
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
  "phonetics": "English-style pronunciation (hyphenated syllables)",
  "phonetics_ipa": "IPA transcription of the Lithuanian phrase",
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
- "phonetics" and "phonetics_ipa" MUST still be provided for that Lithuanian.
- "en_literal" and "en_natural" must both be correct English.

────────────────────────────────
PHONETICS (ENGLISH-READER FRIENDLY)
────────────────────────────────
phonetics:
- English-reader friendly, hyphenated syllables.
- No IPA.
- No Lithuanian letters/diacritics in phonetics.
- Must remain faithful to Lithuanian sounds and endings (don't drop endings).

Examples:
- Labas → lah-bahs
- Laba diena → lah-bah dyeh-nah

────────────────────────────────
PHONETICS_IPA (STANDARD IPA)
────────────────────────────────
phonetics_ipa:
- Standard IPA symbols only.
- No slashes / /. No brackets [ ].
- Include spaces between words as in the original phrase.
- Must be a non-empty string.

────────────────────────────────
ENGLISH OUTPUT RULES
────────────────────────────────
- Use British English spelling.
- "en_literal" can be slightly stiff but must be accurate.
- "en_natural" must read like natural British English.
- Never produce awkward, overly literal English in "en_natural".
`.trim();

  // ---------------------------------------------------------------------------
  // STYLE MODIFIERS
  // ---------------------------------------------------------------------------
  let styleHints = "";

  // Tone — controls formality and tu vs jūs
  if (tone === "polite") {
    styleHints += "Use a polite tone. Prefer formal address (jūs) when addressing the listener.\n";
  } else {
    styleHints += "Use a natural, friendly tone. Prefer informal address (tu) when addressing the listener.\n";
  }

  // Addressee — who is being spoken to
  if (gender === "group") {
    styleHints += "The speaker is addressing a group of people. Use plural jūs forms regardless of tone. Use masculine plural agreement as the default for mixed groups.\n";
  } else if (gender === "female") {
    styleHints += "The person being spoken to is female. Use feminine agreement forms where relevant.\n";
  } else if (gender === "male") {
    styleHints += "The person being spoken to is male. Use masculine agreement forms where relevant.\n";
  }

  // Speaker gender — affects self-referential forms
  if (speakerGender === "female") {
    styleHints += "The speaker is female. When the phrase describes the speaker's own state, feelings, or identity, use feminine Lithuanian endings (e.g. alkana, pavargusi, laiminga).\n";
  } else {
    styleHints += "The speaker is male. When the phrase describes the speaker's own state, feelings, or identity, use masculine Lithuanian endings (e.g. alkanas, pavargęs, laimingas).\n";
  }

  // ---------------------------------------------------------------------------
  // CALL OPENAI (TRANSLATION + IPA — SINGLE CALL)
  // ---------------------------------------------------------------------------
  try {
    const response = await callOpenAIChat({
      apiKey,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: styleHints.trim() },
        { role: "user", content: String(text).trim() },
      ],
      temperature: 0.15,
      max_tokens: 280,
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

    const lt = String(payload?.lt || "").trim();
    const phonetics = String(payload?.phonetics || "").trim();
    const phoneticsIpa = String(payload?.phonetics_ipa || "").trim();
    const enLiteral = String(payload?.en_literal || "").trim();
    const enNatural = String(payload?.en_natural || "").trim();

    if (!lt || !phonetics || !enLiteral || !enNatural) {
      console.error("Incomplete translation payload:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    // phoneticsIpa is best-effort — not included in the completeness check
    // so a missing or empty IPA never causes the whole translation to fail.

    return res.status(200).json({
      lt,
      phonetics,
      phonetics_ipa: phoneticsIpa,
      en_literal: enLiteral,
      en_natural: enNatural,
    });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

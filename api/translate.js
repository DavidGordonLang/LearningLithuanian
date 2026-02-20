// /api/translate.js
//
// Translation endpoint (EN <-> LT) used by the Home view.
// IMPORTANT: We keep the existing translation system prompt intact to avoid translation drift.
// We generate IPA via a SECOND small call, so the core translator behaviour stays stable.
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
  const { text, tone, gender } = body;

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
PHONETICS (ENGLISH-READER FRIENDLY)
────────────────────────────────
phonetics:
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
  // IPA PROMPT (SECOND CALL — DOES NOT TOUCH THE TRANSLATION PROMPT)
  // ---------------------------------------------------------------------------
  const ipaPrompt = `
You are generating Lithuanian IPA for learners.

Return ONE valid JSON object and NOTHING else:
{ "ipa": "<IPA for the exact Lithuanian input>" }

Rules:
- The input will be Lithuanian. Do NOT translate. Do NOT rewrite.
- Output ONLY IPA symbols (no slashes / /, no brackets [ ]).
- Keep the whole phrase (include spaces between words).
- No extra keys. No commentary.
- The value must be a non-empty string.
`.trim();

  // ---------------------------------------------------------------------------
  // CALL OPENAI (TRANSLATION)
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
      max_tokens: 200,
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
    const enLiteral = String(payload?.en_literal || "").trim();
    const enNatural = String(payload?.en_natural || "").trim();

    if (!lt || !phonetics || !enLiteral || !enNatural) {
      console.error("Incomplete translation payload:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    // -----------------------------------------------------------------------
    // CALL OPENAI (IPA) — best-effort, with fallback
    // -----------------------------------------------------------------------
    let phoneticsIpa = "";
    try {
      const ipaResp = await callOpenAIChat({
        apiKey,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: ipaPrompt },
          { role: "user", content: lt },
        ],
        temperature: 0,
        max_tokens: 120,
      });

      if (ipaResp.ok) {
        const ipaJson = await ipaResp.json();
        const ipaRaw = ipaJson?.choices?.[0]?.message?.content;

        let ipaPayload;
        try {
          ipaPayload = typeof ipaRaw === "string" ? JSON.parse(ipaRaw) : ipaRaw;
        } catch {
          ipaPayload = null;
        }

        phoneticsIpa = String(ipaPayload?.ipa || "").trim();
      } else {
        const errText = await ipaResp.text();
        console.warn("IPA OpenAI API error:", ipaResp.status, errText);
      }
    } catch (e) {
      console.warn("IPA generation failed:", e);
    }

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
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
  // SYSTEM PROMPT — TRANSLATE ONLY (NO TEACHING)
  // ---------------------------------------------------------------------------
  const systemPrompt = `
You are a translation assistant for English speakers learning Lithuanian.

Your task is ONLY to translate and clarify meaning.
Do NOT teach. Do NOT explain grammar.

────────────────────────────────
SOURCE LANGUAGE
────────────────────────────────
The input may be ENGLISH or LITHUANIAN.
Detect the source language silently.

• If input is ENGLISH:
  - Translate it into natural Lithuanian.

• If input is LITHUANIAN:
  - Keep the Lithuanian as-is.
  - Provide the correct English meaning.

Preserve INTENT, not word-for-word structure.

────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────
You MUST return a SINGLE valid JSON object in this exact shape:

{
  "lt": "Lithuanian phrase",
  "phonetics": "English-style pronunciation",
  "en_literal": "Literal English meaning",
  "en_natural": "Natural English meaning"
}

No extra keys.
No missing keys.
No text outside JSON.

────────────────────────────────
LITHUANIAN RULES
────────────────────────────────
• Always choose the most common, natural phrasing.
• Never translate word-for-word if Lithuanians would not say it that way.
• Validate grammar before outputting.

CRITICAL FIX:
• For “How are you” structures, you MUST use:
  - "Kaip tau ...?"
• NEVER produce incorrect forms like:
  - "Kaip tu ...?"

────────────────────────────────
GREETINGS
────────────────────────────────
• Never transliterate English greetings.
• Lithuanian does NOT use “ei”.
• Use:
  - Sveikas (male)
  - Sveika (female)
  - Labas (neutral / unknown)
• Preserve the user’s punctuation exactly.
• If greeting starts a longer sentence, replace ONLY the greeting.

────────────────────────────────
PHONETICS RULES
────────────────────────────────
• English-reader friendly
• Hyphenated syllables
• No IPA
• No Lithuanian letters
• Examples:
  - Labas → lah-bahs
  - Laba diena → lah-bah dyeh-nah

────────────────────────────────
ENGLISH RULES
────────────────────────────────
• British English
• Fix spelling and grammar silently
• Never be awkward or overly literal
`.trim();

  // ---------------------------------------------------------------------------
  // STYLE MODIFIERS (light influence only)
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

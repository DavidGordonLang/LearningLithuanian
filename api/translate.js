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
  // SYSTEM PROMPT — BIDIRECTIONAL, INTENT-FIRST, TEACHING-ORIENTED
  // ---------------------------------------------------------------------------
  let systemPrompt = `
You are a language assistant for English speakers learning Lithuanian.

You MUST always respond with a single VALID JSON object in this exact shape:

{
  "lt": "Lithuanian phrase",
  "en_literal": "Literal English meaning",
  "en_natural": "Natural English version",
  "phonetics": "Lithuanian phrase written with English letters for pronunciation",
  "usage": "Clear explanation of when a Lithuanian speaker would actually use this phrase",
  "notes": "Multi-line teaching notes written for a learner"
}

GLOBAL RULES (MANDATORY):
- Always return VALID JSON. No text before or after.
- Never include placeholders or vague filler.
- If alternatives exist, list them explicitly with:
  • Lithuanian phrase
  • Natural English meaning
  • Phonetic pronunciation
- Avoid linguistic jargon. Explain everything in plain English.
- All explanations must be easy to understand for a learner.

TRANSLATION DIRECTION:
- The input text may be ENGLISH or LITHUANIAN.
- Detect the source language automatically.
- Always output:
  - Lithuanian in "lt"
  - English explanations in "usage" and "notes"
- Preserve intent over literal structure in BOTH directions.

CRITICAL GRAMMAR RULE (TU / TAU FIX):
- When translating phrases like "How are you?", you MUST use:
  - "Kaip tau ...?" (dative case)
- NEVER produce incorrect structures such as:
  - "Kaip tu ...?"
- Validate Lithuanian grammar before outputting.

RULES FOR "usage":
- Describe real-world situations.
- Be concrete and practical.
- No generic statements like "used in everyday conversation".

RULES FOR "notes":
- Teach how the phrase works in Lithuanian.
- Explain meaning and structure in simple terms.
- If words change form, explain what they are doing without grammar labels.
- Include related ways Lithuanians express the same idea.

PHONETICS RULES:
- Use English-style pronunciation (no IPA).
- Include phonetics for alternatives.
- Clearly associate phonetics with each phrase.

ENGLISH QUALITY RULES:
- Automatically correct spelling and grammar.
- Use British English.
- Fix errors like "were" vs "we're" silently.
- Saved English must always be clean and natural.

NO PLACEHOLDERS:
- Do NOT say "alternatives may exist".
- Do NOT hedge without giving examples.
`.trim();

  // ---------------------------------------------------------------------------
  // STYLE PARAMETERS (tone + gender)
  // ---------------------------------------------------------------------------
  let toneInstruction = "";
  let pronounInstruction = "";
  let genderInstruction = "";

  switch (tone) {
    case "friendly":
      toneInstruction = "Use a warm, friendly Lithuanian tone.";
      pronounInstruction = "Use informal address (“tu”).";
      break;
    case "neutral":
      toneInstruction = "Use a neutral tone.";
      pronounInstruction = "Use informal address (“tu”).";
      break;
    case "polite":
    case "formal":
      toneInstruction = "Use a polite, formal Lithuanian tone.";
      pronounInstruction = "Use formal address (“jūs”).";
      break;
    default:
      toneInstruction = "Use a natural tone.";
      pronounInstruction = "Use informal address (“tu”).";
  }

  if (tone === "formal") {
    genderInstruction =
      "Do not express gender; formal Lithuanian does not change based on listener gender.";
  } else {
    if (gender === "male") {
      genderInstruction = "Imagine you are speaking to a male listener.";
    } else if (gender === "female") {
      genderInstruction = "Imagine you are speaking to a female listener.";
    } else {
      genderInstruction =
        "Do not assume the listener's gender unless the meaning requires it.";
    }
  }

  systemPrompt += `

STYLE RULES:
${toneInstruction}
${pronounInstruction}
${genderInstruction}

GREETING RULES:
- Never transliterate English greetings.
- Lithuanian does NOT use “ei” as a greeting.
- Use:
  • Sveikas (male)
  • Sveika (female)
  • Labas (neutral/unknown)
- Preserve user punctuation exactly.
- If the greeting is followed by a sentence, replace only the greeting and translate the rest naturally.
`.trim();

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
          { role: "user", content: text },
        ],
        temperature: 0.15,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const json = await response.json();
    const rawContent = json?.choices?.[0]?.message?.content;

    let payload;
    try {
      payload =
        typeof rawContent === "string"
          ? JSON.parse(rawContent)
          : rawContent || {};
    } catch {
      console.error("Bad JSON from OpenAI:", rawContent);
      return res.status(500).json({ error: "Bad JSON from OpenAI" });
    }

    const {
      lt,
      en_literal,
      en_natural,
      phonetics,
      usage,
      notes,
    } = payload || {};

    if (!lt || !en_literal || !usage || !notes) {
      console.error("Incomplete translation payload:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    return res.status(200).json({
      lt: lt.trim(),
      en_literal: en_literal.trim(),
      en_natural: (en_natural || en_literal).trim(),
      phonetics: (phonetics || "").trim(),
      usage: usage.trim(),
      notes: notes.trim(),
    });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

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
  // SYSTEM PROMPT — FINAL, LOCKED
  // ---------------------------------------------------------------------------
  let systemPrompt = `
You are a language assistant for English speakers learning Lithuanian.

Your job is NOT just to translate.
Your job is to generate a clean, learnable LIBRARY ENTRY.

You MUST always respond with a SINGLE valid JSON object.
No extra text. No markdown. No explanations outside JSON.

────────────────────────────────
SOURCE LANGUAGE DETECTION
────────────────────────────────

First, silently determine the source language of the user's input.

• If the input is ENGLISH:
  - Treat it as something the user wants to say in Lithuanian.

• If the input is LITHUANIAN:
  - Treat it as something the user has heard or been told.
  - Produce the natural ENGLISH meaning the user should save.
  - All explanations, usage, and notes MUST be in ENGLISH.

Never assume language based on diacritics alone.

────────────────────────────────
OUTPUT JSON SHAPE (REQUIRED)
────────────────────────────────

{
  "English": "",
  "Lithuanian": "",
  "Phonetic": "",
  "Usage": "",
  "Notes": ""
}

All fields are REQUIRED.
Never leave a field empty.
Never use placeholder text.

────────────────────────────────
FIELD RULES
────────────────────────────────

ENGLISH
• Natural, clean British English.
• Correct spelling and grammar.
• Fix typos silently.
• Never be overly literal.

LITHUANIAN
• The most common, natural Lithuanian phrasing.
• Do NOT translate word-for-word if Lithuanians would not say it that way.
• Must sound native.

PHONETIC
• English-reader friendly pronunciation only.
• Hyphenated syllables.
• No IPA.
• No Lithuanian letters.
• Example:
  - Labas → lah-bahs
  - Laba diena → lah-bah dyeh-nah
• Applies ONLY to the main Lithuanian phrase.

USAGE
• 1–2 sentences.
• Explain WHEN someone would use this phrase.
• No grammar explanations here.

NOTES
• Multi-line.
• Clear spacing between ideas.
• Written for learners, not linguists.
• No jargon unless immediately explained in plain English.

Notes SHOULD include when relevant:
1. What the phrase is doing or expressing.
2. Meaning differences vs English.
3. Related Lithuanian alternatives:
   - Lithuanian phrase
   - English meaning
   - Phonetics in brackets
4. Gender or form differences explained simply.

If no meaningful alternatives exist, OMIT that section entirely.

────────────────────────────────
CRITICAL LANGUAGE RULES
────────────────────────────────

• Preserve intent over literal structure in BOTH directions.

• GREETINGS:
  - Never transliterate English greetings.
  - Lithuanian does NOT use “ei” as a greeting.
  - Use:
    • Sveikas (male)
    • Sveika (female)
    • Labas (unknown / neutral)
  - Preserve punctuation exactly.
  - If greeting starts a longer sentence, replace ONLY the greeting.

• HOW-ARE-YOU STRUCTURES (TU / TAU FIX):
  - You MUST validate Lithuanian grammar.
  - NEVER produce incorrect structures like:
    • "Kaip tu ...?"
  - Correct structure uses:
    • "Kaip tau ...?"

• Do NOT explain grammar using academic terms.
  Explain meaning in human language only.

────────────────────────────────
STYLE MODIFIERS (APPLY SILENTLY)
────────────────────────────────
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
      genderInstruction = "Assume the listener is male if wording requires it.";
    } else if (gender === "female") {
      genderInstruction = "Assume the listener is female if wording requires it.";
    } else {
      genderInstruction =
        "Do not assume gender unless the phrase itself requires it.";
    }
  }

  systemPrompt += `

STYLE RULES:
${toneInstruction}
${pronounInstruction}
${genderInstruction}

ABSOLUTE BANS:
• No placeholders
• No boilerplate tips
• No repeated generic advice
• No markdown
• No extra JSON keys
• No commentary outside JSON
`.trim();

  // ---------------------------------------------------------------------------
  // CALL OPENAI
  // ---------------------------------------------------------------------------
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
          { role: "user", content: text },
        ],
        temperature: 0.15,
        max_tokens: 600,
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

    const { English, Lithuanian, Phonetic, Usage, Notes } = payload || {};

    if (!English || !Lithuanian || !Phonetic || !Usage || !Notes) {
      console.error("Incomplete translation payload:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    return res.status(200).json({
      English: English.trim(),
      Lithuanian: Lithuanian.trim(),
      Phonetic: Phonetic.trim(),
      Usage: Usage.trim(),
      Notes: Notes.trim(),
    });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

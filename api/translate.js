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

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // SYSTEM PROMPT — EN → LT ONLY (DIRECTION REMOVED)
  // ---------------------------------------------------------------------------
  let systemPrompt = `
You are a translation assistant for English speakers learning Lithuanian.

You MUST always respond with a single JSON object in this shape:

{
  "lt": "Lithuanian phrase",
  "en_literal": "Literal English meaning",
  "en_natural": "Natural English version",
  "phonetics": "Lithuanian phrase written with English letters for pronunciation"
}

Rules:
- Always return VALID JSON. No extra text before or after.
- "lt": the natural, grammatically correct Lithuanian phrase.
- "en_literal": a literal English meaning of the Lithuanian phrase.
- "en_natural": a more natural English version (may be identical).
- "phonetics": Lithuanian written roughly in English-style pronunciation (no IPA).
- No chit-chat. No explanations. No markdown. Only JSON.
- Keep the translation short and natural unless Lithuanian grammar requires more words.
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
        "Do not assume the listener's gender unless the English text clearly implies it.";
    }
  }

  systemPrompt += `

The user will provide ENGLISH text. You must:
- Translate it into Lithuanian using the rules above.
- Apply these style rules:

${toneInstruction}
${pronounInstruction}
${genderInstruction}

- Put the Lithuanian result into "lt".
- Put the literal English meaning into "en_literal".
- Put the natural English version into "en_natural".
- Generate "phonetics" for the Lithuanian phrase.
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
        temperature: 0.2,
        max_tokens: 200,
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
    } catch (e) {
      console.error("Failed to parse JSON content from OpenAI:", rawContent);
      return res.status(500).json({ error: "Bad JSON from OpenAI" });
    }

    const lt = (payload.lt || "").trim();
    const en_literal = (payload.en_literal || "").trim();
    const en_natural = (payload.en_natural || "").trim();
    const phonetics = (payload.phonetics || "").trim();

    if (!lt || !en_literal) {
      console.error("Missing fields in OpenAI JSON:", payload);
      return res.status(500).json({ error: "Incomplete translation" });
    }

    return res.status(200).json({
      lt,
      en_literal,
      en_natural: en_natural || en_literal,
      phonetics,
    });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

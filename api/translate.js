// /api/translate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel sometimes passes body as string
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const { text, direction, tone, gender } = body;

  if (!text || !direction) {
    return res.status(400).json({ error: "Missing text or direction" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // -------------------------------
  // Build system prompt
  // -------------------------------
  let systemPrompt = `
You are a translation assistant for learners of Lithuanian and English.

You MUST always respond with a single JSON object in this shape:

{
  "lt": "Lithuanian phrase",
  "en_literal": "Literal English meaning",
  "en_natural": "Natural English version",
  "phonetics": "Lithuanian phrase written with English letters for pronunciation"
}

Rules:
- Always return VALID JSON. No extra text.
- "lt": the natural, grammatically correct Lithuanian phrase.
- "en_literal": as close as possible literal English meaning of the Lithuanian phrase.
- "en_natural": a natural English version that could be used in conversation. It may be identical to "en_literal" if the phrase is simple.
- "phonetics": the Lithuanian phrase written using simple English syllables (no IPA), so an English speaker can approximate pronunciation.
- Do NOT add extra sentences, greetings, or explanations.
- Do NOT change the meaning or add information that is not in the user's text.
- Keep the translation roughly as short as the source text, except where Lithuanian grammar strictly requires extra words.
`.trim();

  if (direction === "EN2LT") {
    // English → Lithuanian: apply tone + gender
    let toneInstruction = "";
    let pronounInstruction = "";
    let genderInstruction = "";

    switch (tone) {
      case "friendly":
        toneInstruction = "Use a warm, friendly tone.";
        pronounInstruction = "Use informal address (“tu”).";
        break;
      case "neutral":
        toneInstruction = "Use a neutral, clear tone.";
        pronounInstruction = "Use informal address (“tu”).";
        break;
      case "formal":
        toneInstruction = "Use a polite, respectful tone.";
        pronounInstruction = "Use formal address (“jūs”).";
        break;
      default:
        toneInstruction = "Use a natural tone.";
        pronounInstruction = "Use informal address (“tu”).";
    }

    if (tone !== "formal") {
      if (gender === "male") {
        genderInstruction = "Imagine you are speaking to a male listener.";
      } else if (gender === "female") {
        genderInstruction = "Imagine you are speaking to a female listener.";
      } else {
        genderInstruction =
          "Do not assume the listener's gender unless the English text clearly implies it.";
      }
    } else {
      genderInstruction =
        "Do not express gender; formal Lithuanian does not change based on listener gender.";
    }

    systemPrompt += `

The user will provide ENGLISH text. You must:
- Translate it into Lithuanian according to the rules above.
- Apply these style rules:

${toneInstruction}
${pronounInstruction}
${genderInstruction}

- Put the Lithuanian result into "lt".
- Put the English meaning into "en_literal" and "en_natural" (fixing any mistakes in the original English).
- Generate "phonetics" for the Lithuanian phrase.
`.trim();
  } else {
    // LT2EN
    systemPrompt += `

The user will provide LITHUANIAN text. You must:
- Treat the user's Lithuanian as the base phrase.
- If needed, correct minor errors and place the corrected Lithuanian into "lt".
- Translate that Lithuanian into English and place the literal version in "en_literal".
- Place a more natural English version in "en_natural".
- Generate "phonetics" for the Lithuanian phrase.
- Ignore tone and gender settings; they do not apply when translating TO English.
`.trim();
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
      }
    );

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

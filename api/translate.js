// /api/translate.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, direction, tone, gender } = req.body || {};

  if (!text || !direction) {
    return res.status(400).json({ error: "Missing text or direction" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    //
    // SYSTEM PROMPT BUILDING
    //
    let systemPrompt = "";

    if (direction === "EN2LT") {
      // ------------------------------------------------------------
      //  ENGLISH → LITHUANIAN
      // ------------------------------------------------------------

      let toneInstruction = "";
      let pronounInstruction = "";
      let genderInstruction = "";

      // TONE → controls style + pronoun set
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

      // GENDER → only applies to informal form
      if (tone !== "formal") {
        if (gender === "male") {
          genderInstruction = "Speak as if addressing a male listener.";
        } else if (gender === "female") {
          genderInstruction = "Speak as if addressing a female listener.";
        } else {
          genderInstruction =
            "Do not assume the listener’s gender unless the source text implies it.";
        }
      } else {
        // formal → gender is irrelevant
        genderInstruction =
          "Do not express gender; formal Lithuanian does not change based on listener gender.";
      }

      systemPrompt = `
You are a Lithuanian language assistant.

Translate the user's English text into **natural, correct Lithuanian**.
Preserve meaning and tone exactly.

${toneInstruction}
${pronounInstruction}
${genderInstruction}

Always produce phrasing that a native Lithuanian speaker would naturally use.
`.trim();
    } else {
      // ------------------------------------------------------------
      //  LITHUANIAN → ENGLISH
      // ------------------------------------------------------------
      systemPrompt = `
Translate the user's Lithuanian text into natural, clear English.

Ignore tone and gender settings — they do not apply when translating to English.

Preserve meaning. Avoid unnecessary embellishment.
`.trim();
    }

    //
    // MAKE THE REQUEST
    //
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.2,
      max_tokens: 150,
    });

    const translated = completion.choices[0].message.content.trim();

    return res.status(200).json({ translated });
  } catch (err) {
    console.error("Translation API error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}
// /api/translate.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Vercel sometimes gives body as string; be defensive
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
  let systemPrompt;

  if (direction === "EN2LT") {
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
        genderInstruction = "Speak as if addressing a male listener.";
      } else if (gender === "female") {
        genderInstruction = "Speak as if addressing a female listener.";
      } else {
        genderInstruction =
          "Do not assume the listener’s gender unless the source text implies it.";
      }
    } else {
      genderInstruction =
        "Do not express gender; formal Lithuanian does not change based on listener gender.";
    }

    systemPrompt = `
You are a Lithuanian language assistant.

Translate the user's English text into natural, correct Lithuanian.
Preserve meaning and intent.

${toneInstruction}
${pronounInstruction}
${genderInstruction}

Always produce phrasing that a native Lithuanian speaker would naturally say.
`.trim();
  } else {
    systemPrompt = `
Translate the user's Lithuanian text into natural, clear English.
Ignore tone and gender settings; they do not apply to English.
Preserve meaning without unnecessary embellishment.
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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.2,
          max_tokens: 150,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const json = await response.json();
    const translated =
      json.choices?.[0]?.message?.content?.trim() || "";

    if (!translated) {
      console.error("No translated text in OpenAI response:", json);
      return res.status(500).json({ error: "No translation returned" });
    }

    return res.status(200).json({ translated });
  } catch (err) {
    console.error("Translation function error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}
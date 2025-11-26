// /api/translate.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, direction } = req.body || {};

  if (!text || !direction) {
    return res.status(400).json({ error: "Missing text or direction" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      direction === "EN2LT"
        ? "Translate the user's English text into natural, correct Lithuanian. Keep meaning accurate and tone appropriate."
        : "Translate the user's Lithuanian text into clear, natural English. Preserve tone and meaning.";

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: text }
      ],
      max_tokens: 120,
      temperature: 0.2
    });

    const translated = response.choices[0].message.content.trim();

    return res.status(200).json({ translated });
  } catch (err) {
    console.error("Translation error:", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}

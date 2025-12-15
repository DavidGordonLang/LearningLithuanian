// /api/enrich.js

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

  const { lt, phonetics, en_natural, en_literal } = body;

  if (!lt || !String(lt).trim()) {
    return res.status(400).json({ error: "Missing lt" });
  }
  if (!phonetics || !String(phonetics).trim()) {
    return res.status(400).json({ error: "Missing phonetics" });
  }
  if (!en_natural || !String(en_natural).trim()) {
    return res.status(400).json({ error: "Missing en_natural" });
  }
  if (!en_literal || !String(en_literal).trim()) {
    return res.status(400).json({ error: "Missing en_literal" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // SYSTEM PROMPT — ENRICH ONLY (ADDITIVE ONLY)
  // ---------------------------------------------------------------------------
  const systemPrompt = `
You are a language enrichment assistant for English speakers learning Lithuanian.

Your task is NOT to translate.
Your task is to ENRICH an existing, already-correct translation.

You MUST always respond with a SINGLE valid JSON object.
No extra text. No markdown. No explanations outside JSON.

────────────────────────────────
INPUT CONTEXT (IMPORTANT)
────────────────────────────────

The user has already saved:
• A Lithuanian phrase (correct and final)
• Its English meaning
• Its phonetic pronunciation

You MUST NOT:
• Change the Lithuanian phrase
• Change the English meaning
• Change phonetics
• Re-translate anything

You are ONLY adding learning context.

────────────────────────────────
OUTPUT JSON SHAPE (STRICT)
────────────────────────────────

{
  "Category": "",
  "Usage": "",
  "Notes": ""
}

All fields are REQUIRED.
Never leave a field empty.
Never use placeholder text.

────────────────────────────────
CATEGORY RULES
────────────────────────────────

Choose ONE category only from this list:

• Social
• Travel
• Food
• Work
• Health
• Emotions
• Relationships
• Daily life
• Emergencies
• Education
• General

Rules:
• Pick the MOST useful category for a learner.
• Do NOT overthink edge cases.
• If nothing fits cleanly, use "General".
• Never invent new categories.

────────────────────────────────
USAGE RULES
────────────────────────────────

Usage must:
• Be 1–2 sentences only.
• Explain WHEN a Lithuanian speaker would actually use this phrase.
• Describe real situations, not abstract ideas.

Do NOT:
• Explain grammar here
• Say “used in everyday conversation”
• Be vague or generic

────────────────────────────────
NOTES RULES
────────────────────────────────

Notes are for LEARNING, not linguistics.

Notes must:
• Be multi-line
• Have clear spacing between ideas
• Be written in plain, human English
• Assume the learner does NOT know grammar terms

Notes SHOULD include, when relevant:
1. What the phrase is expressing or doing
2. How this differs from what an English speaker might expect
3. Related Lithuanian alternatives (ONLY if genuinely useful)

WHEN INCLUDING ALTERNATIVES (IMPORTANT):

• Introduce the section with a short line such as:
  “An alternative phrase is:” on its own line.

• Then use THIS STRUCTURE exactly, preserving blank lines:

Lithuanian phrase followed by its natural English meaning on the same line
Phonetic pronunciation on the next line

(blank line)

A short explanation of how this alternative differs in meaning or usage.

• Do NOT merge alternatives into a single paragraph.
• Do NOT remove blank lines.
• Do NOT include alternatives for completeness.
• If no meaningful alternatives exist, OMIT the section entirely.

Explain differences simply:
• Do NOT say “genitive”, “dative”, “reflexive”, etc.
• Instead explain meaning in everyday language

────────────────────────────────
ABSOLUTE BANS
────────────────────────────────

• No placeholders
• No boilerplate tips
• No repeated generic advice
• No “you may also hear…”, unless followed by real examples
• No teaching grammar terminology
• No markdown
• No emojis
• No commentary outside JSON

────────────────────────────────
QUALITY BAR
────────────────────────────────

Write as if:
• This will appear in a learning app
• The learner will read it repeatedly
• The notes may later be used to generate quizzes

Clarity > completeness
Precision > verbosity
Omission > filler
`.trim();

  const userMessage = `
LITHUANIAN (FINAL, DO NOT CHANGE):
${String(lt).trim()}

PHONETICS (FINAL, DO NOT CHANGE):
${String(phonetics).trim()}

ENGLISH MEANING (NATURAL, FINAL, DO NOT CHANGE):
${String(en_natural).trim()}

ENGLISH MEANING (LITERAL, FINAL, DO NOT CHANGE):
${String(en_literal).trim()}
`.trim();

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 450,
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

    const Category = String(payload?.Category || "").trim();
    const Usage = String(payload?.Usage || "").trim();
    const Notes = String(payload?.Notes || "").trim();

    if (!Category || !Usage || !Notes) {
      console.error("Incomplete enrich payload:", payload);
      return res.status(500).json({ error: "Incomplete enrichment" });
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich function error:", err);
    return res.status(500).json({ error: "Enrichment failed" });
  }
}

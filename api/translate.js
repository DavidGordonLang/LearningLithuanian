// api/translate.js
export const config = { runtime: "edge" };

const SYS = `You are a precise Lithuanian↔English translator.
Return STRICT JSON with keys: english, lithuanian, phonetic, usage, notes, category.
- phonetic: simple, human-friendly (no IPA), with dashes for syllables when helpful.
- usage: 1–2 natural example sentence(s) using the phrase.
- notes: brief nuance/register/politeness.
- category: one or two words (e.g., "Greetings", "Travel", "Food").`;

export default async function handler(req) {
  try {
    const { text, direction } = await req.json();
    if (!text || !direction || !["EN2LT", "LT2EN"].includes(direction)) {
      return json({ error: "Invalid request" }, 400);
    }

    const user = [
      `Direction: ${direction === "EN2LT" ? "English to Lithuanian" : "Lithuanian to English"}`,
      `Text: ${text}`,
      `Respond ONLY with a JSON object.`
    ].join("\n");

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const err = await safeJson(r);
      return json({ error: err?.error?.message || `Upstream error (${r.status})` }, r.status);
    }

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = safeParseJSON(raw);

    return json({
      english: parsed.english || (direction === "LT2EN" ? "" : text),
      lithuanian: parsed.lithuanian || (direction === "EN2LT" ? "" : text),
      phonetic: parsed.phonetic || "",
      usage: parsed.usage || "",
      notes: parsed.notes || "",
      category: parsed.category || "",
    });
  } catch (e) {
    return json({ error: e.message || "Unexpected error" }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

function safeParseJSON(s) {
  try {
    // strip code fences if any
    const clean = s.replace(/^```json\s*|\s*```$/g, "");
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

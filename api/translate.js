// api/translate.js
// Edge runtime, always return JSON, never throw raw errors.
export const config = { runtime: "edge" };

// Small helper for consistent JSON responses
function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

// Very defensive body parser
async function readJson(req) {
  try {
    return await req.json();
  } catch (err) {
    return { __parse_error: String(err?.message || err) };
  }
}

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return json({ ok: false, error: "Method not allowed" }, { status: 405 });
    }

    const body = await readJson(req);
    if (body && body.__parse_error) {
      return json({ ok: false, error: "Invalid JSON body", detail: body.__parse_error }, { status: 400 });
    }

    // Expected minimal inputs; extend later as we wire options through
    const {
      english = "",
      direction = "EN2LT",
      options = {}, // tone, audience, register, variants, etc. (future)
    } = body || {};

    if (!english || typeof english !== "string") {
      return json({ ok: false, error: 'Missing or invalid "english" string' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no key is configured, return a harmless stub so the UI flow can be tested.
    if (!apiKey) {
      return json({
        ok: true,
        data: {
          // Stub LT line so the UI can show something; replace by real model output when the key is present.
          lt: direction === "EN2LT" ? `${english} (LT — demo)` : english,
          usage: "(demo) Replace with model-generated usage once OPENAI_API_KEY is set.",
          notes: "(demo) Balanced/Literal notes would appear here.",
          meta: { stub: true, direction, options },
        },
      });
    }

    // ---------- Real call to OpenAI (simple first pass; we can refine the prompt later) ----------
    const prompt = [
      {
        role: "system",
        content:
          "You are a careful Lithuanian/English translator. Return only the Lithuanian translation when asked EN→LT, concise and natural for everyday use.",
      },
      {
        role: "user",
        content:
          direction === "EN2LT"
            ? `Translate to natural Lithuanian: "${english}"`
            : `Translate to natural English: "${english}"`,
      },
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: prompt,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return json(
        { ok: false, error: "OpenAI request failed", status: resp.status, detail: text?.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await resp.json().catch(() => ({}));
    const lt =
      data?.choices?.[0]?.message?.content?.trim?.() ||
      "";

    return json({
      ok: true,
      data: {
        lt,
        usage: "", // We’ll fill these when we extend the prompt in Step 4.
        notes: "",
        meta: { stub: false, direction, options },
      },
    });
  } catch (err) {
    // Catch-all: never leak a non-JSON error
    return json(
      { ok: false, error: "Server error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

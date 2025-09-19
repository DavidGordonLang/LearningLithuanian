// api/translate.js
// Edge runtime; always return JSON; backward-compatible top-level fields.
export const config = { runtime: "edge" };

function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

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

    const {
      english = "",
      direction = "EN2LT",
      options = {}, // tone, audience, register, variants (future)
    } = body || {};

    if (!english || typeof english !== "string") {
      return json({ ok: false, error: 'Missing or invalid "english" string' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // ---------- helper to emit payload with both shapes ----------
    const reply = ({ lt, ph = "", usage = "", notes = "", meta = {} }) => {
      const payload = {
        ok: true,
        // top-level fields for the current UI
        lt,
        ph,
        usage,
        notes,
        // nested shape for future clients
        data: { lt, ph, usage, notes, meta },
      };
      return json(payload);
    };

    // No key? Return a stub so the UI flow keeps working.
    if (!apiKey) {
      return reply({
        lt: direction === "EN2LT" ? `${english} (LT — demo)` : english,
        usage: "(demo) Replace with model-generated usage once OPENAI_API_KEY is set.",
        notes: "(demo) Balanced/Literal notes would appear here.",
        meta: { stub: true, direction, options },
      });
    }

    // ---------- Real call to OpenAI ----------
    const messages = [
      {
        role: "system",
        content:
          "You are a careful Lithuanian/English translator. Prefer concise, natural everyday phrasing.",
      },
      {
        role: "user",
        content:
          direction === "EN2LT"
            ? `Translate to natural Lithuanian only (no extra text): "${english}"`
            : `Translate to natural English only (no extra text): "${english}"`,
      },
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages,
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
    const translated = data?.choices?.[0]?.message?.content?.trim?.() || "";

    return reply({
      lt: translated,
      usage: "",
      notes: "",
      meta: { stub: false, direction, options },
    });
  } catch (err) {
    return json(
      { ok: false, error: "Server error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}

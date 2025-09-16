// /api/translate.js
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      hint:
        "POST { text, from: 'en'|'lt'|'auto', to: 'lt'|'en' } to translate.",
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, from = 'auto', to } = await readJson(req);
    if (!text || !to || !['lt', 'en'].includes(to)) {
      return res.status(400).json({
        error:
          "Bad request. Provide { text, from: 'en'|'lt'|'auto', to: 'lt'|'en' }",
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    // Keep usage SHORT (2–3 words) + simple categories
    const system = [
      'You are a precise Lithuanian↔English translator.',
      'Return STRICT JSON only with keys: translation, phonetic, usage, notes.',
      'Rules:',
      '- translation: natural, correct.',
      "- phonetic: simple, human-friendly pronunciation (no IPA).",
      "- usage: a SHORT 1–3 word context tag chosen from this set:",
      '  ["greeting","small talk","eating out","shopping","directions","transport","accommodation","family","friends","work","health","emergency","home","phone","money","time","other"]',
      "- notes: optional; concise (≤120 chars). Include key alternatives or register (e.g. “polite form”, “slang”, “also: <alt>”).",
      'No extra text, no backticks.',
    ].join('\n');

    const user = `from=${from}; to=${to}; text: """${text}"""`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res
        .status(500)
        .json({ error: 'OpenAI error', detail: txt.slice(0, 400) });
    }

    const data = await r.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';

    let out;
    try {
      out = JSON.parse(raw);
    } catch {
      // last-ditch fallback: return translation only
      out = { translation: raw, phonetic: '', usage: 'other', notes: '' };
    }

    return res.status(200).json({
      sourcelang: from,
      targetlang: to,
      translation: out.translation || '',
      phonetic: out.phonetic || '',
      usage: (out.usage || 'other').toLowerCase(),
      notes: out.notes || '',
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}

// ---- helpers
async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.from(c));
  const body = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(body);
}

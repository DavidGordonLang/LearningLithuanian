// /api/translate.js
// Vercel Node Function. Requires OPENAI_API_KEY (Project → Settings → Environment Variables).

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res
        .status(200)
        .json({ ok: true, hint: "POST { text, from: 'en'|'lt'|'auto', to: 'lt'|'en' } to translate." });
    }

    // --- Env sanity
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'Missing OPENAI_API_KEY on server' });
    }
    const model = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini';

    // --- Parse JSON body
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch {
        return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      }
    }

    const text = String(body?.text || '').trim();
    const from = String(body?.from || 'auto').trim(); // 'en' | 'lt' | 'auto'
    const to   = String(body?.to   || 'lt').trim();   // 'en' | 'lt'
    if (!text) return res.status(400).json({ ok: false, error: "Missing 'text'" });
    if (!['en','lt','auto'].includes(from)) return res.status(400).json({ ok:false, error:"Bad 'from' value" });
    if (!['en','lt'].includes(to)) return res.status(400).json({ ok:false, error:"Bad 'to' value" });

    // --- Compose prompt
    const sys =
      'You translate between English and Lithuanian. ' +
      'Return ONLY a JSON object with keys: sourcelang ("en"|"lt"), targetlang ("en"|"lt"), ' +
      'translation (string), phonetic (simple Latin syllables with hyphens, no IPA), ' +
      'usage (1–3 words max, e.g. "greeting", "polite request"), notes (very short; may include alternatives). ' +
      'No code fences.';

    const payload = {
      model,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: `from=${from}, to=${to}, text="""${text}"""` }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    };

    // --- Call OpenAI
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const bodyText = await r.text();

    if (!r.ok) {
      // Bubble up OpenAI error to the client so we can see it in the UI
      let detail;
      try { detail = JSON.parse(bodyText); } catch {}
      const message =
        detail?.error?.message ||
        detail?.message ||
        bodyText?.slice(0, 500) ||
        'Unknown upstream error';
      console.error('[translate] OpenAI error:', r.status, message);
      return res.status(502).json({ ok: false, error: 'OpenAI error', status: r.status, message });
    }

    let data;
    try { data = JSON.parse(bodyText); }
    catch (e) {
      console.error('[translate] Non-JSON OpenAI response:', bodyText?.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'Non-JSON response from OpenAI' });
    }

    let content = data?.choices?.[0]?.message?.content ?? '{}';
    if (typeof content !== 'string') content = JSON.stringify(content);

    let parsed;
    try { parsed = JSON.parse(content); }
    catch (e) {
      console.error('[translate] Model returned non-JSON content:', content?.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'Model content was not JSON' });
    }

    const out = {
      sourcelang: String(parsed.sourcelang || (from === 'auto' ? '' : from)).toLowerCase(),
      targetlang: String(parsed.targetlang || to).toLowerCase(),
      translation: String(parsed.translation || '').trim(),
      phonetic:    String(parsed.phonetic || '').trim(),
      usage:       String(parsed.usage || '').trim(),
      notes:       String(parsed.notes || '').trim()
    };

    if (!out.translation) {
      console.error('[translate] Missing translation in model output:', parsed);
      return res.status(502).json({ ok: false, error: 'No translation from model' });
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, ...out });
  } catch (err) {
    console.error('[translate] Unhandled error:', err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
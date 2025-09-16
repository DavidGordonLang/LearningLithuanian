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

    // Stricter instructions – short usage tag + concise notes
    const system = [
      'You are a precise Lithuanian↔English translator.',
      'Return STRICT JSON with keys: translation, phonetic, usage, notes.',
      '- translation: natural and correct.',
      "- phonetic: SIMPLE, human-friendly; no IPA; for the TARGET language.",
      '- usage: one SHORT tag chosen from:',
      '  ["greeting","small talk","eating out","shopping","directions","transport","accommodation","family","friends","work","health","emergency","home","phone","money","time","other"]',
      '- notes: optional; ≤120 chars; include alternatives/register if helpful.',
      'Output JSON only. No backticks, no prose.',
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
      out = { translation: raw, phonetic: '', usage: 'other', notes: '' };
    }

    let translation = String(out.translation || '').trim();
    let phonetic = String(out.phonetic || '').trim();
    const usage = (out.usage || 'other').toLowerCase();
    const notes = String(out.notes || '').trim();

    // --- Phonetic fallback for Lithuanian targets ---
    if (to === 'lt') {
      if (!phonetic || tooSimilar(phonetic, translation)) {
        phonetic = ltPhoneticFallback(translation);
      }
    } else {
      // English target: phonetic is optional; if model echoed the same, blank it.
      if (tooSimilar(phonetic, translation)) phonetic = '';
    }

    return res.status(200).json({
      sourcelang: from,
      targetlang: to,
      translation,
      phonetic,
      usage,
      notes,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}

// -------- helpers --------
async function readJson(req) {
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.from(c));
  const body = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(body);
}

// Is phonetic basically the same as translation?
function tooSimilar(a = '', b = '') {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return true;
  if (na === nb) return true;
  const s = jaccardBigrams(na, nb);
  return s > 0.9;
}
function normalize(s) {
  return stripDiacritics(String(s).toLowerCase())
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function jaccardBigrams(a, b) {
  const g = (s) => {
    const arr = [];
    for (let i = 0; i < s.length - 1; i++) arr.push(s.slice(i, i + 2));
    return arr;
  };
  const A = new Set(g(a));
  const B = new Set(g(b));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 1;
}
function stripDiacritics(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[č]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[ą]/g, 'a')
    .replace(/[ę]/g, 'e')
    .replace(/[ė]/g, 'e')
    .replace(/[į]/g, 'i')
    .replace(/[ųū]/g, 'u');
}

// Very rough Lithuanian → EN-friendly phonetic with simple hyphenation.
function ltPhoneticFallback(text = '') {
  const vowels = new Set(['a','e','i','o','u','y','ą','ę','ė','į','ų','ū']);
  const map = {
    'č':'ch','š':'sh','ž':'zh','j':'y',
    'ą':'ah','a':'a',
    'ę':'eh','ė':'eh','e':'e',
    'į':'ee','y':'ee','i':'i',
    'ū':'oo','ų':'oo','u':'oo',
    'o':'o',
    'k':'k','g':'g','d':'d','t':'t','p':'p','b':'b','m':'m',
    'n':'n','l':'l','r':'r','s':'s','z':'z','v':'v','h':'h','f':'f'
  };

  const toPh = (word) => {
    const lower = word.toLowerCase();
    // hyphenate after V-C when followed by a vowel (ga-li-me, gau-ti, pra-šau)
    let withHyphens = '';
    for (let i = 0; i < lower.length; i++) {
      const ch = lower[i];
      withHyphens += ch;
      const prev = lower[i];
      const next = lower[i + 1];
      const next2 = lower[i + 2];
      if (vowels.has(prev) && next && !vowels.has(next) && next2 && vowels.has(next2)) {
        withHyphens += '-';
      }
    }
    // map characters to simple sounds
    let out = '';
    for (const ch of withHyphens) {
      out += map[ch] ?? ch;
    }
    return out;
  };

  return text
    .split(/(\s+)/)            // keep spaces/punct
    .map(tok => /\s+/.test(tok) ? tok : toPh(tok))
    .join('')
    .replace(/\s+-\s+/g, '-')  // tidy
    .replace(/-{2,}/g, '-');
}

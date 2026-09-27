import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

const ADMIN_EMAILS = [
  "davidgordonlang@gmail.com",
  "rokas.zemaitis@proton.me",
  "barbora.gaulyte@gmail.com",
];

const DEFAULT_BATCH_SIZE = 25;
const MAX_BATCH_SIZE = 50;
const DEFAULT_SCAN_LIMIT = 500;
const MAX_SCAN_LIMIT = 2000;

const LITHUANIAN_DIACRITIC_RE = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/;
const NON_ASCII_RE = /[^\x00-\x7F]/;

async function readJsonBody(req) {
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  return body || {};
}

function clampInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isAdminEmail(value) {
  const email = normalizeEmail(value);
  return ADMIN_EMAILS.includes(email);
}

async function requireAdmin(req) {
  if (!supabase) {
    return { ok: false, status: 500, error: "Server config error" };
  }

  const header = String(req.headers?.authorization || "").trim();
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token || token === header) {
    return { ok: false, status: 401, error: "Missing auth token" };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { ok: false, status: 401, error: "Invalid auth token" };
  }

  const email = data.user.email;
  if (!isAdminEmail(email)) {
    return { ok: false, status: 403, error: "Admin only" };
  }

  return { ok: true, user: data.user };
}

function normalizeForCompare(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function countLithuanianSyllableHints(value) {
  const s = String(value || "").toLowerCase();
  return (s.match(/[aąeęėiįyuoųū]+/g) || []).length;
}

function getBackfillReason(rowData = {}) {
  if (rowData?._deleted === true) return "";

  const lt = String(rowData?.Lithuanian || "").trim();
  const current = String(rowData?.Phonetic || "").trim();
  if (!lt) return "";
  if (!current) return "missing";

  if (LITHUANIAN_DIACRITIC_RE.test(current)) return "contains_lithuanian_letters";
  if (NON_ASCII_RE.test(current)) return "contains_non_english_symbols";

  const ltKey = normalizeForCompare(lt);
  const phoneticKey = normalizeForCompare(current);
  if (ltKey && ltKey === phoneticKey) return "same_as_lithuanian";

  const syllableHints = countLithuanianSyllableHints(lt);
  const hasSyllableBreak = /[-\s]/.test(current);
  if (syllableHints >= 2 && !hasSyllableBreak) return "likely_truncated_or_unsyllabified";

  return "";
}

function validateGeneratedPhonetic(lt, phonetic) {
  const value = String(phonetic || "").trim();
  if (!value) throw new Error("Empty phonetic response");
  if (LITHUANIAN_DIACRITIC_RE.test(value)) {
    throw new Error("Generated phonetic contains Lithuanian letters");
  }
  if (NON_ASCII_RE.test(value)) {
    throw new Error("Generated phonetic contains non-English symbols");
  }
  if (!/[A-Z]/.test(value)) {
    throw new Error("Generated phonetic does not mark stress");
  }
  if (countLithuanianSyllableHints(lt) >= 2 && !/[-\s]/.test(value)) {
    throw new Error("Generated phonetic appears unsyllabified");
  }
  return value;
}

async function generateEnglishPhonetic(lithuanian) {
  const input = String(lithuanian || "").trim();
  if (!input) throw new Error("Missing Lithuanian text");
  if (!OPENAI_API_KEY) throw new Error("OpenAI API key is not configured");

  const systemPrompt = `
You generate English-friendly pronunciation hints for English speakers learning Lithuanian.

Return ONE valid JSON object and NOTHING else:
{ "phonetics": "<English-friendly phonetics>" }

Rules:
- The input is Lithuanian. Do not translate. Do not rewrite the Lithuanian.
- English phonetics are NOT IPA.
- Separate syllables with hyphens.
- Mark the stressed syllable of each Lithuanian word in ALL CAPS.
- Represent every Lithuanian syllable and ending. Do not drop final vowels.
- Do not compress a multi-syllable Lithuanian word into one vague English sound.
- Use ASCII English letters only. No IPA symbols. No Lithuanian letters/diacritics.
- Use consistent English approximations:
  - š -> sh
  - č -> ch
  - ž -> zh
  - ė -> eh
  - ie -> yeh / ye where appropriate
  - ai -> eye
  - au -> ow / au according to the nearest English-friendly sound
- Keep multi-word phrases readable by spacing words normally and hyphenating syllables inside each word.

Examples:
- Labas -> LAH-bahs
- Prašau -> prah-SHAU
- Malonu -> mah-LOH-noo
- Laba diena -> LAH-bah DYEH-nah
- Šitie -> SHIH-tyeh
- Šitie tinka -> SHIH-tyeh TIN-kah
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  const json = await response.json();
  const raw = json?.choices?.[0]?.message?.content;

  let payload;
  try {
    payload = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("Bad JSON from OpenAI");
  }

  return validateGeneratedPhonetic(input, payload?.phonetics);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return res.status(admin.status).json({ error: admin.error });
    }

    const body = await readJsonBody(req);
    const dryRun = body?.dryRun === true;
    const target = body?.target === "all" ? "all" : "bad_or_missing";
    const batchSize = clampInt(body?.limit, DEFAULT_BATCH_SIZE, 1, MAX_BATCH_SIZE);
    const scanLimit = clampInt(
      body?.scanLimit,
      DEFAULT_SCAN_LIMIT,
      batchSize,
      MAX_SCAN_LIMIT
    );

    const { data: rows, error: fetchError } = await supabase
      .from("phrases")
      .select("id, data")
      .order("id", { ascending: true })
      .limit(scanLimit);

    if (fetchError) throw fetchError;

    const phraseRows = Array.isArray(rows) ? rows : [];
    const eligible = [];

    for (const row of phraseRows) {
      const rowData = row?.data || {};
      const lt = String(rowData?.Lithuanian || "").trim();
      if (!lt || rowData?._deleted === true) continue;

      const reason = target === "all" ? "target_all" : getBackfillReason(rowData);
      if (!reason) continue;

      eligible.push({ row, reason });
    }

    const selected = eligible.slice(0, batchSize);
    const sampleChangedRows = [];
    const errors = [];
    let updated = 0;
    let unchanged = 0;

    for (const item of selected) {
      const row = item.row;
      const rowData = row?.data || {};
      const lt = String(rowData?.Lithuanian || "").trim();
      const before = String(rowData?.Phonetic || "").trim();

      try {
        const after = await generateEnglishPhonetic(lt);

        if (after === before) {
          unchanged += 1;
          continue;
        }

        sampleChangedRows.push({
          phraseId: row.id,
          Lithuanian: lt,
          before,
          after,
          reason: item.reason,
        });

        if (!dryRun) {
          const nextData = {
            ...rowData,
            Phonetic: after,
          };

          const { error: updateError } = await supabase
            .from("phrases")
            .update({ data: nextData })
            .eq("id", row.id);

          if (updateError) throw updateError;
          updated += 1;
        }
      } catch (err) {
        errors.push({
          phraseId: row.id,
          Lithuanian: lt,
          error: err?.message || "Unknown error",
        });
      }
    }

    return res.status(200).json({
      message: dryRun
        ? "English phonetics preview complete."
        : "English phonetics backfill batch complete.",
      dryRun,
      target,
      checked: phraseRows.length,
      eligible: eligible.length,
      processed: selected.length,
      updated,
      wouldUpdate: dryRun ? sampleChangedRows.length : updated,
      unchanged,
      skipped: phraseRows.length - eligible.length,
      errors: errors.length,
      errorSamples: errors.slice(0, 10),
      sampleChangedRows: sampleChangedRows.slice(0, 10),
      userEditedDetection: "No per-field edit marker exists for Phonetic; this route only targets missing/bad-looking values by default.",
    });
  } catch (err) {
    console.error("English phonetics backfill failed:", err);
    return res.status(500).json({ error: err?.message || "Backfill failed" });
  }
}

// /api/enrich.js
//
// Enrichment endpoint — adds Usage, Notes, and Category to an existing translation.
//
// Changes from previous version:
//  - Promise.all: enrichment + category calls now run in PARALLEL (halves latency)
//  - max_tokens raised to 700 (was 420) — previous budget caused truncation and padding
//  - Notes prompt restructured with a fixed plain-text template so output is consistent
//  - Case form guidance added (nominative / accusative / genitive shown via examples)
//  - Ordinal form added for number words
//  - Few-shot example embedded to anchor output quality
//  - Variant fabrication rules tightened
//  - Category prompt rewritten with ordered dominance rules and English-first classification

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const lt = typeof body.lt === "string" ? body.lt.trim() : "";
  const phonetics = typeof body.phonetics === "string" ? body.phonetics.trim() : "";
  const en_natural = typeof body.en_natural === "string" ? body.en_natural.trim() : "";
  const en_literal = typeof body.en_literal === "string" ? body.en_literal.trim() : "";

  if (!lt) {
    return res.status(400).json({ error: "Missing lt" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server config error" });
  }

  // ---------------------------------------------------------------------------
  // AUTHORITATIVE CATEGORY LIST (LOCKED)
  // ---------------------------------------------------------------------------
  const CATEGORIES = [
    "General",
    "Travel",
    "Food & Drink",
    "Shopping",
    "Health",
    "Work",
    "Housing",
    "Bureaucracy",
    "Emergency",
    "Social",
    "Romantic",
    "Sexual",
    "Parenting",
    "Education",
    "Numbers",
    "Time & Dates",
  ];

  // ---------------------------------------------------------------------------
  // ENRICHMENT PROMPT
  // ---------------------------------------------------------------------------
  const enrichSystemPrompt = `
You are a language enrichment engine for English speakers learning Lithuanian.

Your job is NOT to translate.
Your job is to ENRICH an existing, already-correct translation with useful learning context.

You MUST NOT change:
- The Lithuanian phrase
- The English meanings
- The phonetics

────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────
Return ONE valid JSON object, and NOTHING else:

{
  "Usage": "",
  "Notes": ""
}

Rules:
- No extra keys. No missing keys. No markdown. Every value must be a non-empty string.
- The Notes value is plain text rendered with whitespace preserved.
  Use blank lines to separate sections. Do NOT use asterisks, dashes, or any markdown.

────────────────────────────────
USAGE
────────────────────────────────
1-2 sentences describing WHEN a Lithuanian speaker would actually say this.
Be specific — name realistic situations. Avoid generic filler.
Do NOT mention grammar. Do NOT assume gender unless the Lithuanian wording encodes it.

────────────────────────────────
NOTES — FIXED STRUCTURE
────────────────────────────────
Write Notes as plain text in this exact section order.
Only include a section if it adds genuine value. Skip sections that would be empty or obvious.
Separate every section with a blank line.

SECTION 1 — MEANING AND TONE (always include)
2-3 sentences on what the phrase expresses and how it sounds.
Cover register: is it neutral, warm, blunt, intimate, vulgar, formal, casual?
If the phrase has a nuance an English speaker would miss, name it directly.

SECTION 2 — ENGLISH SPEAKER TRAPS (include when relevant)
One thing an English speaker is likely to misunderstand or mistranslate.
Skip if there is genuinely nothing to flag.

SECTION 3 — KEY FORMS (include when the phrase contains a content word that changes form)
Lithuanian words change their endings depending on their role in a sentence.
Show the most useful forms of the key word(s) using short example sentences.
Label each form plainly on its own line, then give a Lithuanian example with English meaning.
Use these labels exactly:

As subject:
As object:
Of / without:

Example of what this section looks like for the word "duona" (bread):

As subject: Duona yra sviezi — The bread is fresh
As object: Noriu duonos — I want some bread
Of / without: Gabalas duonos — A piece of bread / Be duonos — Without bread

Only include forms that would genuinely help the learner. Two forms is enough if three are forced.
Do NOT list every possible form. Do NOT use case names (nominative, accusative, genitive) — use the labels above.

SECTION 4 — ORDINAL FORM (include ONLY when the input is a number word)
Give the ordinal (first, second, third...) for both genders, then one brief example.
Format exactly like this:

Ordinal: pirmas (masc.) / pirma (fem.) — first
Example: pirmas namas — the first house

SECTION 5 — VARIANTS
Include variants ONLY when there are genuinely commonly used spoken alternatives.
A variant must be meaningfully different in wording — not just a word-order shuffle of the same phrase.
NEVER list the original phrase itself, or a near-identical rephrasing, as a variant.

Do NOT include variants to meet a quota. It is fine to have none.
Include one strong variant, or two if both are genuinely natural in real speech.

If variants ARE included, format them exactly like this — no deviations:

Variants:
- Lithuanian phrase — natural English meaning
  phonetics

- Lithuanian phrase — natural English meaning
  phonetics

After the variants block, you may add 1-2 sentences on tone or frequency differences.

If there are NO useful variants, write this exact sentence at the end of Notes:
No useful variants for this phrase.

────────────────────────────────
ABSOLUTE BANS
────────────────────────────────
- No boilerplate ("used in everyday conversation", "just like in English", "similar to English")
- No filler observations about Lithuanian having case endings or word order in general
- No invented variants — if you are not confident a variant is in real common use, omit it
- No markdown (no **, no ##, no bullet dashes, no *)
- No explanations outside the JSON

────────────────────────────────
FEW-SHOT EXAMPLE
────────────────────────────────
Input:
LITHUANIAN: As esu baisiai alkana
ENGLISH (NATURAL): I am really hungry
ENGLISH (LITERAL): I am terribly hungry

Good output:

{
  "Usage": "Said when hunger is strong enough to be worth mentioning — before a meal, after a long gap without eating, or when asking to stop somewhere to eat.",
  "Notes": "The word baisiai literally means terribly or dreadfully, and it makes the hunger sound dramatic rather than polite. It is a common spoken intensifier in Lithuanian, roughly equivalent to saying absolutely starving rather than just hungry in English.

The ending of alkana shows the speaker is female. A male speaker would say alkanas. The word baisiai stays the same regardless.

As subject: Alkana moteris — A hungry woman
As object: Maciau alkana vaika — I saw a hungry child
Of / without: Jausmas alkanos — The feeling of hunger

Variants:
- As esu labai alkana — I am very hungry
  ahsh eh-soo lah-bai al-kah-nah

Labai is the neutral, everyday word for very. Baisiai is more vivid and informal — it signals that the hunger is being played up slightly for effect, which is natural in spoken Lithuanian."
}
`.trim();

  // ---------------------------------------------------------------------------
  // CATEGORY CLASSIFICATION PROMPT
  // ---------------------------------------------------------------------------
  const categorySystemPrompt = `
You are a strict intent classifier.

Your task:
- Read the Lithuanian phrase and its English meanings.
- Choose EXACTLY ONE category from the allowed list.
- ALWAYS classify based on the ENGLISH NATURAL meaning, not the Lithuanian wording.
  The Lithuanian may be ambiguous — the English translation is the ground truth for intent.

Allowed categories:
${CATEGORIES.join(", ")}

DOMINANCE RULES — apply in this order, stopping at the first match:

1. NUMBERS: If the English meaning is a number (e.g. "3", "forty-seven", "99") or an ordinal
   ("first", "third"), the category MUST be "Numbers". This overrides everything else.

2. SEXUAL: If the English meaning expresses sexual desire, arousal, sexual activity, or
   turning someone on, the category MUST be "Sexual".
   Examples that are Sexual: "I want you so badly", "You're turning me on", "He really turns me on"
   Sexual OVERRIDES Romantic, Social, and General.

3. ROMANTIC: Emotional bonding, love, affection, or missing someone — without sexual content.
   Examples: "I love you", "I missed you", "My love", "You are beautiful"

4. EMERGENCY: Urgent calls for help, ambulance, police, fire.

5. HEALTH: Medical symptoms, illness, pharmacy, feeling unwell.

6. FOOD & DRINK: Ordering, describing, or asking about food or drink.

7. TRAVEL: Transport, directions, airports, hotels, navigation.

8. SHOPPING: Buying things, prices, sizes, markets.

9. WORK: Jobs, professions, workplace, colleagues.

10. SOCIAL: Greetings, small talk, farewells, arguments, casual interaction — nothing intimate.

11. EDUCATION: Learning, studying, schools, language learning.

12. TIME & DATES: Times, days, dates, schedules, durations.

13. HOUSING: Homes, flats, renting, household tasks.

14. BUREAUCRACY: Forms, official processes, registration, documents.

15. PARENTING: Children, parenting, family with children.

16. GENERAL: Use ONLY if none of the above clearly fits.

Return ONLY this JSON:
{ "Category": "<one category from the list>" }

Rules:
- Category must match one of the allowed values EXACTLY.
- No explanation. No extra keys. No text outside JSON.
`.trim();

  const enrichUser = `
LITHUANIAN:
${lt}

PHONETICS:
${phonetics || "(not provided)"}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  const categoryUser = `
LITHUANIAN:
${lt}

ENGLISH (NATURAL):
${en_natural || "(not provided)"}

ENGLISH (LITERAL):
${en_literal || "(not provided)"}
`.trim();

  // ---------------------------------------------------------------------------
  // PARALLEL CALLS — enrichment and category are independent, run simultaneously
  // ---------------------------------------------------------------------------
  try {
    const [enrichResp, catResp] = await Promise.all([
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: enrichSystemPrompt },
            { role: "user", content: enrichUser },
          ],
          temperature: 0.2,
          max_tokens: 700,
        }),
      }),
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: categorySystemPrompt },
            { role: "user", content: categoryUser },
          ],
          temperature: 0.0,
          max_tokens: 60,
        }),
      }),
    ]);

    // Parse enrichment
    const enrichJson = await enrichResp.json();
    const enrichRaw = enrichJson?.choices?.[0]?.message?.content;
    const enrichPayload = JSON.parse(enrichRaw);

    const Usage = String(enrichPayload?.Usage || "").trim();
    const Notes = String(enrichPayload?.Notes || "").trim();

    if (!Usage || !Notes) {
      throw new Error("Incomplete enrichment payload");
    }

    // Parse category
    const catJson = await catResp.json();
    const catRaw = catJson?.choices?.[0]?.message?.content;
    const catPayload = JSON.parse(catRaw);

    let Category = String(catPayload?.Category || "").trim();
    if (!CATEGORIES.includes(Category)) {
      Category = "General";
    }

    return res.status(200).json({ Category, Usage, Notes });
  } catch (err) {
    console.error("Enrich error:", err);

    return res.status(200).json({
      Category: "General",
      Usage: "Used when a Lithuanian speaker would naturally say this in context.",
      Notes: "Enrichment could not be generated this time.",
    });
  }
}

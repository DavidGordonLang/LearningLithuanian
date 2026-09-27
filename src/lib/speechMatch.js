const LITHUANIAN_CARDINAL_UNIT_VALUES = new Map([
  ["nulis", 0],
  // Number forms used with plural years (metai).
  ["vieni", 1], ["vieneri", 1], ["dveji", 2], ["treji", 3],
  ["ketveri", 4], ["penkeri", 5], ["seseri", 6],
  ["septyneri", 7], ["astuoneri", 8], ["devyneri", 9],
  ["vienas", 1], ["viena", 1], ["vieno", 1], ["vienos", 1],
  ["du", 2], ["dvi", 2], ["dvieju", 2], ["dviese", 2],
  ["trys", 3], ["tris", 3], ["triju", 3],
  ["keturi", 4], ["keturias", 4], ["keturis", 4], ["keturiu", 4],
  ["penki", 5], ["penkias", 5], ["penkis", 5], ["penkiu", 5],
  ["sesi", 6], ["sesias", 6], ["sesis", 6], ["sesiu", 6],
  ["septyni", 7], ["septynias", 7], ["septynis", 7], ["septyniu", 7],
  ["astuoni", 8], ["astuonias", 8], ["astuonis", 8], ["astuoniu", 8],
  ["devyni", 9], ["devynias", 9], ["devynis", 9], ["devyniu", 9],
]);

const LITHUANIAN_CARDINAL_FIXED_VALUES = new Map([
  ["desimt", 10],
  ["vienuolika", 11],
  ["dvylika", 12],
  ["trylika", 13],
  ["keturiolika", 14],
  ["penkiolika", 15],
  ["sesiolika", 16],
  ["septyniolika", 17],
  ["astuoniolika", 18],
  ["devyniolika", 19],
  ["dvidesimt", 20],
  ["trisdesimt", 30],
  ["keturiasdesimt", 40],
  ["penkiasdesimt", 50],
  ["sesiasdesimt", 60],
  ["septyniasdesimt", 70],
  ["astuoniasdesimt", 80],
  ["devyniasdesimt", 90],
  ["simtas", 100],
]);

const LITHUANIAN_CLOCK_NUMBER_VALUES = new Map([
  ["pirma", 1],
  ["antra", 2],
  ["trecia", 3],
  ["ketvirta", 4],
  ["penkta", 5],
  ["sesta", 6],
  ["septinta", 7],
  ["astunta", 8],
  ["devinta", 9],
  ["desimta", 10],
]);

function parseLithuanianNumberAt(words, index) {
  const word = words[index];
  if (!word) return null;
  if (/^\d+$/.test(word)) return { value: Number(word), length: 1 };

  const clockValue = LITHUANIAN_CLOCK_NUMBER_VALUES.get(word);
  if (clockValue != null) return { value: clockValue, length: 1 };

  const fixedValue = LITHUANIAN_CARDINAL_FIXED_VALUES.get(word);
  if (fixedValue != null) {
    if (fixedValue >= 20 && fixedValue < 100 && fixedValue % 10 === 0) {
      const nextUnit = LITHUANIAN_CARDINAL_UNIT_VALUES.get(words[index + 1]);
      if (nextUnit != null && nextUnit > 0) {
        return { value: fixedValue + nextUnit, length: 2 };
      }
    }
    return { value: fixedValue, length: 1 };
  }

  const unitValue = LITHUANIAN_CARDINAL_UNIT_VALUES.get(word);
  if (unitValue != null) return { value: unitValue, length: 1 };

  return null;
}

function normaliseExpectedNumbersForNumericTranscript(expected) {
  const words = expected.split(" ").filter(Boolean);
  const out = [];

  for (let index = 0; index < words.length;) {
    const parsed = parseLithuanianNumberAt(words, index);
    if (!parsed) {
      out.push(words[index]);
      index += 1;
      continue;
    }
    out.push(String(parsed.value));
    index += parsed.length;
  }

  return out.join(" ");
}

function recognisedNumberValues(text) {
  const words = text.split(" ").filter(Boolean);
  const values = [];
  for (let index = 0; index < words.length;) {
    const parsed = parseLithuanianNumberAt(words, index);
    if (parsed) values.push(parsed.value);
    index += parsed?.length || 1;
  }
  return values;
}

export function normaliseSpeechForMatch(value) {
  const stripped = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return stripped
    .toLowerCase()
    .replace(/[.,!?;:"“”'’„–—\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function speechCharSimilarity(a, b) {
  if (a === b) return 1;
  const la = a.length;
  const lb = b.length;
  if (!la || !lb) return 0;

  const dp = Array.from({ length: la + 1 }, (_, i) => [i]);
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  const distance = dp[la][lb];
  return 1 - distance / Math.max(la, lb);
}

export function phraseMatchesSpeech(captured, target) {
  if (!captured || !target) return false;

  const heard = normaliseSpeechForMatch(captured);
  const expected = normaliseSpeechForMatch(target);
  if (!heard || !expected) return false;
  if (heard === expected) return true;

  // A different recognised number is a meaning error, not a fuzzy spelling
  // variation or harmless filler. Check values before either fuzzy-match path.
  const expectedNumbers = recognisedNumberValues(expected);
  const heardNumbers = recognisedNumberValues(heard);
  if (heardNumbers.length && (
    heardNumbers.length !== expectedNumbers.length ||
    heardNumbers.some((value, index) => value !== expectedNumbers[index])
  )) return false;

  // Speechmatics can render spoken Lithuanian numbers as written digits, including
  // inside a longer phrase (for example "Man keturiasdešimt penkeri metai" -> "Man 45 metai").
  // Only canonicalise the expected side when the transcript actually contains digits.
  // This preserves grammatical distinctions such as du vs dvi when Speechmatics returns words.
  const expectedForMatch = /(?:^|\s)\d+(?:\s|$)/.test(heard)
    ? normaliseExpectedNumbersForNumericTranscript(expected)
    : expected;
  if (heard === expectedForMatch) return true;

  const targetWords = expectedForMatch.split(" ").filter(Boolean);
  const heardWords = heard.split(" ").filter(Boolean);
  if (!targetWords.length || !heardWords.length) return false;

  // Never accept a partial phrase simply because it appears inside the target.
  // For multi-word targets the learner must have produced roughly the full phrase.
  if (targetWords.length > 1 && heardWords.length < targetWords.length) return false;

  // Likewise reject rambling/unrelated transcripts rather than finding the target
  // buried inside a much longer capture. One extra token is tolerated for a small
  // STT filler or accidental duplicate.
  if (heardWords.length > targetWords.length + 1) return false;

  if (targetWords.length === 1) {
    return speechCharSimilarity(heardWords[0], targetWords[0]) >= 0.82;
  }

  // Exact target words in order, allowing at most one harmless extra token.
  let targetIndex = 0;
  for (const word of heardWords) {
    if (word === targetWords[targetIndex]) targetIndex += 1;
    if (targetIndex === targetWords.length) return true;
  }

  // For the normal same-length case, tolerate modest STT spelling variation but
  // require every word to resemble the expected word. This keeps diacritic loss
  // and small recognition errors permissive without accepting unrelated speech.
  if (heardWords.length === targetWords.length) {
    const similarities = targetWords.map((word, index) =>
      speechCharSimilarity(word, heardWords[index] || "")
    );
    const average = similarities.reduce((sum, value) => sum + value, 0) / similarities.length;
    const minimum = Math.min(...similarities);
    // Speechmatics produces cleaner Lithuanian word boundaries than the original
    // OpenAI path, so require each aligned word to stay close to the target.
    // 0.80 still tolerates a small STT spelling error while rejecting meaningful
    // grammatical substitutions such as "turi" for "turite".
    return average >= 0.80 && minimum >= 0.80;
  }

  return false;
}

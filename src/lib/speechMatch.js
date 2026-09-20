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

  const targetWords = expected.split(" ").filter(Boolean);
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
    return average >= 0.80 && minimum >= 0.65;
  }

  return false;
}

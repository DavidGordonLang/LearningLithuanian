// src/utils/textNormalise.js
export function stripDiacritics(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalise(str) {
  if (!str) return "";
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[!?,.:;…“”"'(){}\[\]\-–—*@#\/\\]/g, "") // punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// Lightweight Levenshtein distance with early bailout
export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 1) return 99;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export function areNearDuplicatesText(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const na = normalise(a);
  const nb = normalise(b);
  if (!na && !nb) return true;
  if (!na || !nb) return false;
  if (na === nb) return true;
  return levenshtein(na, nb) <= 1;
}

/**
 * Pre-translation duplicate check:
 * We don't assume source language, so we check BOTH:
 * - Input ≈ any saved English (EnglishOriginal/English)
 * - Input ≈ any saved Lithuanian (Lithuanian/LithuanianOriginal)
 */
export function findDuplicateInLibrary(inputText, rows) {
  const target = normalise(inputText);
  if (!target) return null;

  for (const r of rows || []) {
    const candidateEn = r.EnglishOriginal || r.English || "";
    const candidateLt = r.LithuanianOriginal || r.Lithuanian || "";

    if (areNearDuplicatesText(candidateEn, target)) return r;
    if (areNearDuplicatesText(candidateLt, target)) return r;
  }
  return null;
}

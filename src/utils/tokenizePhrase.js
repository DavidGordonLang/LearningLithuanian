// src/utils/tokenizePhrase.js

function isWhitespace(char) {
  return /\s/.test(char);
}

function isWordChar(char) {
  return /[\p{L}\p{N}]/u.test(char);
}

function isJoiner(char) {
  return char === "'" || char === "’" || char === "-" || char === "-";
}

export default function tokenizePhrase(input) {
  const text = String(input || "");
  const tokens = [];

  if (!text) return tokens;

  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (isWhitespace(char)) {
      let j = i + 1;
      while (j < text.length && isWhitespace(text[j])) j += 1;

      tokens.push({
        type: "space",
        text: text.slice(i, j),
        key: `space-${i}`,
      });

      i = j;
      continue;
    }

    if (isWordChar(char)) {
      let j = i + 1;

      while (j < text.length) {
        const current = text[j];
        const prev = text[j - 1];
        const next = text[j + 1];

        if (isWordChar(current)) {
          j += 1;
          continue;
        }

        if (
          isJoiner(current) &&
          isWordChar(prev) &&
          next != null &&
          isWordChar(next)
        ) {
          j += 1;
          continue;
        }

        break;
      }

      tokens.push({
        type: "word",
        text: text.slice(i, j),
        key: `word-${i}`,
      });

      i = j;
      continue;
    }

    tokens.push({
      type: "punct",
      text: char,
      key: `punct-${i}`,
    });

    i += 1;
  }

  return tokens;
}
// src/utils.js

// Time + ID helpers
export const nowTs = () => Date.now();
export const genId = () => Math.random().toString(36).slice(2);

// CSS class combiner
export const cn = (...xs) => xs.filter(Boolean).join(" ");

// Normalise RAG icons
export function normalizeRag(icon = "") {
  const s = String(icon).trim().toLowerCase();
  if (["🔴", "red"].includes(icon) || s === "red") return "🔴";
  if (["🟠", "amber", "orange", "yellow"].includes(icon) || ["amber", "orange", "yellow"].includes(s))
    return "🟠";
  if (["🟢", "green"].includes(icon) || s === "green") return "🟢";
  return "🟠";
}

// Date diff in days
export function daysBetween(d1, d2) {
  const a = new Date(d1 + "T00:00:00"), b = new Date(d2 + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

// Shuffle array
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick random samples
export function sample(arr, n) {
  if (!arr.length || n <= 0) return [];
  if (n >= arr.length) return shuffle(arr);
  const idxs = new Set();
  while (idxs.size < n) idxs.add((Math.random() * arr.length) | 0);
  return [...idxs].map((i) => arr[i]);
}

// Similarity check
export function sim2(a = "", b = "") {
  const s1 = (a + "").toLowerCase().trim();
  const s2 = (b + "").toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  const grams = (s) => {
    const g = [];
    for (let i = 0; i < s.length - 1; i++) g.push(s.slice(i, i + 2));
    return g;
  };
  const g1 = grams(s1), g2 = grams(s2);
  const map = new Map();
  g1.forEach((x) => map.set(x, (map.get(x) || 0) + 1));
  let inter = 0;
  g2.forEach((x) => {
    if (map.get(x)) {
      inter++;
      map.set(x, map.get(x) - 1);
    }
  });
  return (2 * inter) / (g1.length + g2.length);
}

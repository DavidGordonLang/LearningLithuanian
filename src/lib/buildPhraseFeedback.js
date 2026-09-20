export const BUILD_PHRASE_DISTRACTOR_MEANINGS = Object.freeze({
  suprantu: "I understand",
  kalbu: "I speak",
  stotis: "station",
  galiu: "I can",
  vakaras: "evening",
  dar: "still / more",
  rytas: "morning",
  "jūsų": "your (polite/plural)",
  irgi: "too / also",
  draugas: "male friend",
  brolis: "brother",
  pakartokite: "repeat (polite/plural command)",
  "angliškai": "in English",
  "šiek": "a little / a bit",
  "lėčiau": "more slowly",
  "padėti": "to help",
  "čia": "here",
  "viešbutis": "hotel",
  bankas: "bank",
  galite: "you can (polite/plural)",
  vandens: "water",
  kavos: "coffee",
  parodyti: "to show",
  negaliu: "I can't",
  ta: "that (feminine form)",
  to: "that (masculine form)",
  "kavų": "coffees",
  "metų": "years",
  "trisdešimt": "thirty",
  "dviejų": "two (quantity form)",
  tas: "that (masculine form)",
  "mokėti": "to pay",
  turiu: "I have",
  noriu: "I want",
  kortele: "by card",
  dabar: "now",
  "vėliau": "later",
  "šeštą": "at six",
  trys: "three",
  "pinigų": "money",
  pakanka: "enough / it is enough",
  viena: "one (feminine basic form)",
  laiko: "time",
  "vieną": "one (feminine object form)",
  "kavą": "coffee",
  su: "with",
  pienu: "with milk",
  dvi: "two (feminine form)",
  arbatas: "teas",
  be: "without",
  cukraus: "sugar",
  "šito": "this / this one (masculine form)",
  man: "for me / to me",
});

export function normalizeBuildPhraseToken(text) {
  return String(text || "")
    .trim()
    .toLocaleLowerCase("lt")
    .replace(/[.,!?;:]+$/g, "");
}

export function getBuildPhraseDistractorMeaning(text) {
  return BUILD_PHRASE_DISTRACTOR_MEANINGS[normalizeBuildPhraseToken(text)] || null;
}

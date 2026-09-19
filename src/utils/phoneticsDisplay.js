// Never silently label English respelling as IPA.
export function phoneticsDisplay(mode, english, ipa) {
  const en = String(english || "").trim();
  const transcription = String(ipa || "").trim();
  if (mode !== "ipa") return en;
  if (transcription) return transcription;
  return en ? `IPA unavailable · English phonetics: ${en}` : "IPA unavailable for this phrase";
}

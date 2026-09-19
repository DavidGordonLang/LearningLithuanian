function normaliseLanguage(value) {
  return String(value || "").trim().toLowerCase();
}

export function isScenarioTurnAudioEnabled(turn) {
  if (!turn) return false;
  if (turn.audio === false || turn.audioEnabled === false) return false;

  const language = normaliseLanguage(turn.spokenLanguage || turn.language);
  if (!language) return true;

  // Scenario voices are currently Lithuanian Azure voices. Until explicit
  // per-language voice routing exists, never send English or mixed helper
  // text through Lithuanian TTS.
  return language === "lt" || language.startsWith("lt-") || language === "lithuanian";
}

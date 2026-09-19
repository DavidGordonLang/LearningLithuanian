const DEFAULT_HELP_TEXT = "Nesuprantu.";
const HELP_OPTION_ID = "__scenario_help__";

function cleanText(value) {
  return String(value || "").trim();
}

function comparableText(value) {
  return cleanText(value)
    .toLocaleLowerCase("lt-LT")
    .replace(/[.!?…]+$/u, "")
    .trim();
}

export function getScenarioHelpLevels(step) {
  const levels = Array.isArray(step?.help?.levels) ? step.help.levels : [];
  return levels.filter((level) => {
    if (!level || typeof level !== "object") return false;
    return !!(
      cleanText(level.speakerText) ||
      cleanText(level.sceneDirection) ||
      cleanText(level.supportText) ||
      cleanText(level.meaningText)
    );
  });
}

export function getScenarioHelpOption(step, usedCount = 0) {
  const levels = getScenarioHelpLevels(step);
  const count = Math.max(0, Number.isFinite(Number(usedCount)) ? Number(usedCount) : 0);
  if (!levels.length || count >= levels.length) return null;

  const text = cleanText(step?.help?.optionText) || DEFAULT_HELP_TEXT;
  return {
    id: HELP_OPTION_ID,
    text,
    result: "help",
    isScenarioHelp: true,
  };
}

export function getScenarioHelpTurn(step, usedCount = 0) {
  const levels = getScenarioHelpLevels(step);
  const count = Math.max(0, Number.isFinite(Number(usedCount)) ? Number(usedCount) : 0);
  const level = levels[count];
  if (!level) return null;

  return {
    ...level,
    speakerId: level.speakerId || step?.speakerId || null,
    speakerLabel: level.speakerLabel || step?.speakerLabel || "Speaker",
    helpLevel: count + 1,
  };
}

export function withScenarioHelpOption(authoredOptions, step, usedCount = 0) {
  const options = Array.isArray(authoredOptions) ? authoredOptions : [];
  const levels = getScenarioHelpLevels(step);
  if (!levels.length) return options;

  const helpText = cleanText(step?.help?.optionText) || DEFAULT_HELP_TEXT;
  const target = comparableText(helpText);
  const withoutLegacyDuplicate = options.filter((option) => {
    if (option?.isScenarioHelp) return false;
    return comparableText(option?.text) !== target;
  });

  const helpOption = getScenarioHelpOption(step, usedCount);
  return helpOption ? [...withoutLegacyDuplicate, helpOption] : withoutLegacyDuplicate;
}

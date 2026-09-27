// Shared scoring rules for authored learning blocks.
//
// Accuracy is first-pass block accuracy: an objective block counts once.
// If the learner makes one or more mistakes in that block, that block counts
// as missed once; repeated guesses do not multiply the penalty.

export const SCOREABLE_BLOCK_TYPES = new Set([
  "recognise_mcq",
  "listen_mcq",
  "best_response",
  "build_phrase",
  "word_match",
  "scenario_chain",
  "scenario_v2",
  "context_gap_select",
  "choose_correct_form",
  "conversation_turn_fill",
]);

export function isScoreableBlock(block) {
  return !!block?.type && SCOREABLE_BLOCK_TYPES.has(block.type);
}

export function isSoftPassChoiceOption(option) {
  return ["acceptable", "awkward"].includes(option?.result);
}

export function isCorrectChoiceOption(option) {
  return !isSoftPassChoiceOption(option) && (option?.isCorrect === true || option?.result === "best");
}

export function choiceOptionsAreEnglish(block) {
  if (block?.optionsLanguage === "lt") return false;
  // Legacy noOptionAudio is conservative: never assume its text is Lithuanian.
  return block?.optionsLanguage === "en" || block?.interactionMode === "comprehension" ||
    block?.noOptionAudio === true || block?.type === "listen_mcq" ||
    (block?.type === "recognise_mcq" && !!block?.prompt?.audioText);
}

// Explicit authored Lithuanian wins. Never guess a translation from English.
export function getChoiceAnswerAudio(block, selected, best) {
  const passed = isCorrectChoiceOption(selected) || isSoftPassChoiceOption(selected);
  const answer = passed ? selected : best;
  if (choiceOptionsAreEnglish(block)) {
    return answer?.learnerText || answer?.answerAudioText || block?.answerAudioText ||
      block?.targetText || block?.prompt?.audioText || null;
  }
  return answer?.audioText || answer?.text || null;
}

export function countScoreableBlocks(lesson) {
  return (lesson?.blocks || []).filter(isScoreableBlock).length;
}

export function calculateAccuracyPct(wrongBlocks, scoreableBlocks) {
  const total = Number(scoreableBlocks) || 0;
  if (total <= 0) return null;
  const wrong = Math.max(0, Math.min(Number(wrongBlocks) || 0, total));
  return Math.round(((total - wrong) / total) * 100);
}

export function getSectionLessonIds(section) {
  const ids = [];
  for (const module of section?.modules || []) {
    if (module?.isSectionCheckpoint) {
      if (module.id) ids.push(module.id);
      continue;
    }
    for (const lesson of module?.lessons || []) {
      if (lesson?.id) ids.push(lesson.id);
    }
  }
  return ids;
}

export function aggregateSectionMetrics(section, lessonMetrics) {
  const lessonIds = getSectionLessonIds(section);
  const source = lessonMetrics && typeof lessonMetrics === "object" ? lessonMetrics : {};
  const rows = lessonIds.map((id) => source[id]).filter(Boolean);
  const metricsComplete = lessonIds.length > 0 && rows.length === lessonIds.length;
  const scoreableBlocks = rows.reduce((sum, row) => sum + (Number(row?.scoreableBlocks) || 0), 0);
  const wrongBlocks = rows.reduce((sum, row) => sum + (Number(row?.wrongBlocks) || 0), 0);

  return {
    lessonIds,
    metricsComplete,
    scoreableBlocks,
    wrongBlocks,
    accuracyPct: metricsComplete ? calculateAccuracyPct(wrongBlocks, scoreableBlocks) : null,
  };
}

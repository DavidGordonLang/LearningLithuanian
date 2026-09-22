import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { makeLtKey } from "../src/utils/contentKey.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = (path) => readFileSync(resolve(root, path), "utf8");

test("Lithuanian identity remains the duplicate key for lesson saves", () => {
  assert.equal(makeLtKey({ Lithuanian: "Prašau!" }), "prasau");
  assert.equal(makeLtKey({ Lithuanian: "  PRAŠAU  " }), "prasau");
  assert.equal(
    makeLtKey({ Lithuanian: "Labas", English: "Hello" }),
    makeLtKey({ Lithuanian: "Labas", English: "Good day" })
  );
  assert.notEqual(
    makeLtKey({ Lithuanian: "Labas" }),
    makeLtKey({ Lithuanian: "Ačiū" })
  );
});

test("end-of-module vocabulary save excludes already-saved Lithuanian at every UI/save boundary", () => {
  const src = source("src/views/training/VocabSaveView.jsx");

  assert.match(src, /filter\(\(r\) => !r\._deleted\)/);
  assert.match(src, /isDuplicate:\s*existingKeys\.has\(buildContentKey\(pair\.lt\)\)/);
  assert.match(src, /const selectablePairs = pairsWithStatus\.filter\(\(p\) => !p\.isDuplicate\)/);
  assert.match(src, /selected\.has\(p\.id\) && !p\.isDuplicate/);
  assert.match(src, /disabled=\{isDupe\}/);
  assert.match(src, /!isDupe && togglePair\(pair\.id\)/);
  assert.match(src, /In library/);
});

test("module and section completion still route through the vocabulary retention step", () => {
  const src = source("src/views/TrainingView.jsx");

  assert.match(
    src,
    /onSaveVocab=\{\(\) => \{[\s\S]*?setVocabSaveModule\(mod\);[\s\S]*?setScreen\("vocabSave"\);/
  );
  assert.match(
    src,
    /setVocabSaveModule\(buildSectionVocabModule\(sec, checkpoint\)\);[\s\S]*?setScreen\("vocabSave"\);/
  );
  assert.match(src, /Skip for now|onDone/);
});

test("lesson completion itself does not write directly to the phrase library", () => {
  const src = source("src/views/training/LearningLessonView.jsx");
  assert.doesNotMatch(src, /usePhraseStore|addPhrase|setPhrases/);
});

test("tap-word audio remains wired into core lesson Lithuanian", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /InteractivePhraseText/);
  assert.match(src, /text=\{item\.lt\}/);
  assert.match(src, /text=\{option\.text\}/);
});

test("Scenario V2 keeps tap-word and full-line audio on authored Lithuanian", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /text=\{turn\.speakerText\}/);
  assert.match(src, /text=\{item\.text\}/);
  assert.match(src, /text=\{option\.text\}/);
  assert.match(src, /text=\{option\.betterAnswer\}/);
  assert.match(src, /AudioIconButton text=\{turn\.speakerText\}/);
});

test("tap-word component remains backed by the shared word-audio interaction layer", () => {
  const src = source("src/components/audio/InteractivePhraseText.jsx");

  assert.match(src, /useWordAudio/);
  assert.match(src, /role="button"/);
  assert.match(src, /aria-label=\{\`Play word:/);
});

test("Scenario V2 progression semantics remain explicit", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /result === "best"/);
  assert.match(src, /result === "acceptable"/);
  assert.match(src, /result === "awkward"/);
  assert.match(src, /result === "repair" && option\?\.progresses === true/);
  assert.match(src, /Try another answer/);
});


test("Scenario V2 escalating help stays separate from wrong-answer and progression paths", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /option\?\.isScenarioHelp \|\| option\?\.result === "help"/);
  assert.match(src, /handleScenarioHelp\(option\);[\s\S]*?return;[\s\S]*?if \(!optionCanProgress\(option\)\) onWrongAnswer\?\.\(\)/);
  assert.match(src, /setHelpTurn\(turn\)/);
  assert.match(src, /setHelpTurn\(null\)/);
  assert.match(src, /stepSpeakerCommitted/);
  assert.match(src, /withScenarioHelpOption/);
});


test("Scenario V2 can suppress all audio for English or mixed helper turns", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /isScenarioTurnAudioEnabled\(turn\)/);
  assert.match(src, /audioEnabled \? <AudioIconButton/);
  assert.match(src, /audioEnabled \? \([\s\S]*?<InteractivePhraseText[\s\S]*?\) : \([\s\S]*?<span>\{turn\.speakerText\}<\/span>/);
  assert.match(src, /helpTurn\.speakerText && isScenarioTurnAudioEnabled\(helpTurn\)/);
});


test("lesson audio preloading covers Word Match pairs before they are matched", () => {
  const src = source("src/views/training/LearningLessonView.jsx");
  assert.match(src, /Array\.isArray\(block\?\.pairs\)[\s\S]*?pair\?\.audioText[\s\S]*?set\.add\(pair\.audioText\)/);
  assert.match(src, /preloadText\(text\)/);
});

test("tap-word audio clears sticky mobile hover/focus and lost pointer capture globally", () => {
  const phraseSrc = source("src/components/audio/InteractivePhraseText.jsx");
  const wordAudioSrc = source("src/hooks/useWordAudio.js");

  assert.match(phraseSrc, /z-word-audio-token/);
  assert.match(phraseSrc, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(phraseSrc, /\.z-word-audio-token:hover[\s\S]*?color: inherit !important/);
  assert.match(phraseSrc, /onPointerUp=\{\(e\) => \{[\s\S]*?e\.pointerType !== "mouse"[\s\S]*?blur/);
  assert.match(phraseSrc, /onPointerCancel=\{\(e\) => \{[\s\S]*?e\.pointerType !== "mouse"[\s\S]*?blur/);
  assert.match(phraseSrc, /onLostPointerCapture/);

  assert.match(wordAudioSrc, /const handleLostPointerCapture = useCallback/);
  assert.match(wordAudioSrc, /if \(!stateRef\.current\.active\) return;[\s\S]*?resetState\(\)/);
  assert.match(wordAudioSrc, /onLostPointerCapture: handleLostPointerCapture/);
});

test("normal tap-word glow remains visibly present for roughly 0.9 seconds", () => {
  const phraseSrc = source("src/components/audio/InteractivePhraseText.jsx");
  const wordAudioSrc = source("src/hooks/useWordAudio.js");
  const cssSrc = source("src/index.css");

  assert.match(phraseSrc, /\.z-word-glow \{\s*animation: zWordGlow 0\.9s ease-out forwards;/);
  assert.match(cssSrc, /zWordGlowLight 0\.9s ease-out forwards/);
  assert.match(wordAudioSrc, /NORMAL_GLOW_MIN_MS = 900/);
  assert.match(wordAudioSrc, /Math\.max\(0, NORMAL_GLOW_MIN_MS - elapsed\)/);
  assert.match(wordAudioSrc, /visualGenerationRef\.current === visualGeneration/);
});

test("daily recall slow playback uses a reduced-speed play icon rather than rewind", () => {
  const src = source("src/components/DailyRecallModal.jsx");

  assert.match(src, /½×/);
  assert.match(src, /Play daily recall phrase slowly/);
  assert.match(src, /M3\.25 2\.25L12\.25 7\.5L3\.25 12\.75V2\.25Z/);
  assert.doesNotMatch(src, /M11 5L6 9l5 4V5Z/);
});

test("Match the Pairs can preserve authored teaching pages while shuffling within each page", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /authoredPages = null/);
  assert.match(src, /Array\.isArray\(authoredPages\) && authoredPages\.length > 0/);
  assert.match(src, /page\?\.pairIds/);
  assert.match(src, /label: page\?\.label \|\| ""/);
  assert.match(src, /authoredPages: block\?\.pairPages/);
  assert.match(src, /s\.progress\.pageLabel/);
  assert.match(src, /shuffleArr\(chunk\.map/);
});

test("phrase-completion blocks preserve the learner's selected word and correct separately below", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /revealed \? \(selected\?\.text \|\| GAP\)/);
  assert.match(src, /const filledForm = revealed \? \(selected\?\.text \|\| GAP\) : null/);
  assert.match(src, /preserve what the learner actually chose in the phrase/);
  assert.match(src, /selected\?\.text \|\| "___"/);
  assert.match(src, /isCorrect \? "text-emerald-200" : "text-rose-300"/);
  assert.match(src, /Correct answer: \$\{correctText\}/);
  assert.match(src, /isCorrect \? "text-emerald-200" : "z-correct-answer"/);

  assert.doesNotMatch(src, /revealed \? \(correctOption\?\.text \|\| GAP\)/);
  assert.doesNotMatch(src, /const filledForm = revealed \? \(correctOption\?\.text \|\| GAP\) : null/);
  assert.doesNotMatch(src, /replace\("___", correctOption\?\.text/);
});

test("wrong-answer correction text uses the Žodis accent colour in both themes", () => {
  const css = source("src/index.css");
  assert.match(css, /\.z-correct-answer\s*\{\s*color:\s*var\(--z-accent-bright\);/);
});






test("Speak Self Check remains hold-to-speak and keeps transcript diagnostics off production", () => {
  const src = source("src/views/training/LearningLessonView.jsx");
  assert.match(src, /onPointerDown=\{handleMicPointerDown\}/);
  assert.match(src, /onPointerUp=\{finishMicHold\}/);
  assert.match(src, /isRecording \? "bg-emerald-500\/25/);
  assert.match(src, /speechDebugEnabled/);
  assert.match(src, /!\["zodis\.app", "www\.zodis\.app"\]\.includes\(window\.location\.hostname\)/);
  assert.match(src, /STT heard:/);
  assert.match(src, /Matcher:/);
});


test("Build Phrase can submit overfilled answers so distractors return explicit wrong feedback", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /const isReady = built\.length >= requiredLength && requiredLength > 0/);
  assert.match(src, /if \(builtText === correctAnswer\.trim\(\)\)[\s\S]*?setCheckState\("correct"\)[\s\S]*?else \{[\s\S]*?setCheckState\("wrong"\)/);
});

test("Build Phrase wrong-state remains legible in light mode", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const cssSrc = source("src/index.css");

  assert.match(lessonSrc, /build-phrase-repair-area/);
  assert.match(lessonSrc, /build-phrase-wrong-token/);
  assert.match(cssSrc, /html\[data-theme="light"\] \.build-phrase-wrong-token[\s\S]*?color: #881337/);
});

test("learner-facing lesson prompts are not forced into uppercase", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.doesNotMatch(src, /uppercase[^\n]*\{instructionLabel\}/);
  assert.doesNotMatch(src, /uppercase[^\n]*\{block\.prompt\}/);
  assert.match(src, /text-\[13px\] text-zinc-500 leading-snug">\{block\.prompt\}/);
  assert.match(src, /text-\[12px\] text-zinc-500 leading-snug mb-2">\{block\.prompt\}/);
});

test("in-progress lesson position is persisted per account and restored by block identity", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const gameSrc = source("src/stores/gameStore.js");

  assert.match(gameSrc, /lessonProgress:\s*\{\}/);
  assert.match(gameSrc, /setLessonProgress:\s*\(lessonId, blockId, blockIndex, userId\)/);
  assert.match(gameSrc, /delete nextLessonProgress\[lessonId\]/);
  assert.match(lessonSrc, /lessonProgress\?\.\[lesson\.id\]/);
  assert.match(lessonSrc, /blocks\.findIndex\(\(candidate\) => candidate\?\.id === saved\.blockId\)/);
  assert.match(lessonSrc, /setLessonProgress\(lesson\.id, currentBlock\.id, blockIndex, userId\)/);
});


test("lesson and admin resets persist the intended account state instead of using logout reset", () => {
  const settingsSrc = source("src/views/SettingsView.jsx");
  const gameSrc = source("src/stores/gameStore.js");

  assert.match(settingsSrc, /const resetLessonProgress = useGameStore\(\(s\) => s\.resetLessonProgress\)/);
  assert.match(settingsSrc, /const resetAllProgress = useGameStore\(\(s\) => s\.resetAllProgress\)/);
  assert.doesNotMatch(settingsSrc, /gameReset\(\)[\s\S]*?gameSave\(user\?\.id\)/);

  assert.match(
    gameSrc,
    /resetLessonProgress:\s*async \(userId\)[\s\S]*?completedLessonIds:\s*\[\][\s\S]*?seenModuleCompleteIds:\s*\[\][\s\S]*?seenSectionCompleteIds:\s*\[\][\s\S]*?lessonProgress:\s*\{\}[\s\S]*?await get\(\)\._save\(userId\)/
  );

  assert.match(
    gameSrc,
    /resetAllProgress:\s*async \(userId\)[\s\S]*?_loadedForUserId:\s*userId[\s\S]*?await get\(\)\._save\(userId\)/
  );
});


test("Scenario V2 reply cards submit directly without a separate Choose button", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /role="button"[\s\S]*?aria-label=\{\`Choose reply:/);
  assert.match(src, /onClick=\{chooseOption\}/);
  assert.match(src, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(src, /scenario-v2-option rounded-2xl[\s\S]*?\{option\.text\}/);
  assert.doesNotMatch(src, /scenario-v2-option rounded-2xl[\s\S]*?<InteractivePhraseText text=\{option\.text\}/);
  assert.doesNotMatch(src, />Choose<\/button>/);
});


test("Say It Out Loud uses Speechmatics Realtime while other STT callers retain the OpenAI default", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const sttSrc = source("src/hooks/useSpeechToTextHold.js");

  assert.match(lessonSrc, /transcriptionUrl:\s*"\/api\/stt-speechmatics"/);
  assert.match(lessonSrc, /transcriptionPayload:\s*"wav"/);
  assert.match(lessonSrc, /transcriptionPrompt:\s*null/);
  assert.match(lessonSrc, /transcriptionKeywords:\s*\[\]/);
  assert.match(lessonSrc, /minRecordingMs:\s*250/);

  assert.match(sttSrc, /transcriptionUrl = "\/api\/stt"/);
  assert.match(sttSrc, /transcriptionPayload = "multipart"/);
  assert.match(sttSrc, /if \(transcriptionPayload === "wav"\)/);
  assert.match(sttSrc, /speechBlobToMonoWav\(blob\)/);
  assert.match(sttSrc, /fd\.append\("languages\[\]", language\)/);
  assert.match(sttSrc, /fd\.append\("keywords\[\]", keyword\)/);
});

test("lesson mic does not abort an active hold when pointer capture is lost during mic acquisition", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /const handleLostPointerCapture = \(event\) => \{[\s\S]*?do not cancel an otherwise valid take/);
  assert.match(src, /window\.addEventListener\("pointerup", handleWindowPointerUp\)/);
  assert.match(src, /window\.addEventListener\("pointercancel", handleWindowPointerCancel\)/);
  assert.match(src, /select-none touch-none/);
});


test("lesson speech checks keep retry feedback local so mic holds are not blocked by toasts", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const sttSrc = source("src/hooks/useSpeechToTextHold.js");

  assert.match(lessonSrc, /showCapturedToast:\s*false/);
  assert.match(lessonSrc, /showNoSpeechToast:\s*false/);
  assert.match(lessonSrc, /onNoSpeech:\s*\(\) => \{[\s\S]*?setAttemptState\("not_caught"\)/);
  assert.match(lessonSrc, /Didn't catch that\. Hold the mic and try again\./);

  assert.match(sttSrc, /showCapturedToast = true/);
  assert.match(sttSrc, /showNoSpeechToast = true/);
  assert.match(sttSrc, /if \(showCapturedToast\) showToast\?\.\("Speech captured"\)/);
  assert.match(sttSrc, /onNoSpeech\?\.\(\);[\s\S]*?showNoSpeechToast \? "Didn't catch that — try again" : null/);
});


test("Scenario V2 focused mode shows the full scene setup instead of truncating it", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /\{block\.sceneIntro \|\| block\.goal\}/);
  assert.match(src, /text-\[12px\] leading-snug text-zinc-500/);
  assert.doesNotMatch(src, /mt-0\.5 truncate text-\[12px\] text-zinc-500/);
});


test("learner course browser uses real progress state instead of content active/dev shortcuts", () => {
  const sectionSrc = source("src/views/training/LearningSectionView.jsx");
  const moduleSrc = source("src/views/training/LearningModuleView.jsx");
  const homeSrc = source("src/views/training/LearningHome.jsx");
  const trainingSrc = source("src/views/TrainingView.jsx");

  assert.match(sectionSrc, /getSectionBrowseState\(section, completedLessonIds\)/);
  assert.match(sectionSrc, /Section checkpoint —/);
  assert.match(sectionSrc, /status !== "locked"/);
  assert.doesNotMatch(sectionSrc, /status=\{module\.status\}/);

  assert.doesNotMatch(moduleSrc, /devMode/);
  assert.match(moduleSrc, /allLessonsDone[\s\S]*\? "current"[\s\S]*: "locked"/);

  assert.match(homeSrc, /getCourseBrowseState\(allSections, completedLessonIds\)/);
  assert.match(homeSrc, /<SmallMetaPill>Locked<\/SmallMetaPill>/);
  assert.match(homeSrc, /mod\.isSectionCheckpoint/);

  assert.match(trainingSrc, /onOpenCheckpoint=\{\(checkpointId\) =>/);
});


test("Scenario V2 keeps the reply tray mounted while system/help turns are playing", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /\{!complete && step \? \([\s\S]*?scenario-v2-reply-tray/);
  assert.match(src, /aria-busy=\{!activeSpeakerReady\}/);
  assert.match(src, /optionDisabled = !activeSpeakerReady \|\| !!selectedOptionForStep/);
  assert.match(src, /\[history, stepIndex, turnPhase, followUpPhase, helpPhase, helpTurn, finalPhase, finalTurn, complete\]/);
});


test("Scenario V2 can reveal accumulated meaning as a text-only help endpoint", () => {
  const src = source("src/views/training/ScenarioV2Block.jsx");

  assert.match(src, /function ScenarioV2TranslationReveal/);
  assert.match(src, /Meaning revealed/);
  assert.match(src, /translationReveal: helpTurn\.translationReveal \|\| null/);
  assert.match(src, /showTranslationReveal = phase === "speaker"/);
});

test("conversation turn speaker labels remain readable on mobile", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /w-\[82px\][^\n]*break-words/);
  assert.match(src, /text-\[15px\] leading-snug flex-1 min-w-0 break-words/);
  assert.doesNotMatch(src, /w-14 pt-\[3px\]/);
});

test("Build Phrase gives token-level guided repair after a wrong check", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /const getBuiltTokenStatus = \(tokenId, index\)/);
  assert.match(src, /token\.correctIndex === index \? "correct" : "wrong"/);
  assert.match(src, /const repairDiagnosis = \(\(\) =>/);
  assert.match(src, /token\.repairHint/);
  assert.match(src, /getBuildPhraseDistractorMeaning\(token\.text\)/);
  assert.match(src, /means “\$\{meaning\}”/);
  assert.doesNotMatch(src, /This position needs “\$\{expected\.text\}”/);
  assert.match(src, /right word, right place/);
  assert.match(src, /change or move/);
  assert.match(src, /diagnosticStatus === "correct"/);
  assert.match(src, /diagnosticStatus === "wrong"/);
});

test("Build Phrase repair mode stays active while the learner edits the phrase", () => {
  const src = source("src/views/training/LearningLessonView.jsx");
  const buildPhrase = src.slice(
    src.indexOf("function BuildPhraseBlock"),
    src.indexOf("function ConversationBubble")
  );

  assert.doesNotMatch(buildPhrase, /setBuilt\(\(prev\) => \[\.\.\.prev, token\.id\]\);\s*if \(checkState !== "idle"\) setCheckState\("idle"\)/);
  assert.doesNotMatch(buildPhrase, /setBuilt\(\(prev\) => prev\.filter\(\(x\) => x !== id\)\);\s*setCheckState\("idle"\)/);
});

test("lesson scoring counts objective blocks once and Section Complete uses persisted section metrics", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const trainingSrc = source("src/views/TrainingView.jsx");
  const gameSrc = source("src/stores/gameStore.js");

  assert.match(lessonSrc, /countScoreableBlocks\(lesson\)/);
  assert.match(lessonSrc, /setWrongBlockIds\(\(prev\) => prev\[currentBlock\.id\]/);
  assert.match(lessonSrc, /completeLesson\(lesson\.id, userId, \{/);
  assert.match(lessonSrc, /function BuildPhraseBlock\([^)]*onWrongAnswer/);
  assert.match(lessonSrc, /setCheckState\("wrong"\);\s*onWrongAnswer\?\.\(\)/);
  assert.match(lessonSrc, /function WordMatchBlock\([^)]*onWrongAnswer/);

  assert.match(trainingSrc, /aggregateSectionMetrics\(sec, lessonMetrics\)/);
  assert.match(trainingSrc, /sectionXpEarned/);
  assert.match(trainingSrc, /accuracyPct: sectionMetrics\?\.accuracyPct \?\? null/);

  assert.match(gameSrc, /lessonMetrics: \{\}/);
  assert.match(gameSrc, /completeLesson: \(lessonId, userId, metrics = null\)/);
  assert.match(gameSrc, /!currentMetrics\[lessonId\] && metrics/);
});

test("Say It Out Loud keeps transcription unbiased by prompts and expected-phrase vocabulary", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /phraseMatchesSpeech\(captured, targetText\)/);
  assert.match(src, /transcriptionPrompt:\s*null/);
  assert.match(src, /transcriptionKeywords:\s*\[\]/);
  assert.doesNotMatch(src, /Do not infer, complete, or guess an expected practice phrase/);
  assert.doesNotMatch(src, /transcriptionKeywords:\s*targetText \? \[targetText\] : \[\]/);
});

test("Say It Out Loud failure status stays readable in light mode", () => {
  const lessonSrc = source("src/views/training/LearningLessonView.jsx");
  const cssSrc = source("src/index.css");

  assert.match(lessonSrc, /say-it-fail-status/);
  assert.match(cssSrc, /html\[data-theme="light"\] \.say-it-fail-status[\s\S]*?color: #78350f/);
});



test("Say It Out Loud keeps dev-only transcript diagnostics while Speechmatics owns acceptance", () => {
  const src = source("src/views/training/LearningLessonView.jsx");

  assert.match(src, /speechDebugEnabled/);
  assert.match(src, /zodis\.app/);
  assert.match(src, /www\.zodis\.app/);
  assert.match(src, /STT heard:/);
  assert.match(src, /Matcher:<\/span> accepted|Matcher:<\/span> rejected|Matcher:/);
  assert.match(src, /phraseMatchesSpeech\(captured, targetText\)/);
  assert.doesNotMatch(src, /OpenAI heard:/);
  assert.match(src, /transcriptionUrl:\s*"\/api\/stt-speechmatics"/);
});


test("Speechmatics primary lesson STT keeps the API key server-side and uses low-latency Lithuanian realtime transcription", () => {
  const apiSrc = source("api/stt-speechmatics.js");
  const hookSrc = source("src/hooks/useSpeechToTextHold.js");
  const packageSrc = source("package.json");

  assert.match(apiSrc, /process\.env\.SPEECHMATICS_API_KEY/);
  assert.match(apiSrc, /createSpeechmaticsJWT/);
  assert.match(apiSrc, /new RealtimeClient/);
  assert.match(apiSrc, /model: "enhanced"/);
  assert.match(apiSrc, /max_delay: 0\.7/);
  assert.match(apiSrc, /audio_format:\s*\{\s*type: "file"/);
  assert.match(apiSrc, /client\.sendAudio/);
  assert.match(apiSrc, /client\.stopRecognition\(\{ noTimeout: true \}\)/);
  assert.doesNotMatch(apiSrc, /asr\.api\.speechmatics\.com\/v2\/jobs/);

  assert.doesNotMatch(hookSrc, /SPEECHMATICS_API_KEY/);
  assert.match(hookSrc, /speechBlobToMonoWav/);
  assert.match(hookSrc, /new Blob\(\[wav\], \{ type: "audio\/wav" \}\)/);
  assert.match(hookSrc, /"Content-Type": "audio\/wav"/);
  assert.match(hookSrc, /requestBody = await speechBlobToMonoWav\(blob\)/);
  assert.match(hookSrc, /body: requestBody/);

  assert.match(packageSrc, /"@speechmatics\/auth"/);
  assert.match(packageSrc, /"@speechmatics\/real-time-client"/);
});

# Learning regression contract

This contract protects established Žodis learning behaviour while lesson wording, vocabulary coverage, and Scenario V2 content are revised.

## Non-negotiable behaviour

1. **Tap-word audio remains available on Lithuanian learning text.**
   - Lesson teaching content must continue to render Lithuanian through `InteractivePhraseText` where the current experience supports word taps.
   - Scenario V2 revealed Lithuanian speaker lines, learner history and Lithuanian feedback/better answers retain word audio.
   - Scenario V2 answer cards deliberately use direct selection (tap, Enter or Space). They do not expose pre-answer word-audio controls or a separate Choose button.
   - Comprehension choices may be English. They remain silent assessment text; authored Lithuanian `learnerText` is recorded as the learner's dialogue. English help is not sent to Lithuanian TTS.
   - Whole-line replay remains available where it exists today.

2. **Lesson and scenario progression behaviour is not silently changed by content work.**
   - Scenario V2 result handling keeps the authored `best`, `acceptable`, `awkward`, `repair`, and `wrong` semantics.
   - Curriculum edits must not bypass completion, scoring, retry, helper-text, or natural-ending behaviour.

3. **Vocabulary retention remains opt-in.**
   - Completing a lesson does not directly add phrases to the user's Library.
   - Module/section completion continues to offer the Save to Library step.
   - The learner can select only the words/phrases they want and can skip the step.

4. **Already-saved Lithuanian cannot be saved again from the lesson retention screen.**
   - Duplicate identity is based on normalised Lithuanian text, not the English gloss.
   - Deleted/tombstoned entries do not count as active duplicates.
   - Active duplicates are labelled **In library**, disabled, excluded from Select all, and filtered out again at save time.
   - New curriculum wording must use the existing identity rules rather than inventing alternate duplicate paths.

5. **Content changes must not mutate existing Library data merely because a lesson is opened or completed.**

6. **Assessment follows meaningful teaching, including wrong options.**
   - Personalised age language comes from the actual runtime profile builder, with correct number/year agreement for ages 1–99; it is taught before production. Numeric recognition must not pass a different age.
   - An already-known base word may anchor a changed form in a Pattern note without becoming a new Learn card again (`vaistai` → `vaistų`).
   - 5.3.5 explicitly teaches `ieškoti`, `ieškote` and the hotel question after the familiar `viešbučio` form; a blanket ban on Learn blocks there is obsolete.
   - Visible support is allowed where deliberately authored to scaffold a weakly introduced phrase. Do not restore a blanket ban or automatically reveal all meanings. Existing 3.3, 3.4.5 and travel-closing support is retained; broader scenario-quality review remains in later chunks.

7. **Build Phrase diagnoses attempted answers instead of blocking them.**
   - Empty attempts cannot be submitted. Every non-empty incomplete or overfilled attempt can be checked and receives repair feedback; only the correct phrase completes the block.
   - Every distractor token resolves to a useful learner-facing meaning through the shared authored meaning dictionary. An authored contextual `repairHint` takes precedence when present.
   - Do not weaken the course-wide metadata integrity test to excuse missing meanings.

8. **Match Pairs preserves meaningful authored grouping.**
   - The approved 5.3 checkpoint has 24 pairs in six semantic groups; do not trim it to meet an obsolete 18–22 assertion.
   - Authored groups cover each pair exactly once, have readable labels and fit the existing page capacity. Do not add filler to equalise groups. Ordinary ungrouped recaps remain roughly 20 pairs.

## C1 verification and test intent

The original 16 failing tests are individually accounted for in `BETA3_C1_IMPLEMENTATION.md`. Brittle instruction-label, vocabulary-save and direct-selection assertions are replaced by tests that execute component render/event/state paths with isolated imports. These tests do not claim browser layout, real audio or DOM lifecycle coverage. Build Phrase tests exercise incomplete, overfilled and correct submissions plus all repaired distractor occurrences. Full-course integrity still checks every distractor, Learn uniqueness and grouped recap coverage.

Later approved directions (STT helper removal, post-evaluation Lithuanian audio for English answers, whole-phrase slow playback, and the full-screen scenario introduction) belong to C2. They are not implemented or claimed by this C1 baseline.

## Change gate for curriculum batches

Before a curriculum/content batch is considered complete:

- `npm test` passes.
- `npm run build` passes.
- Vercel preview/build is green.
- The batch does not intentionally alter any invariant above unless that behaviour change is separately agreed first.

The automated contract tests live in `tests/learningRegressionContracts.test.mjs`. They are deliberately structural as well as behavioural: if a future refactor changes an implementation path, update the test only after confirming the protected user behaviour still exists.

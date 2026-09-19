# Learning regression contract

This contract protects established Žodis learning behaviour while lesson wording, vocabulary coverage, and Scenario V2 content are revised.

## Non-negotiable behaviour

1. **Tap-word audio remains available on Lithuanian learning text.**
   - Lesson teaching content must continue to render Lithuanian through `InteractivePhraseText` where the current experience supports word taps.
   - Scenario V2 speaker lines, learner replies, reply choices, and feedback/better-answer Lithuanian must retain the same interactive audio path.
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

## Change gate for curriculum batches

Before a curriculum/content batch is considered complete:

- `npm test` passes.
- `npm run build` passes.
- Vercel preview/build is green.
- The batch does not intentionally alter any invariant above unless that behaviour change is separately agreed first.

The automated contract tests live in `tests/learningRegressionContracts.test.mjs`. They are deliberately structural as well as behavioural: if a future refactor changes an implementation path, update the test only after confirming the protected user behaviour still exists.

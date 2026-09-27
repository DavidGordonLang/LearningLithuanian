# Žodis Beta 3 — C4 Match Pairs implementation

## Scope and provenance

Starting remote/local `dev`: `440f1e4fbf6d1eb372d33046742909e55ab31e17`; verified before editing. Stage 1 issue register, C1–C3 implementation reports, learning regression contract, all three live Continuity/project documents, both matching implementations, styles, curriculum data and tests were reread. C4 addresses **ZB3-16, ZB3-17 and ZB3-27**. No C5 or later work was started.

Implementation SHA: **`dbdf1e03ec604da34c57bfcd2400edd8b2de3eaa`**. Final handoff SHA is the documentation-only verification commit containing this updated report and is stated in the handoff; application code is unchanged. No database/schema/user data operations and no production promotion.

## Mechanics: before and after

Both the lesson `word_match` session and standalone Training Match Pairs changed. Previously an opposite-side tap set a global `busy` state, waited 140 ms for amber, then held input for a 520 ms correct or 420 ms wrong pulse. Another legitimate tap could be ignored for roughly 660 ms after a correct match or 560 ms after a wrong match. The lesson also capped authored page completion with `Math.min(pagePairs, page.length)`, which would finish a future six-pair authored page after five.

Now an opposite-side choice is evaluated immediately. Wrong feedback pulses red and records the mistake without audio, while the next available tile can be selected at once. A correct pair is counted, disabled against reuse and spoken in Lithuanian once immediately; its green pulse remains visible while the learner can start another available pair. A small synchronous interaction ref prevents rapid repeated taps from double-counting before React rerenders. Same-side taps replace the selection; retapping the selected tile clears it. Old pulse timers can clear only their own pulse. Completing a page gates input immediately, displays the last pulse, then fades to the next authored page; stale tile taps cannot land in the new page. Final completion fires once. Completion checks the **actual page length**, even in an invalid six-pair authored fixture.

The lesson renderer still calls `onWrongAnswer` once for a block containing any mismatch, so C3's persisted wrong-block evidence and resumed accuracy remain intact. Both renderers preserve correct-pair Lithuanian audio and no wrong-pair audio. Text retains wrapping and automatic tile height; standalone mobile overflow scrolls rather than clipping enlarged text. Standalone Training continues to filter **Words / Numbers**; phrases remain excluded. No score pressure, timer mechanic or phrase practice was introduced.

## All 27 lesson/checkpoint recap blocks

The Stage 1 audit counted 27 and the full module-plus-section-checkpoint integrity scan confirms 27. **Twenty-five** blocks that previously had random global pools received `pairPages`: `s1m1c_b10`, `s1m2l5_b2`, `s1m2c_b10`, `s1m3c_b10`, `s1m4c_b8`, `s1c_b17`; `s2m1c_b7`, `s2m2c_b7`, `s2m4c_b7`, `s2c_b10`; `s3m1l2_b7`, `s3m1c_b7`, `s3m2c_b7`, `s3m3c_b7`, `s3m4c_b7`, `s3c_b11`; `s4m1c_b10`, `s4m2c_b7`, `s4m3c_b10`, `s4m4c_b7`, `s4c_b13`; `s5m1c_b7`, `s5m2c_b7`, `s5m4c_b7`, `s5cp_b9`.

The two existing good authored examples, `s2m3c_b7` masculine/feminine recap and `s5m3c_b7` 24-pair movement/location recap, were deliberately left intact. Their four-pair families already meet the rule; the latter's full 24 items are preserved.

Groups follow useful families: greetings/replies, people and register, requesting/ability, number ranges, time questions/answers, cash/card and payment, café modifiers with/without, preferences/problem repair, place questions and direction/transport forms. Small earlier-review pages are explicitly labelled as such where mixed spaced retrieval is intentional. Pages of **3–5** items are allowed; no vocabulary or filler was added to equalise lengths. The only pair removed was an **exact duplicate** `Ko norėtumėte? / What would you like?` (`m18`) in 4.1.C. The two distinct Lithuanian time questions sharing English “What time is it?” in 3.3.C now live on different pages so neither page can mark an indistinguishable English tile wrong. All other authored pair meanings and audio texts were retained. These page labels and allocation are editorial English grouping, not new Lithuanian teaching.

Curriculum integrity now checks unique pair IDs, unique authored page IDs, exact one-time coverage of every real pair ID, 1–5 items per authored page, and no visually identical LT or EN tile on the same page. It does not demand exactly five or an equal page size. Representative semantic families across Sections 2–5 and independent LT/EN shuffling within a group are regression-tested.

## C3 identity and an out-of-scope release risk

C4 changes grouping metadata and deletes one duplicate pair under an existing `word_match` block; lesson/block IDs and types are unchanged. The structural curriculum ID remains **`beta3-1-692cd95b`**. No epoch bump or account reset is justified for this non-new-language grouping change. The final semantic epoch should be deliberately reviewed/locked after C5–C8 and before C9/release. No old user progress was migrated or reset.

The all-27 audit exposed a **separate, pre-existing C3 progression defect**: `src/content/learning/section5/checkpoint_5.js` lacks the `isSectionCheckpoint`/active checkpoint metadata present on Sections 1–4. Consequently the C3 `curriculumLessons` manifest has 114 entries and omits `section_5_checkpoint`; its completion/resume validation rejects that ID, and course-home traversal looks for the missing marker. This is materially release-blocking for the final checkpoint. It was **not repaired in C4** because doing so would change curriculum structure/fingerprint and learner progress identity, outside this chunk's authorised matching scope. A bounded C3 follow-up must fix the metadata and verify final-checkpoint discovery, completion/resume, and the resulting explicit epoch/clean-start behaviour before Beta 3 release. The C4 integrity test separately includes every section checkpoint and did group `s5cp_b9` correctly. Do not treat green C4 matching tests as evidence that final-checkpoint progression is fixed.

No additional untaught-Lithuanian or translation judgment was made while grouping. Broader pedagogy/content issues remain with C5–C8. If Barbora wants to adjust an English group label during native review, that can be done in the owning content pass without changing pair meanings.

## Verification and small physical check

- Focused behavioural coverage executes both real matching session implementations with deterministic timers: first/second/same-side taps, wrong and correct, immediate recovery, active pulse plus next selection, duplicate/matched tile protection, page fade input gate, final completion, correct-only audio, one wrong lesson block and six-pair defensive completion. The standalone renderer is checked for Words/Numbers-only filtering and correct audio once.
- Curriculum integrity scans all 27 blocks; representative semantic and shuffle checks span multiple sections. C1–C3 Node tests remain unmodified except the additive matching tests/integrity rule and the component harness's named-export support.
- Full Node suite: **340 passed, zero failed/skipped/cancelled** (`npm test`), including the existing curriculum integrity checks. Production Vite build: **PASS**, 224 modules (existing bundle-size advisory only). `git diff --check`: **PASS**.
- GitHub **Quality Gate PASS** for the implementation SHA: [run 36261085533](https://github.com/DavidGordonLang/LearningLithuanian/actions/runs/36261085533), including Node tests and production build. Vercel dev preview **READY**, `dpl_6EU2Y7dfkR9UQD8p5bhopYYKzcEq`, matching that SHA: [open preview](https://learning-lithuanian-bo9i1vubq-davids-projects-25f8617a.vercel.app). Target is preview, not production. This documentation-only status commit's checks/deployment are verified in the final handoff. No physical Android C4 test is claimed.

After the dev preview is READY, a small Android PWA check is enough: (1) in 3.3.C or 4.2.C match one pair and tap the next immediately while green is still visible; (2) deliberately mismatch, then recover immediately while red is visible, and confirm final lesson scoring includes that wrong block; (3) let a grouped page finish and check the next page label/items, then do one standalone Words/Numbers match. Check narrow-screen text wrapping and actual touch responsiveness. There is no need to replay 27 exercises.

## Exact changed files

- `docs/BETA3_C4_IMPLEMENTATION.md`; `docs/LEARNING_REGRESSION_CONTRACT.md`.
- `src/content/learning/section1/{checkpoint_1,module_1_1,module_1_2,module_1_3,module_1_4}.js`.
- `src/content/learning/section2/{checkpoint_2,module_2_1,module_2_2,module_2_4}.js`.
- `src/content/learning/section3/{checkpoint_3,module_3_1,module_3_2,module_3_3,module_3_4}.js`.
- `src/content/learning/section4/{checkpoint_4,module_4_1,module_4_2,module_4_3,module_4_4}.js`.
- `src/content/learning/section5/{checkpoint_5,module_5_1,module_5_2,module_5_4}.js`.
- `src/hooks/training/useMatchPairsSession.js`; `src/views/training/LearningLessonView.jsx`; `src/views/training/MatchPairsView.jsx`.
- `tests/c4MatchPairs.test.mjs`; `tests/curriculumIntegrity.test.mjs`; `tests/helpers/componentHarness.mjs`.

**Stop after C4; C5 was not started.**

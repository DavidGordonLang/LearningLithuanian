# Beta 3 — C9 final release verification

## Scope, sources and release status

**READY WITH EXPLICIT NON-BLOCKING ITEMS.** No unresolved P0/P1 defect was found. This is a release candidate for Aiden's review and David's separate Beta-release decision, not production approval. The final installed-PWA integration check remains with David; the invite-only dev preview prevented an unauthenticated browser lesson walkthrough. The bounded C7 native wording preference remains open. Standalone Training Match Pairs and Exam Prep remain agreed **Coming soon** scope.

- Starting clean remote `dev`: `0e65234cb767547a85004a3fdbda8d74de698feb`.
- Epoch/test application commit on `dev`: `f60887003551ff78a3c489374fadec3bdd7bb2fa` (tree `cbd9466c0213e3bf199c6e4987d9b7047d59c220`). The equivalent local commit is `ead840d276bae65948c67ae736fd49e83a444d3a`; the connected GitHub write path produced the same tree because direct git credentials were unavailable.
- Final handoff: the subsequent documentation-only commit containing this report; its literal SHA is provided with the handoff because a commit cannot contain its own SHA. It has no application changes.
- Sources re-read: all three live Continuity/Current/Project documents, the entire authoritative Stage 1 audit (issue register 01–32, durable-rule propagation matrix, implementation plan), `docs/LEARNING_REGRESSION_CONTRACT.md`, C1–C8 and pre-C5 reports, current curriculum/progress/audio/scenario code and regression suites. Prior reports were used as leads; dispositions below were checked against current source and passing tests. No discretionary lesson rewrite or shared-engine refactor was made.

## Re-derived inventory and identity

| Measure | Current `dev` after epoch lock |
|---|---:|
| Sections / teaching modules | 5 / 20 |
| Teaching lessons / module checkpoints / section checkpoints | 90 / 20 / 5 |
| Catalogue units / unique lesson IDs | **115 / 115** |
| Blocks / unique block IDs | **777 / 777** |
| Scenario V2 conversations / decision turns | **108 / 352** |
| Pattern notes / Match Pairs blocks | **82 / 27** |
| Structural fingerprint | `62733640` |
| `CURRICULUM_EPOCH` | `beta3-2` (was `beta3-1`) |
| `CURRICULUM_ID` | **`beta3-2-62733640`** (was `beta3-1-62733640`) |

Section block counts are 193, 124, 167, 144 and 149 respectively. David, Barbora and default profile factories yield the same 115 lesson IDs and 777 block IDs/types; profile-specific age language remains distinct and tested. The C9 edit changed only the explicit epoch in application code, so the structural fingerprint stayed `62733640`. This is the single planned semantic lock for C5–C8 edits beneath stable IDs. `curriculumProgress.js` rejects an old `curriculumId` on hydration and attempt resume; `gamePersistence.js` namespaces `learningCurricula` by current ID. It does not delete the old JSON, settings or personal Library. Synthetic account A/B tests verify that new progress writes normally and old partial attempts cannot attach to current lessons. No real learner row was touched.

## Complete Stage 1 issue-register closure

`CLOSED` means the current resulting implementation and the named regression evidence were checked, not merely the historical report. C1–C8 physical passes are the user-provided learner/device evidence; C9 did not claim a new Android pass.

| ID | C9 disposition and current evidence |
|---|---|
| ZB3-01 | **CLOSED — verified.** Profile-specific age examples remain correct in the profile factory; `profileAge.test.mjs`, curriculum integrity and C1 contracts pass. |
| ZB3-02 | **CLOSED — verified.** Base nouns precede useful transformed forms in the repaired Sections 1–4; `c5Sections12`, `c6Section3`, `c7Section4` and integrity contracts pass. |
| ZB3-03 | **CLOSED — verified.** Incidental untaught answer/distractor forms were replaced or bridged through C1/C5/C6/C8; focused content and route tests pass, including Section 5 `arba`, `stotyje` and `prie` dispositions. |
| ZB3-04 | **CLOSED — verified.** Hidden register/gap information is provided before assessment in the repaired C5/C8 targets; `c5Sections12` and `c8Section5` pass. |
| ZB3-05 | **CLOSED — verified.** Authored valid alternatives use progressing `acceptable`/`awkward` rather than a wrong penalty; C2 result semantics and C5–C8 content contracts pass. |
| ZB3-06 | **CLOSED — verified.** C5 removed the invented assumption about a friend's origin from the learner profile; `c5Sections12` protects the authored scene fact. |
| ZB3-07 | **CLOSED — verified.** Quantity/order/payment and preference facts precede keyed answers in Sections 3–4; `c6Section3` and `c7Section4` pass. |
| ZB3-08 | **CLOSED — verified.** Price, temperature, taste, enough and walk stances are grounded before subjective answers across C6–C8; focused Section 3–5 tests pass. |
| ZB3-09 | **CLOSED — verified.** 4.3.1 tea-order flow no longer carries cold-coffee scene copy; chronological Section 4 scenarios and `c7Section4` pass. |
| ZB3-10 | **CLOSED — verified.** 5.C traveller asks for the bus stop after learning the airport is far; adviser language is not keyed as a traveller response; `c8Section5` and final-checkpoint progression pass. |
| ZB3-11 | **CLOSED — verified.** Genuine receptive turns use close silent English meanings and authored Lithuanian learner continuation; production tasks remain production. C2/C5/C6/C8 comprehension tests pass. |
| ZB3-12 | **CLOSED — verified.** C5–C8 reviewed section scenarios (108 total); focused scenario contracts check local feedback, chronology, plausible known-language choices and branching; Scenario V2 tests pass. C9 sampled representative resulting flows and count/integrity rather than rereading all 108. |
| ZB3-13 | **CLOSED — superseded by repaired assessment.** C5 replaced the three retired dialogue-gap blocks with the approved learner task; current content and `c5Sections12` protect the replacements. |
| ZB3-14 | **CLOSED — verified.** Nearby practical transformations replace stale or contradictory Pattern claims; C5–C7 content tests and `learningRegressionContracts` pass. |
| ZB3-15 | **CLOSED — verified.** Hidden/editorial explanation is learner-visible where needed and internal curriculum copy removed; C5–C8 focused Pattern contracts pass. |
| ZB3-16 | **CLOSED — verified.** C4 assigns unique pair identity so visually identical matching tiles cannot falsely score a correct selection wrong; `c4MatchPairs` passes. |
| ZB3-17 | **CLOSED — verified.** Authored Match Pairs pages preserve semantic groups, identity and exact coverage without identical labels on a page; `c4MatchPairs` and curriculum integrity pass. |
| ZB3-18 | **CLOSED — verified.** C1/C5–C8 distinguished useful spaced production from duplicate teaching/checkpoints and retained retrieval where justified; focused content contracts pass. |
| ZB3-19 | **CLOSED — verified.** Named Section 3–5 display/audio lexical mismatches remain aligned, including distance, payment and ordering items; `c6Section3`, `c7Section4`, `c8Section5` and audio tests pass. |
| ZB3-20 | **CLOSED — verified.** Build Phrase distractor meanings and reconstructable targets are covered by C1/integrity; incomplete submissions can be checked and scored wrong in `trainingScoring`/C1. |
| ZB3-21 | **CLOSED — verified.** C2 result classification and feedback/scoring distinguish `best`, `acceptable`, `awkward`, `wrong`; C2 and content soft-pass tests pass. |
| ZB3-22 | **CLOSED — verified.** Slow whole-phrase playback remains available; `audioPlayback` and C2 interaction contracts pass. |
| ZB3-23 | **CLOSED — verified.** Word-level feedback/highlight timing follows the C2 speech/audio path; `speechMatch`, `audioPlayback` and C2 tests pass. |
| ZB3-24 | **CLOSED — verified.** English assessment stays silent; authored Lithuanian answer/learner audio plays only after evaluation. C2 engine and C5–C8 authored metadata tests pass. |
| ZB3-25 | **CLOSED — verified.** Ordinary preview learners no longer see STT diagnostic panels; C2 interaction and learner-facing rendering contracts pass. |
| ZB3-26 | **CLOSED — verified.** Scenario V2 opens with the reusable full-screen intro/Start phase and safe mobile presentation; `scenarioSync`, C2 and focused rendering contracts pass. |
| ZB3-27 | **CLOSED — verified for in-lesson scope.** C4 repaired lesson/checkpoint Match Pairs and mobile transitions. Standalone Training Match Pairs is an **intentional approved Coming soon product deferral**, not an unclosed Beta lesson defect. |
| ZB3-28 | **CLOSED — verified.** C3 resume/score/Review and pre-C5 final-checkpoint persistence contracts pass; final 5.C stays active in the 115-unit catalogue. |
| ZB3-29 | **CLOSED — verified.** C3 version/account scoped local/cloud conflict handling and C9 epoch staleness tests pass; stale acknowledgements cannot save newer state. |
| ZB3-30 | **CLOSED — verified.** C1–C8 updated regression expectations to approved course intent; full current 372-test suite, curriculum integrity, catalogue uniqueness and referenced branches pass together. |
| ZB3-31 | **CLOSED — verified.** PWA freshness detects new bundles and defers unsafe active-lesson reload; `pwaFreshness.test.mjs` passes. |
| ZB3-32 | **CLOSED — verified.** C3 handles failed progress loads/writes visibly instead of silently reporting success; `c3ProgressReliability`, `accountStorage` and cloud conflict tests pass. |

**P0/P1:** none unresolved. **P2:** no unapproved open Stage 1 P2 defect (13, 15, 17, 18, 20, 22, 23, 27, 31 were rechecked above). The distinct approved Coming soon product scope is Standalone Training Match Pairs and Exam Prep. No new deferral was invented.

## Durable-rule and interaction reconciliation

| Rule family | Current verification |
|---|---|
| Teaching order and changed forms | Section content contracts check base-word-first and narrow bridges, including number, ordering and place/direction forms. Retrieval is not treated as new teaching. |
| Scenario facts and alternatives | C5–C8 check destination, quantity, payment, order, route, subjective stance and register before keyed decisions; C2 result-type tests ensure soft passes progress without a wrong penalty. |
| Receptive meaning and representation | C2/C5/C6/C8 check close English assessment, no English route spoiler, silent pre-answer English, Lithuanian `learnerText`/audio after evaluation and no wrong English line in history. Genuine Lithuanian production remains. |
| Pattern notes and helpers | Focused section contracts protect beginner-facing practical bridges and staged support, with English only at the late reveal. |
| Audio/text and scenario sequencing | Corrected lexical payloads remain under C6–C8 normalized-content assertions. Cross-course inspection found one intentional two-form Learn display (`eurai / eurų`) with base-form `eurai` audio, plus English wrapper prompts whose audio contains only the quoted Lithuanian; no unexplained known-target lexical mismatch. C2/Scenario tests protect post-evaluation audio and next-speaker order. Ordinary learner STT diagnostics remain absent. |
| Match Pairs | C4 tests protect quick safe taps, one correct-pair audio, wrong scoring, authored page grouping, unique identity, exact coverage, safe transitions and mobile layout. All 27 current blocks remain in catalogue/integrity. |
| Build Phrase | C1/integrity reconstruct targets and require distractor meanings; incomplete Check produces a wrong block, retained through persistence/Resume. |
| Progress, Library and PWA | C3, pre-C5, cloud/legacy Library, account, C9 and PWA tests cover fresh start, partial Resume/wrong score, completion/Review, final 5.C end-of-course, offline dirty state, cloud conflict/retry, account isolation, save IDs/deduplication and deferred refresh. |

The C7 native question remains bounded: in the specific wrong-order correction, current displayed/spoken `Aš užsisakiau kavos / arbatos` is internally consistent with the reviewed course's ordering forms. Current evidence does not establish that it is incorrect; `kavą / arbatą` may be a preference or construction nuance for David/Barbora to settle. This is **non-blocking native review**, not a speculative Section 4 rewrite or a correctness sign-off by a native reviewer.

## Test, build, CI and preview gates

- Before C9: **369 passed, 0 failed/skipped**. Focused C9/C3/final progression selection after lock: **40 passed**. Full `npm test` after lock: **372 passed, 0 failed, 0 skipped**, including C1–C8, scoring, route, Scenario V2, Match Pairs, Build Phrase, curriculum integrity, Section 5 progression, Library, offline/cloud/account and PWA suites.
- `npm run build`: **passed** (existing Vite chunk-size advisory only). `git diff --check`: **passed**. Final application diff contains the one epoch string and directly necessary tests; no Sections 1–5 content, shared audio engine, Supabase code or structural hash change.
- GitHub **Quality Gate run 36308860495: success** for application SHA `f60887003551ff78a3c489374fadec3bdd7bb2fa`.
- Vercel dev preview `learning-lithuanian-5yvo95dgn-davids-projects-25f8617a.vercel.app`: **READY**, deployment metadata `githubCommitSha` equals the application SHA. The page loads with Žodis branding but is invite-only and presents sign-in. Without an authenticated test account, catalogue traversal, lesson/scenario choices, Review and audio could not be exercised in that browser. Console inspection at the gate showed only a browser-extension metadata error, no observed app-origin error. Automated contracts and the final installed-PWA check cover those integration paths. No claim of browser lesson or Android verification is made.
- The documentation-only handoff commit may trigger a further dev deployment; the READY application deployment above is the one that was verified against the epoch-lock SHA. It does not change application bytes.

## Final installed-PWA check for David

Only a small integration sample after installing the current dev PWA:

1. Sign into a fresh/current-version account; confirm the first lesson opens and no old `beta3-1` Resume appears.
2. In one lesson, deliberately miss a scoreable item, close/reopen and Resume; confirm the safe block boundary and affected score.
3. Finish that lesson or a checkpoint, reload, and open Review from its start without losing completion; the final Section 5 checkpoint need not be replayed solely for C9.
4. Log out, use another account, log out, return to the original account; verify progress and saved phrases do not cross accounts.
5. Play a normal phrase and its slow version, then one Scenario V2 English meaning choice; check that the progressing learner line appears and plays in Lithuanian before the NPC reply. Apply a pending PWA refresh after leaving the lesson if one is offered.

Production was **not promoted**. No Supabase schema/data operation, migration, wipe, real-account reset or Library rewrite occurred. C9 ends here; no Coming soon implementation or new cleanup chunk was started.

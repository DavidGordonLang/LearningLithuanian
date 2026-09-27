# Beta 3 — C5 Sections 1–2 retrospective cleanup

## Scope and identity

- Starting `dev`: `466acf65f65ec691d3221fe5fea9d6c8a7aed312`, verified against the remote before edits.
- Implementation commit on `dev`: `7a7933fdbf3af656626284c73eedea85297a7e93` (tree `45884ff61a45b48f9d06cdd8179466db879c5cc2`). The local commit `bee59ffd5c7f22d4e03796e8f6fc1369b388079e` has the identical tree; the connected GitHub write path produced the remote SHA because direct Git credentials are unavailable here.
- Final handoff SHA: the documentation-only commit containing this report; its literal SHA is in the handoff message. Its implementation tree is unchanged.
- Before: 115 catalogue units, `CURRICULUM_ID = beta3-1-4a9a0f2`, `CURRICULUM_EPOCH = beta3-1`.
- After: 115 catalogue units, `CURRICULUM_ID = beta3-1-8cf80a6d`, `CURRICULUM_EPOCH = beta3-1`. Three existing blocks keep their IDs but change from `conversation_turn_fill` to `best_response`, so the structural fingerprint changes automatically. Other wording/options/metadata are semantic edits. No explicit epoch bump during C5; the final semantic epoch is to be decided after C5–C8 before C9/release. Existing versioned learner state under the prior fingerprint is retained in storage but not interpreted as current progress. No data migration or reset.

## Stage 1 findings reviewed

| Finding | C5 disposition |
|---|---|
| ZB3-02 base nouns | **Fixed** 1.2.2 personalised country base before the from-form; 1.4.1 `pagalba` before `pagalbos`; 2.1.1 visible kava/vanduo bridge in the first Learn card before the changed cards; 2.1.3 visible grynieji bridge and a laikas base card; 2.3.1 existing obuolys/duona base cards reordered before phrases. The later kava/vanduo/grynieji Learn introductions remain unique. Section 3–4 locations remain C6/C7-owned. |
| ZB3-03 teach before test | **Fixed** the three untaught `Supratau` scenario replies using the taught `Suprantu`; Section 1’s historical `O` issue was already resolved on current `dev`. Later-section cases belong to C6–C8. |
| ZB3-04 missing gap context | **Already resolved** in 2.3.2 and 2.C: current prompts identify object, distance and gender. The older 2.C hotel/register gap no longer exists in the current checkpoint. No C5 change. |
| ZB3-05 valid alternatives | **Fixed** the duplicate English synonym in 1.C; `Atsiprašau` is an acceptable/awkward response, according to context, beside best `Atleiskite`; natural self-introduction variants soft-pass. Existing 1.1.C translation was already correct. Section 4–5 examples are deferred. |
| ZB3-06 friend’s origin | **Fixed** 1.2.4: Barbora is expressly from Lithuania, independent of the learner’s profile; both scene and answer agree. Tested with three country profiles. |
| ZB3-11 receptive comprehension | **Fixed** 1.3.1’s room-floor and 1.3.2’s medicine-frequency confirmation: English close meanings assess the spoken Lithuanian, while authored `Suprantu, ačiū!` is the learner’s Lithuanian dialogue/audio after evaluation. Staged Nesuprantu help and next-speaker sequence use the existing C2 engine. Later examples belong to C6/C8. |
| ZB3-12 weak early scenario choices | **Fixed** generic feedback and cartoonish options in 1.2 scenarios with taught near distinctions (own country versus another, giving versus asking a name, gender, greeting versus goodbye); corrected stale scene directions. Reviewed all 37 Section 1–2 Scenario V2 blocks; simpler contrasts in the earliest lessons remain intentional beginner discrimination. No bulk scenario rewrite. |
| ZB3-13 retired one-word dialogue gaps | **Fixed** all three named blocks (1.4.5, 2.2.1, 2.4.2) as full-response assessments, preserving IDs and each original distinction. Appropriate casual/explicit/singular responses soft-pass; actual wrong meanings fail. |
| ZB3-15 Pattern notes | **Fixed** 1.4.2’s abstract explanation and 2.3.1’s dense endings lecture with concrete nearby/far and apple/bread examples. The rest of the appendix’s named notes are later-section work. |
| ZB3-18 repeated checkpoint speech | **Reviewed, no change** for 1.2.C personalised origin and 1.3.C `Nesuprantu`: these are useful spaced retrieval of core production after intervening content. They do not pose as new Learn items. The other locations are owned by C7/C8. |
| ZB3-24 authored answer audio | **Fixed** 1.C `s1c_b13` with `answerAudioText: "Ar galiu jums padėti?"`. English remains silent before evaluation. Audited other Section 1–2 English-choice blocks through the shared authored answer-audio resolver; none lacked a post-answer Lithuanian source. Section 3–5 locations remain C6–C8-owned. |

No false-positive finding required an out-of-scope change. ZB3-07/08/09/10/14 and other named locations have no Section 1–2 target in the issue register. The Section 2 scenarios and checkpoints retain their already-authored fact cues, staged helpers and earned contrast forms. We did not add new lesson units, duplicate Learn cards or a shared-engine branch.

## Files and checks

Section 1: `src/content/learning/section1/checkpoint_1.js`, `module_1_1.js`, `module_1_2.js`, `module_1_3.js`, `module_1_4.js`, `profile.js`.

Section 2: `src/content/learning/section2/module_2_1.js`, `module_2_2.js`, `module_2_3.js`, `module_2_4.js`. Section 2 checkpoint and both indexes were inspected and left unchanged.

Tests: new `tests/c5Sections12.test.mjs`; updated `tests/module13Content.test.mjs`, `module14Content.test.mjs`, `module22Content.test.mjs`, `module23Content.test.mjs`, and `section5CheckpointProgress.test.mjs` (the latter only updates the expected automatically changed fingerprint; its progression assertions remain). The six new tests exercise real lesson factories, three country profiles, teaching order, scenario facts, English/Lithuanian representation and audio metadata, soft passes, and absence of generic early feedback. C1–C4 and Section 5 checkpoint tests remained in the full suite.

- Focused C5/content tests: **40 passed, 0 failed/skipped**.
- Complete `npm test`: **350 passed, 0 failed/skipped/cancelled** (previously 344).
- Curriculum integrity and prior chunk/progression regression tests: **pass** as part of the full suite.
- `npm run build`: **pass**, 224 modules; existing bundle-size advisory only.
- `git diff --check`: **pass**. Final content diff contains no Section 3–5 changes; the Section 5 *test* expected fingerprint changed as a direct C5 consequence.
- [GitHub Quality Gate](https://github.com/DavidGordonLang/LearningLithuanian/actions/runs/36266807088): **success** for the implementation commit.
- Vercel dev preview `dpl_AH27Z7wAXxwKooeyyZtLmwce86KH`: **READY** for the implementation commit at https://learning-lithuanian-lq5d1e2vt-davids-projects-25f8617a.vercel.app. The documentation-only handoff commit has a separate gate/preview; its status is reported with the handoff.

## Review and stop point

No new Lithuanian grammar form was invented. `Suprantu, ačiū!` is built from the taught phrase plus an earned thanks; Barbora’s origin uses the existing taught `Ji yra iš Lietuvos`. Native review may still judge whether the acceptable introduction replies and the nuance between `Atsiprašau`/`Atleiskite` feel appropriately labelled; these are non-blocking stylistic judgments, not unverified inflection rules.

Small Android PWA preview check (a few minutes):

1. In 1.3.2, choose the English “twice a day” meaning after the pharmacist speaks; confirm the chat shows and plays Lithuanian `Suprantu, ačiū!` before the next spoken turn. Verify a wrong meaning remains feedback, not learner speech.
2. In 1.1.C, choose `Atsiprašau` when interrupting a stranger; confirm amber soft-pass and best `Atleiskite` in green without a wrong-answer penalty.
3. In 1.2.4, confirm the full-screen intro establishes Barbora’s origin and the dialogue/choices remain readable on the installed phone.

No physical device check is claimed here. Standalone Training → Match Pairs and Exam Prep were not expanded; both remain background Coming-soon modes. No Supabase schema/data operation, user reset, production promotion, C6, C7, C8 or C9 work occurred.

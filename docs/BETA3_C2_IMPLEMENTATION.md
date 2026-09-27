# Beta 3 — C2 implementation

Scope: **C2 only**, following David's implementation approval. No C3, content rewrites, progress/persistence changes, Supabase operations, production promotion or new features outside this chunk.

Starting `dev`: **cc952cf42a5a7dbbeccce4c0ddbbcfbe43379800**. Remote was checked before editing and again before publication; no later commits required reconciliation. The three source-of-truth documents and C1 report were reread. This report is committed with C2; its containing commit is the implementation revision. The handoff message records the final SHA and post-publication Quality Gate/Vercel results (not knowable before creating this commit).

## Implemented issues

| Issue | Implementation |
|---|---|
| ZB3-21 | Shared correct/soft-pass predicates now drive ordinary Choice, Context Gap Select, Choose Correct Form and Conversation Turn Fill. Authored `best` or `isCorrect` is green; `acceptable`/`awkward` complete without a wrong-answer count, retain the learner's answer in amber, and show the authored best answer in green with **Better here**. Wrong options remain wrong and use authored correction. Scenario V2 acceptable/awkward feedback and history follow the same colour/penalty distinction. Existing ordinary-block completion-after-evaluation and Scenario V2 retry/repair/help scoring are preserved. |
| ZB3-22 | Lesson whole-phrase buttons reuse `AudioPlayButton` and the existing gesture/TTS infrastructure. Tap plays normally; holding for 420ms plays slowly once; release/native click cannot also play normally. Motion/cancel/lost capture/unmount clears a pending hold. Native Enter/Space plays normally; Shift+Enter/Space plays slowly. Word playback remains separate. Existing library phrase controls inherit the same helper. |
| ZB3-23 | Word feedback is a steady active colour for exactly 1000ms from playback action, independent of audio completion. Repeated taps restart the timer. Removed fading keyframes and prevented touch-hover suppression from hiding the active green. Light/dark colours remain visible. |
| ZB3-24 | English options remain silent before evaluation. After evaluation, Choice/completion renderers play authored Lithuanian target metadata where available. Scenario comprehension displays and speaks authored Lithuanian `learnerText` only after a progressing result; wrong English choices remain plain assessment feedback. No translation or Lithuanian string is generated in shared code. |
| ZB3-25 | Removed both success/retry transcript, normalised-text and matcher diagnostic boxes, including the old hostname-based preview exposure. No diagnostic UI/path was retained. Speechmatics endpoint, recognition hook, matching, microphone interaction and internal logging are unchanged. |
| ZB3-26 | Scenario V2 opens in a dedicated full-screen integrated intro with existing title, sceneIntro/description/goal fallback, location, user role and participants. Large wrapping text, scrollable layout, safe-area padding, light/dark styles, heading focus, explicit Start and Back. Focused conversation mounts only after Start: no character dialogue or scenario TTS before it. Exit returns to the intro; Back exits the lesson. |
| ZB3-05 / ZB3-11 support | The shared comprehension/audio and soft-pass paths are ready for later authorship. No broad lesson/scenario rewrite or answer reclassification was performed. |

## Audio lifecycle and authoring contract

A progressing comprehension answer inserts Lithuanian learner history, begins learner audio, disables further submission/replay/help interruption, and awaits the existing audio owner's completion promise before the next normal, branched, follow-up or final speaker turn. No estimated speech-duration sleep is used. Existing short visual reveal delays remain. Follow-up, final and spoken help completion also await audio; English help stays silent and remains in history. Scoped abort stops scenario audio on exit and invalidates pending responses without stopping a newer playback owner. Playback failure settles through the existing error path so the learner is not stranded.

For ordinary English choices, priority is selected-option `learnerText` / `answerAudioText`, then block `answerAudioText`, `targetText`, `prompt.audioText`; on a wrong attempt use the authored best option/target. Missing metadata means silence. Existing listening-question controls remain available; option audio does not reveal answers before evaluation. Explicit `optionsLanguage: "en"` / `"lt"` supports future authorship; legacy `noOptionAudio` stays conservative. Lithuanian options use authored audioText/text. See the updated regression contract.

## Verification

- **Full Node suite: 301 passed, 0 failed, 0 skipped**, Node 24 locally.
- **Production build: passed**, Vite 5.4.21, 221 modules. Existing non-blocking large-bundle advisory remains; no unrelated bundle refactor.
- C1 age/profile/DOB/speech, metadata, grouped match-pair and submission regressions remain green. No C1 language fixtures or content were changed.
- 21 new component/interaction tests cover all four result outcomes across four ordinary renderers; amber/green feedback; English audio before/after evaluation; actual phrase gesture/helper and keyboard paths; deterministic 999ms/1000ms word timing; steady theme styling; both STT result screens; intro mounting; all four learner-to-speaker progression paths; duplicate submission; wrong English feedback; scenario soft pass; exit; and help completion/English silence.
- Two new playback-owner tests cover active/pending/pre-aborted audio and protection of newer audio from obsolete scenario cancellation.
- Four brittle source-string tests were replaced by behavioural coverage: the obsolete 0.9s fading glow, phrase-completion selected-text/correction, selected soft-pass/best colours, and non-failing correction/penalty. Remaining STT/hover source assertions were updated to the approved behaviour. Test count: 282 − 4 + 21 + 2 = **301**. No meaningful C1 invariant was dropped.
- Test harness changes add a deterministic clock, cleanup/unmount and actual shared-hook execution. Tests execute current JSX/event/state trees with isolated imports and deferred audio promises. They do **not** claim browser DOM/layout, audible TTS, real microphone or physical PWA verification.
- React review checked effect cleanup, cancellation, existing hook ordering, native button keyboard paths, focus on phase transitions and scoped theme styles. A soft-pass bubble CSS specificity conflict found during review was fixed in both themes.
- Browser preview was attempted using the available agent-browser skill/CLI. Its daemon failed twice with `Failed to bind socket: Operation not permitted`. The alternate installed Playwright package has no browser executable. Thus no mobile-width screenshot or actual browser light/dark visual check is claimed. The temporary local preview harness is outside the repository and is not shipped.

## Small physical/PWA review set

Use the dev preview after its deployment is READY. Check narrow portrait width in both themes; increase text size for the scenario intro. No full-course replay is requested.

| Location | Check |
|---|---|
| **3.4.1**, `s3m4l1_b1` Learn | Tap the whole phrase **Kiek jums metų?** normally, then hold: normal versus slow once, with no extra normal playback on release. Tap a word: steady green for one second. Keyboard Enter/Space and Shift+Enter should remain usable. |
| **5.4.2**, `s5m4l2_b3` Choice | Choose the authored best response. On a separate review choose **Ačiū labai.**: amber acceptable answer, green best answer, improvement note and no wrong-answer penalty. |
| **4.4.2**, `s4m4l2_b3` Choice | Choose **Ar norite sausainio?**: awkward soft pass, amber selection and green **Ar nori sausainio?**, not a grammatical failure. Its legacy silence flag is intentionally unchanged. |
| **5.4.5**, `s5m4l5_b5_v2` scenario | Read the full-screen intro before Start; no dialogue/audio yet. Start and reach the English route meaning in step 2: English stays assessment-only, Lithuanian learnerText appears/speaks, then the next character speaks without overlap. Check Nesuprantu/help, wrong retry, remaining turns, completion and Exit. This one multi-turn scenario covers both scenario requirements. |
| **3.4.1**, `s3m4l1_b4` / `s3m4l1_b4b` Say It Out Loud | Speak correctly and try a rejected answer: no transcript/debug box on either screen; normal Speechmatics feedback/microphone still works. |

Physical review is still required for mobile long-press gesture behaviour, actual audio speed/order, one-second perceived feedback, safe areas/text zoom, theme contrast and microphone permissions. Automated clocks/promises prove the logic; they cannot prove platform audio/gesture behaviour.

## Deferred content observations (C5–C8; not changed)

Seven English-choice blocks have Lithuanian embedded in English prompt/feedback but no separate target audio metadata: Section 1 checkpoint `s1c_b13`; Section 3 checkpoint `s3c_b1`; 3.1.2 `s3m1l2_b6`; 3.1.3 `s3m1l3_b6`; 3.2.2 `s3m2l2_b5`; 5.1.5 `s5m1l5_b4`; 5.2.5 `s5m2l5_b3`. Later owning section chunks should author the target field when appropriate. Shared code deliberately does not parse mixed-language prose.

Two Lithuanian-option blocks also carry legacy `noOptionAudio: true`: 4.4.2 `s4m4l2_b3` and 5.2.5 `s5m2l5_b4`. Their silence remains unchanged pending later content review; authors can explicitly identify Lithuanian options or supply post-answer audio metadata. This is not grounds for a broad C2 content change.

No Lithuanian grammar decision was invented. Existing scenario prose quality, late-rule propagation and legacy progress remain with their already planned chunks. The main remaining C2 risk is unverified physical browser/PWA rendering and audio interaction, addressed by the small review set above.

## Exact changed files

- `docs/BETA3_C2_IMPLEMENTATION.md` — this handoff and bounded physical checks.
- `docs/LEARNING_REGRESSION_CONTRACT.md` — approved C2 shared behaviour/authoring invariants.
- `src/components/audio/AudioPlayButton.jsx` — shared phrase gesture/keyboard control.
- `src/components/audio/InteractivePhraseText.jsx` — steady word feedback/keyboard playback.
- `src/hooks/useTTSPlayer.js` — optional scoped cancellation through the existing player.
- `src/hooks/useWordAudio.js` — common pointer gesture and deterministic highlight timer.
- `src/index.css` — light-theme active/soft-pass colours; obsolete fade removal.
- `src/lib/trainingScoring.js` — correct/soft-pass and authored answer-audio helpers.
- `src/utils/audioPlayback.js` — scoped playback cancellation.
- `src/views/training/LearningLessonView.jsx` — shared answer/audio paths and diagnostic removal.
- `src/views/training/ScenarioV2Block.jsx` — intro, soft-pass presentation, learner/character sequencing.
- `tests/audioPlayback.test.mjs` — cancellation invariants.
- `tests/c2LearnerInteraction.test.mjs` — focused C2 behavioural tests.
- `tests/helpers/componentHarness.mjs` — clock, cleanup and shared-hook test support.
- `tests/helpers/lessonHarness.mjs` — explicit shared component/microphone test imports.
- `tests/learningRegressionContracts.test.mjs` — approved STT/hover contract and replaced brittle tests.

**Stop point: C2. Do not begin C3 until David/Aiden review and authorise it.**

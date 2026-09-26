# Beta 3 — pre-C5 final checkpoint progression fix

## Scope and commits

- Starting `dev`: `61ff053f9a1f89b5ee97b4f04a4ab83433beedda` (local and remote verified before edits).
- Implementation SHA on `dev`: `3180d7a69a0cc12b109c0529b4b0bde339189714`.
- Final handoff SHA: the documentation-only commit containing this report; the implementation tree is identical to the implementation SHA. The handoff message supplies its literal SHA.
- Files changed: `src/content/learning/section5/checkpoint_5.js`, `tests/section5CheckpointProgress.test.mjs`, and this report. No other course content, grouping, engine, schema or account data changed. **C5 was not started.**

## Root cause and correction

The authored `section_5_checkpoint` was already last in `section5/index.js`, after module 5.4. Its factory omitted `isCheckpoint: true`, `isSectionCheckpoint: true`, and `status: "active"`, all present on Sections 1–4 final checkpoints. C3's catalogue treats a marked section checkpoint as the module itself and ordinary modules as their `lessons`; thus the unmarked final checkpoint contributed no lesson. Course browse, Continue, scoring, sanitisation and section completion likewise rely on that marker.

The factory now has exactly those three metadata fields. The Section 5 index needed no companion change: it contains one final checkpoint in the correct order and now yields one catalogue item, with no duplicate representation. The same existing `LearningSectionView` checkpoint card opens it when unlocked or completed for review. Training's next-lesson traversal reaches it after the last 5.4 lesson/checkpoint. Once it is complete, traversal has no following lesson or Section 6: the section celebration's Continue returns to the course home, whose all-complete state offers review.

| Identity | Before | After |
|---|---|---|
| Catalogue entries | 114 | 115 |
| Final catalogue ID | `section_5_module_4_checkpoint` | `section_5_checkpoint` |
| `CURRICULUM_ID` | `beta3-1-692cd95b` | `beta3-1-4a9a0f2` |
| `CURRICULUM_EPOCH` | `beta3-1` | `beta3-1` |

Adding a previously omitted stable lesson/block structure changed the hash automatically; there is no independent semantic reason to bump the explicit epoch. C3 therefore treats prior-version interpreted game progress as incompatible with this manifest, including previously earned current-version completion in Sections 1–4. A returning dormant tester sees a clean Beta 3 course under the new namespace. Existing accounts, Library and old `user_game.data.learningCurricula` entries remain in place. No migration, wipe or real-user reset was performed. As agreed, the final semantic epoch still needs deliberate review after C5–C8 and before C9/release.

## Progression verification

- The real checkpoint is the unique final catalogue lesson. Its nine block IDs are distinct and its scoreable count comes from the shared scoring function. Sections 1–4 still appear under their original IDs.
- A partial attempt with completed earlier block IDs and a wrong first block survives account-scoped local/cloud hydration; resume returns to the third block boundary with wrong-answer evidence. A removed block ID is rejected.
- The real Section 5 browse state unlocks the checkpoint after all earlier items, its card opens the authored ID, and completion makes it a completed Review target. Course completion reaches 115/115 with no next lesson/section.
- The real game store records checkpoint completion and first-completion metrics, removes partial state, persists to cloud, and restores after reopen. Sanitisation and merge preserve completion over stale partial data. Completed Review starts at the beginning without rewriting its first metrics or becoming an unfinished Resume target. Account B does not inherit A's completion; A recovers it on login.

## Tests and deployment

- `tests/section5CheckpointProgress.test.mjs`: four additive tests against real curriculum objects, section browse renderer and C3 game store/network doubles. The existing C3 progression, C4 Match Pairs and curriculum integrity tests were rerun separately: **57 passed, 0 failed/skipped**.
- Full `npm test`: **344 passed, 0 failed/skipped/cancelled**.
- `npm run build`: **PASS**, 224 modules; existing bundle-size advisory only.
- `git diff --check`: **PASS**.
- GitHub [Quality Gate run 36263727169](https://github.com/DavidGordonLang/LearningLithuanian/actions/runs/36263727169): **success** for implementation SHA.
- Vercel dev preview `dpl_99UHu8H6i8iFx44HS1ut2AGLUgMY`: **READY** for implementation SHA at https://learning-lithuanian-orgr915rq-davids-projects-25f8617a.vercel.app. The documentation-only handoff commit receives its own gate/preview; status is reported separately in the handoff.
- No Supabase schema/data operation and no production promotion. No physical Android test is claimed.

## Small combined Android PWA check

1. Reach the Section 5 final checkpoint, open it, complete two blocks, exit/close and reopen; Resume should return to the third block. Complete it, reload/reopen, confirm it remains complete and the course has no spurious Section 6/Continue loop. Open the completed checkpoint for Review and confirm it stays complete.
2. In one lesson Match Pairs page, match correctly and start the next pair while green remains visible; mismatch deliberately and recover while red remains visible. Advance one authored group/page and check long text wraps on the phone.
3. Make one standalone Training → Match Pairs Words or Numbers match. This is the remaining C4 touch/wrapping smoke check, not a replay of the course.

No broader curriculum-content work or C5 changes were made.

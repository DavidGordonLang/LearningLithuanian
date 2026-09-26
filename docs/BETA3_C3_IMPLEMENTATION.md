# Beta 3 — C3 implementation

## Scope and provenance

Starting `dev`: **317bad889e8bb1a99a0cfdce5a5756623c1c7ed8**, independently confirmed against remote before edits. The checkout was fast-forwarded from C2's 7029007 through the approved scenario-tail polish (92f480a, 23d9b26, 98860b2, 02b66f7) and completed Sequence Walker Review fix (317bad8). Those changes were inspected and preserved. Starting baseline: **302 passed, zero failed**.

Implementation SHA: **157fd5f03d8ac9afd6fdc5804cf2babc002d0c72**. Final handoff SHA: the documentation-only publication commit containing this report (reported explicitly in the handoff); application code is identical to the implementation SHA. Sources reread: START HERE, CURRENT, full PROJECT live document `1E7RxFp-c8jsRMioNPZQIgyU5OB1Q0bpozC-RrNcoTVE`; Stage 1 post-sweep issue register and C3 plan; C1/C2 implementation reports and learning regression contract. This is C3 only. **C4 was not started.**

## Audit findings and root causes

| Finding | Root cause | Implemented correction |
|---|---|---|
| ZB3-28 — resume inflates score | Only cursor persisted; wrong/completed block sets reset on remount | Persist bounded attempt evidence synchronously; initialise the lesson from it; retain mistakes across reopening and final scoring. Actual resumed and uninterrupted lesson handlers produce identical accuracy and XP. |
| ZB3-29 — reused curriculum IDs misattribute credit | No curriculum identity; legacy numeric cursor fallback | Epoch plus structure fingerprint; versioned cloud namespace and local cache; validate stable IDs and prerequisite evidence. Incompatible data is ignored, not reconstructed or deleted. |
| ZB3-31 — focus refresh interrupts attempts | Changed bundle caused immediate reload | Shared active-lesson/save-safety guard queues the freshness reload until exit. Existing fresh-HTML check remains. |
| ZB3-32 — silent load/save failures and races | Failed reads became loaded defaults; cloud-only full-row writes, no durable pending journal or cross-client conflict guard | Gate hydration, durable local journal, explicit offline/error feedback and retry, bounded request timeout, serialized conditional cloud writes, monotonic merge and account-scoped task cancellation. |

No migration file was created. Existing `user_game.data` JSON and `updated_at` suffice. Read-only schema/policy metadata confirmed column types, own-user RLS and absence of timestamp triggers. SDK abort/update behaviour was checked against official Supabase documentation. **No remote user row was changed, no schema migration applied, no account deleted, and no destructive Supabase/user-data operation performed.** Tests use in-memory network/storage doubles.

## State authority: before and after

| Path | Before | C3 authority / behaviour |
|---|---|---|
| Lesson completion | Memory then cloud upsert; first metrics, best XP | Valid current lesson IDs only; synchronous local snapshot then conditional cloud merge. First metrics and best-lesson XP retained. Completion removes unfinished attempt. |
| Partial attempt | Cursor only | Current curriculum/account journal contains block ID, completed block IDs, wrong block IDs and activity timestamp. |
| Resume point | ID lookup with numeric fallback | Valid ID plus evidence that all preceding blocks completed. Current block restarts its transient UI; earlier work/mistakes persist. |
| Course Continue | Latest timestamp among known lessons | Latest valid unfinished attempt; deterministic ID tie-break; stale/completed/incompatible records ignored. Existing next-course fallback retained. |
| Local persistence | None for game progress | `zodis:game:<curriculumId>:<userId>` with owner, version, trusted-baseline and dirty markers; writes at interaction time, not unload. Dirty same-browser tab journals merge before replacement. |
| Authenticated persistence | Whole-row last-writer upsert | Fresh read, merge, conditional `updated_at` update; concurrent first insert/conflict reread and retry. Unrelated JSON and older namespaces retained. |
| Initial hydration | Render could race cached/default/cloud state | Training waits for matching account game/settings hydration. Failed uncached read shows Retry, not a falsely empty course. |
| Refresh / close / reopen | Cursor might survive; mistakes did not | Matching trusted local cache plus cloud reconciliation; offline cached account can resume. No trusted baseline means no learner-state writes until successful read. |
| Logout / login | Auth reset existed; game async work less isolated | Auth's existing synchronous reset remains; controller identity invalidates prior tasks, local pending work stays only in its owner key. |
| A → B | Relied on reset/queue discipline | Clear interpreted A state before B load. Delayed A reads/writes cannot populate B or B's status/cache. Actual auth path and Library account selection are regression-tested. |
| Completed Review | Could recreate cursor | Always starts review at first block; opening creates no pending attempt and clears no completion. Walker Review does not prime/reset completed work. |
| Stale lesson/block | Known lesson with index could attach elsewhere | Unknown IDs, invalid attempt evidence and version mismatch cannot resume. |
| Curriculum identity | Missing | `beta3-1-692cd95b` for this structure, derived from epoch plus ordered lesson/block IDs and block types. |

The manifest covers all **114 current lesson/checkpoint records** across Sections 1–5. It includes module and section checkpoints. Male/female profile factories produce the same structural identity. Later structural changes create a new namespace automatically; semantic changes reusing the same IDs require an explicit epoch bump. This deliberately favours safe new-cohort behaviour over legacy reconstruction.

A pre-C3 tester sees a clean Beta 3 course, with current-version XP, streak, metrics and completion starting fresh. Their account, settings, personal Library and existing database JSON remain. Merely loading does not write or erase legacy state. New progress is stored alongside it. No anonymous progress is merged: the existing app requires authentication, and anonymous game mutations remain no-ops.

## Persistence and lifecycle details

- Local dirty state merges with cloud before acknowledgement; completion/seen sets union, per-lesson XP takes the best, first metrics remain first, and unfinished attempts retain the furthest earned cursor plus wrong/completed sets. A newer in-memory revision cannot be marked saved by an older acknowledgement.
- Cloud writes compare the exact previous `updated_at`. A conflict retries up to three times, then keeps the journal pending with Retry. Requests abort after ten seconds rather than leave an endless hydration screen. New activity, reconnect, focus while offline/error, or manual Retry can retry. Healthy reconnect does not remount Training.
- Existing user-requested Settings resets use a new, locally monotonic generation; stale offline data cannot resurrect an earlier generation. Two resets in one millisecond are ordered reliably. Existing reset-specific XP policy remains. Reset status no longer claims cloud success when only local saving succeeded. No reset was executed against a real user.
- Corrupt local JSON can be replaced after a trusted cloud read. Storage failure is visible. If both storage and cloud are unavailable, the UI says to keep the page open; the app cannot promise durability in that situation. Automatic build reload is blocked while saving is unsafe.
- An active lesson holds the PWA reload guard, including loading, scenarios, speech and completion presentation. Release at lesson exit allows the pending refresh on the next task, avoiding StrictMode/navigate remount races. Current transient scenario turns/answer drafts are deliberately not persisted; reopen replays that block without forgetting its recorded mistake.

## Verification

- Full Node suite: **333 passed, 0 failed, 0 skipped, 0 cancelled** (`npm test`). Baseline 302 minus two brittle queue/cursor source tests plus 33 focused behavioural tests. The remaining scoring test no longer requires a particular internal setState expression; its meaningful scoring assertions and actual-handler coverage remain.
- Production build: **PASS**, Vite 5.4.21, 224 modules. Existing large-bundle warning remains; no unrelated bundling refactor.
- Existing curriculum integrity/content/progress tests run within the complete suite. Additional manifest test validates unique lesson/block identities and representative personalised structures. `git diff --check` passes.
- Focused cases cover new account, valid/legacy curriculum, initial failure/retry, wrong/completed evidence, reload/reopen, invalid IDs/positions, deterministic selection, completed review/first metrics, local/cloud hydration races, rapid delayed saves, two-device insert/update conflicts, shared dirty tab journals, explicit reset generations, quota/corrupt storage, request timeout, actual auth A/logout/B, Library account selection, actual Training gate, actual lesson scoring and actual PWA changed-hash focus event.
- C1/C2 regression suites remain green. No Scenario V2, Speechmatics, shared feedback/audio helper, Library persistence or curriculum prose implementation was changed.
- GitHub **Quality Gate PASS** for implementation SHA 157fd5f03d8ac9afd6fdc5804cf2babc002d0c72: [run 36248577328](https://github.com/DavidGordonLang/LearningLithuanian/actions/runs/36248577328), test-and-build job completed successfully including tests and production build. Vercel dev/preview **READY**, deployment `dpl_2bkGWspnGaJEPGvw5yiZXXg2Zngj`, matching that SHA: [preview](https://learning-lithuanian-aqnxgmf35-davids-projects-25f8617a.vercel.app). Deployment target is preview, not production. This documentation-only follow-up records those observed results; its own automatic checks are verified in the final handoff. No production promotion performed.

No physical C3 PWA verification or browser layout/audio verification is claimed. The environment's C2 browser attempts failed to bind the automation daemon and had no alternate browser executable; C3 uses isolated real component/store event tests, not a simulated claim of Android verification.

## Small physical Android PWA check for Aiden/David

Use the dev preview after READY; no full-course replay is needed.

1. In one **unfinished 1.1.1** attempt, make one wrong answer, advance a block, exit/close and reopen the PWA. Continue should return to that earned block boundary. Finish: the earlier mistake must still count. Use another unfinished lesson if 1.1.1 is already complete; do not reset an account for this check.
2. On the same already-loaded account, go offline, advance in an unfinished lesson, close/reopen while the installed shell is available, then reconnect. Check the local-save/pending message and successful retry; reopen once more to confirm the cursor. First-ever uncached offline sign-in is not promised.
3. Open one completed item through Admin Sequence Walker **Review**, then leave. It stays complete and is not a Resume target. Briefly check one C2 scenario intro/Start and speech block during normal use; no extended C2 replay needed.
4. Log out A and sign in B using approved test accounts. B must show only B's state; returning to A restores A's unfinished attempt. No account deletion/reset is required.

If a later dev deployment naturally occurs while this build is active, focus during a lesson should not force a reload; leaving the lesson should apply it. Do not trigger a production deployment merely for this check.

## Limits and deferred work

No C4 matching, C5–C8 curriculum rewriting, C9 release verification, recap, onboarding, native packaging or voice tuning was started. No new language decision is required.

This remains bounded sync, not realtime collaboration: another device is reconciled at hydration/retry/write rather than continuously pushed into an open lesson. Concurrent unrelated non-lesson XP awards use the larger accumulated non-lesson total, not a new event ledger; lesson XP/completion are merged independently and regression-tested. A permanently unavailable browser store plus failed network cannot survive device termination; the warning is intentional. Full offline shell/auth availability still depends on the existing PWA/auth caching. Older deployed clients do not understand the new namespace; returning testers should refresh to the C3 dev build before testing. Physical OS termination, Android storage policy and real-network RLS/write behaviour remain appropriate preview checks; no real-user persistence write was used for verification.

## Exact files changed

- `docs/BETA3_C3_IMPLEMENTATION.md` — report and bounded review checklist.
- `docs/LEARNING_REGRESSION_CONTRACT.md` — C3 state/identity guarantees.
- `src/lib/curriculumProgress.js` — identity, validation, resume and merge rules.
- `src/lib/gamePersistence.js` — local journal, scoped hydration, timeout, retry and conditional cloud writes.
- `src/lib/learningUpdateGuard.js` — active/safe refresh boundary.
- `src/stores/gameStore.js` — real store persistence and validated attempt/reset integration.
- `src/pwa.js` — defer changed-build refresh through guard.
- `src/views/TrainingView.jsx` — hydration gate and truthful save/retry status.
- `src/views/SettingsView.jsx` — truthful reset-save status.
- `src/views/training/LearningLessonView.jsx` — attempt evidence, scoring and safe lifecycle integration.
- `src/views/training/learningProgress.js` — validated deterministic course resume.
- `src/content/learning/section4/index.js` and `src/content/learning/section5/index.js` — explicit `.js` import extensions only, allowing the actual factories to run under Node; no content change.
- `tests/c3ProgressReliability.test.mjs` — 33 focused behavioural cases.
- `tests/helpers/gameHarness.mjs` — real Zustand/auth compilation with bounded network/storage doubles.
- `tests/helpers/lessonHarness.mjs` — real new helper imports for existing component harness.
- `tests/learningProgressBrowse.test.mjs` — valid versioned attempt fixtures.
- `tests/learningRegressionContracts.test.mjs` — replace brittle queue/cursor internals with behavioural coverage.

**Stop point: C3. Await David/Aiden review before C4.**

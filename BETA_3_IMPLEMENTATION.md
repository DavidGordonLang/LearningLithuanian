# Beta 3.0 implementation

Started 7 September 2026 from dev `1f300bd281ac19a302900782743a256244725e6e`.
Branch: `codex/beta-3-release-fixes`. The audit access/fixture commits are not included.

## Batch 1: account isolation and cloud data safety

Implemented for review:

- Account-scoped local phrase and scenario storage. Logout clears the active view while preserving stored data. Previously captured write callbacks are rejected after account changes, including A → B → A.
- Explicit recovery of a previous unscoped library, retaining original data, phrase IDs, scenario links and entries already created in the account. A partial storage failure can be retried. This recovery is a user ownership confirmation, not proof of the historical owner of legacy data.
- Failed local writes do not appear as successful changes in memory. Unreadable data is preserved and cannot be overwritten through the active store.
- Private React view state remounts per account. Settings/progress loads reject stale responses; progress writes reject a mismatched account.
- Cloud reads return a complete snapshot plus a revision. Replacements use one database function with an expected revision. A stale revision is rejected. No delete/insert fallback is allowed if the functions are missing.
- Cloud requests use the captured account's authorization header. A later login cannot change the owner of an in-flight sync. Local changes during sync are preserved and the user is asked to sync again.

Validation completed locally: seven focused tests using synthetic local storage/RPC responses, plus a production Vite build. The tests verify account separation, stale writes, failed storage writes, recovery retry/ownership, revision submission, missing/incomplete RPC handling and captured request identity. These tests do not establish actual database rollback or live RLS behaviour.

## Database prerequisite — installed and database-validated

`supabase/migrations/20260907_atomic_phrase_sync.sql` installs two security-invoker functions on the existing `phrases(user_id, data)` contract. It does not rewrite existing data when installed. The functions use caller authentication and existing row-level policies; no service-role bypass is introduced.

Completed on the production project `gsxfdekilabnalxuqose` on 8 September 2026:

1. Confirmed the preview uses this project and inspected the live table, constraints, triggers, row-level policies and dependent pronunciation tables.
2. Compiled the migration in a rolled-back transaction, installed it, and verified the intended execution permissions.
3. Ran the transactional validation in `supabase/validate_atomic_phrase_sync.sql`. Insert, in-place update, stable UUIDs, linked pronunciation preservation, stale revision rejection, invalid-input rollback, RLS isolation and anonymous denial passed.
4. Confirmed the validation left 1,009 phrase rows and 292 pronunciation queue rows, with no test data, missing IDs or duplicate identities.

The remaining sync checks are the normal authenticated preview journey and previous-beta upgrade/recovery on real Android and iPhone. The cloud browser's Google OAuth request returned `502 Bad Gateway`, so the preview journey is not yet marked as passed. Retire old client sync writers during rollout: the advisory lock/revision contract coordinates upgraded RPC clients, not historical clients still using direct delete/insert calls. Full results are recorded in `supabase/VALIDATION.md`.

The security-invoker/permission approach follows [Supabase database-function guidance](https://supabase.com/docs/guides/database/functions). The captured request header uses the client's [custom-header configuration](https://supabase.com/docs/reference/javascript/initializing).

## Remaining audit batches

| Findings | Work remaining |
|---|---|
| B09, B21 | Browser-level sync plus real Android/iPhone upgrade checks; then release sign-off |
| B10 | Verify deployment controls and enforce server-side caller policy/request limits |
| B02, B03, B05–B07, B11–B12 | Speaking escape route, fair answer checking, progression/checkpoints, vocabulary selection and feedback |
| B01, B08, B13–B14, B19 | Exact-phrase pronunciation enrichment, audio request ordering, EN/IPA policy and word-control coverage |
| B04, B20 and language backlog | Personalisation, Barbora's reviewed corrections and bounded noun integration with the lesson count fixed |
| B15–B18, B22 | Scoring, notes, mobile readability, recall/cache consistency and truthful diagnostics/version reporting |

No changes to dev/main, lesson wording, paid API permissions or production data are included in batch 1. The branch is a work in progress, not a beta release candidate approved for users.

## Batch 2: preview recovery, first-run audio and pronunciation

- Missing cloud functions now produce a setup message and a read-only **Load cloud phrases on this device** action in Settings after a failed sync. It uses the existing authenticated table read, requires an exact row count, rejects capped/incomplete responses, preserves current local identities (including deletions), and adds missing cloud entries. It performs no cloud writes. Large libraries exceeding the server response cap still require database setup; it does not claim a complete download in that case.
- First-run profile setup is followed by one skippable, interactive word-audio screen instead of the nine-slide guide. Completing it suppresses the immediate release-notes popup. Settings retains the full guide and a Try word audio action. The profile form itself and contextual tips remain to be redesigned. The demo introduces phonetics settings in text; it does not yet show a native-reviewed EN/IPA pair.
- Scenario V2 dialogue, history, feedback and reply text use word audio. Reply submission is a separate Choose button. Speaker voice overrides survive slow word playback. Revealed multiple-choice answers no longer contain audio controls under a disabled button.
- Audio playback now owns pending requests and active URLs: the latest request wins, stopping invalidates pending playback, interruption releases URLs, and playback promises settle at end/stop. Top-level navigation/account/voice changes stop playback. Lesson block-level cleanup and delayed scenario autoplay still need review.
- Vocabulary enrichment sends the original Lithuanian, rejects rewritten responses and preserves reviewed English, existing phonetics, and later edits/deletions. Existing incorrect library rows are not mass-rewritten.
- Home, duplicate previews, Library, saved Scenarios and Daily Recall share the EN/IPA fallback policy. Missing IPA is explicitly labelled. Daily Recall and duplicate previews now support word taps.

Validation: 14 focused Node tests pass; Vite production build and diff whitespace checks pass. Coverage includes audio races, interruption cleanup, missing migration, capped recovery, exact-text enrichment and phonetics fallback. These are synthetic tests, not successful live account recovery or physical-phone listening checks. Scenario reply layout and the new introduction still need authenticated browser/device verification. No database migration has been applied.

Remaining: broader word coverage (grammar/building/matching/vocab selection/mixed notes), explicit language spans for English prompts, answer checking and progression, reviewed lesson content/nouns, the full profile onboarding redesign and the other audit items above. PR remains a draft.

## Onboarding follow-up

David's feedback: the one-screen audio introduction omitted too much app context. Replaced it with four skippable, compact steps: translation example, live word/phrase audio, Library/Scenario organisation, then personalised lessons and preferences. The whole-phrase control now pulses immediately, offers Stop audio, and resets when its promise settles or the user switches words/steps. It labels the pending request without claiming playback has already started. Reduced-motion preferences suppress the animation; the ring and button label remain. Settings' full guide opens this as Quick tour. Production build passes; physical-phone interaction verification remains outstanding.
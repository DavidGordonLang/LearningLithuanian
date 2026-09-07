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

## Database prerequisite — not applied

`supabase/migrations/20260907_atomic_phrase_sync.sql` installs two security-invoker functions on the existing `phrases(user_id, data)` contract. It does not rewrite existing data when installed. The functions use caller authentication and existing row-level policies; no service-role bypass is introduced.

Before merging/releasing:

1. Inspect the actual staging table definition, constraints, triggers and authenticated SELECT/INSERT/DELETE policies. Confirm the existing insertion contract and that users cannot read or alter another user's rows.
2. Apply the migration to staging. Test empty and large libraries, a forced insertion failure, two competing writes based on the same revision, and anonymous/other-account access. A failed insertion must leave the prior rows intact. Exactly one competing write should succeed.
3. Test full account switching and cloud merge through the normal preview login with disposable users. Verify private views, settings and progress along with phrase data.
4. Exercise previous-beta upgrade/recovery on real Android and iPhone. Preserve a backup and verify recovery after storage failure. Retire old client sync writers during rollout: the advisory lock/revision contract coordinates upgraded RPC clients, not historical clients still using direct delete/insert calls.

No Supabase administration connection or local PostgreSQL runtime was available in this session. The migration has not been applied or database-tested. Cloud sync on the fixes preview requires the migration; missing functions produce an error without deleting cloud rows. Do not merge or promote this branch until the staging prerequisites pass.

The security-invoker/permission approach follows [Supabase database-function guidance](https://supabase.com/docs/guides/database/functions). The captured request header uses the client's [custom-header configuration](https://supabase.com/docs/reference/javascript/initializing).

## Remaining audit batches

| Findings | Work remaining |
|---|---|
| B09, B21 | Database/staging/mobile validation above; then release sign-off |
| B10 | Verify deployment controls and enforce server-side caller policy/request limits |
| B02, B03, B05–B07, B11–B12 | Speaking escape route, fair answer checking, progression/checkpoints, vocabulary selection and feedback |
| B01, B08, B13–B14, B19 | Exact-phrase pronunciation enrichment, audio request ordering, EN/IPA policy and word-control coverage |
| B04, B20 and language backlog | Personalisation, Barbora's reviewed corrections and bounded noun integration with the lesson count fixed |
| B15–B18, B22 | Scoring, notes, mobile readability, recall/cache consistency and truthful diagnostics/version reporting |

No changes to dev/main, lesson wording, paid API permissions or production data are included in batch 1. The branch is a work in progress, not a beta release candidate approved for users.

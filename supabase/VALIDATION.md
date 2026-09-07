# Atomic Library sync validation

Target: Supabase project `Zodis-app / zodis` (`gsxfdekilabnalxuqose`), `main` / Production.

## Confirmed configuration

- The ready Vercel preview at `learning-lithuanian-5kuathwlt-davids-projects-25f8617a.vercel.app` was built from commit `4a39d7694681cd218e6092c5728e63809b578a39` on `codex/beta-3-release-fixes`.
- Its compiled client contains `https://gsxfdekilabnalxuqose.supabase.co`, so the preview and the inspected database match.
- `public.phrases` has a UUID primary key plus `user_id`, `data`, `updated_at`, `deleted_at`, `local_id`, and `content_key`.
- `(user_id, local_id)` is unique. `user_id` references `auth.users(id)` with `ON DELETE CASCADE`.
- `phonetic_ipa_backfill_queue.phrase_id` and `phonetic_ipa_backfill_jobs.phrase_id` reference `phrases(id)` with `ON DELETE CASCADE`.
- Row-level security is enabled. SELECT, INSERT, UPDATE, and DELETE require `auth.uid() = user_id` and a matching email in `beta_allowlist`.
- The live table currently contains 1,009 rows, no missing `_id` values, and no duplicate `(user_id, data->_id)` groups. The pronunciation queue contains 292 rows and the jobs table contains none.
- Neither `zodis_phrase_snapshot()` nor `zodis_replace_phrase_snapshot(jsonb, text)` is installed yet.

These are global database counts. They are not a count of any one user's Library.

## Migration invariants

The migration must preserve all of the following:

1. A signed-in caller can only read or replace their own Library under the existing RLS policies.
2. Every supplied entry is an object with a non-empty string `_id`, and `_id` values are unique within the supplied snapshot.
3. A replacement is accepted only when its expected revision matches a fresh snapshot taken after the account advisory lock is acquired.
4. Existing rows with retained `_id` values are updated in place. Their `phrases.id` UUID and linked pronunciation records therefore survive.
5. Rows absent from the requested complete snapshot are deleted. This is intentional overwrite behaviour and will cascade to their linked pronunciation records.
6. Inserts, updates, deletes, and the returned revision occur in one transaction. Any constraint, RLS, or validation error rolls the replacement back.
7. `anon` and `public` cannot execute either RPC. `authenticated` can execute them, while RLS remains the data-access boundary because both functions are `SECURITY INVOKER`.

## Production validation sequence

### 1. Read-only preflight

Repeat the schema, constraint, RLS, function-existence, and identity-count queries immediately before installation. Stop if the results differ from the confirmed configuration above.

### 2. Rolled-back installation check

Run the exact migration in a transaction with the final `commit` changed to `rollback`. Confirm both function definitions compile and all GRANT/REVOKE statements succeed. Confirm afterwards that neither function exists.

### 3. Install

Run the unchanged migration once. Installation creates or replaces the two functions and their execution permissions; it does not alter any phrase row.

### 4. Transactional behaviour checks

Run `supabase/validate_atomic_phrase_sync.sql`. It selects an eligible account internally without printing or storing its identity, performs the following checks in one explicit transaction, and finishes with `rollback`:

- Capture one allowlisted account's full snapshot and revision.
- Add one uniquely named synthetic phrase through `zodis_replace_phrase_snapshot`; confirm it receives a database UUID and the returned revision changes.
- Replace that synthetic phrase with changed JSON; confirm its database UUID is unchanged.
- If the chosen account has an existing pronunciation queue record, update that phrase's JSON through the RPC and confirm both its UUID and linked queue row remain unchanged.
- Retry using the earlier revision; require SQLSTATE `40001` and confirm the snapshot did not change.
- Submit a duplicate `_id` and an entry without `_id`; require SQLSTATE `22023` and confirm neither attempt changes the snapshot.
- Remove only the synthetic phrase from the submitted snapshot; confirm only that phrase is removed.
- Under the authenticated role and the chosen account's claims, confirm rows belonging to other users remain invisible.
- Under the anonymous role with no user claim, confirm execution is denied/sign-in is required.
- Roll back, then confirm the account's row count, phrase UUIDs, snapshot revision, and pronunciation queue counts match their pre-test values.

Do not use a partial list as the RPC input: it represents the complete Library and omissions are deletions.

### 5. App verification

Using the authenticated preview:

1. Load the cloud Library and record the visible phrase count.
2. Add a distinctive test phrase locally and run **Sync (merge)**.
3. Refresh or open a second browser/device, load cloud, and confirm the phrase appears.
4. Edit the phrase on the second client, sync, then sync the first client and confirm the change is received.
5. Create a stale-revision situation and confirm the app asks for another sync instead of overwriting the newer cloud state.
6. Confirm a phrase with pronunciation data still plays correctly after an in-place Library update.
7. Remove the distinctive test phrase and sync again.

## Known rollout limit

The advisory lock coordinates clients using the new RPC. An older deployed client that writes `phrases` directly does not acquire that lock and can still race with a new client. Retire or disable legacy direct-write sync before treating revision protection as universal.

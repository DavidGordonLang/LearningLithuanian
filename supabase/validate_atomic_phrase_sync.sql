-- Run only after installing 20260907_atomic_phrase_sync.sql.
-- Every phrase mutation in this validation is rolled back at the end.
-- A raised exception is a failed assertion; do not install/release on failure.
begin;

-- Select an allowlisted account with an existing linked pronunciation row.
-- Keep the identity in transaction-local settings so no account details need
-- to be copied into this file or printed in the results.
do $$
declare
  chosen record;
  linked_count bigint;
begin
  select p.user_id, u.email, p.id as phrase_id, p.data->>'_id' as app_id
    into chosen
    from public.phrases p
    join public.phonetic_ipa_backfill_queue q on q.phrase_id = p.id
    join auth.users u on u.id = p.user_id
    join public.beta_allowlist b on lower(b.email) = lower(u.email)
   where jsonb_typeof(p.data->'_id') = 'string' and length(p.data->>'_id') > 0
   order by p.user_id, p.id
   limit 1;
  if not found then
    raise exception 'Validation needs an allowlisted account with a linked pronunciation row';
  end if;

  select count(*) into linked_count
    from public.phonetic_ipa_backfill_queue q where q.phrase_id = chosen.phrase_id;
  perform set_config('zodis.validation.user_id', chosen.user_id::text, true);
  perform set_config('zodis.validation.email', chosen.email, true);
  perform set_config('zodis.validation.phrase_id', chosen.phrase_id::text, true);
  perform set_config('zodis.validation.app_id', chosen.app_id, true);
  perform set_config('zodis.validation.queue_count', linked_count::text, true);
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('zodis.validation.user_id'), true);
select set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', current_setting('zodis.validation.user_id'),
    'email', current_setting('zodis.validation.email'),
    'role', 'authenticated'
  )::text,
  true
);

do $$
declare
  owner_id uuid := current_setting('zodis.validation.user_id')::uuid;
  linked_phrase_id uuid := current_setting('zodis.validation.phrase_id')::uuid;
  linked_app_id text := current_setting('zodis.validation.app_id');
  test_id text := '__zodis_sync_validation_' || txid_current()::text;
  baseline jsonb;
  result jsonb;
  before_invalid jsonb;
  requested_rows jsonb;
  observed_id uuid;
begin
  baseline := public.zodis_phrase_snapshot();

  -- Successful insert.
  requested_rows := baseline->'rows' || jsonb_build_array(jsonb_build_object(
    '_id', test_id,
    'Lithuanian', 'Sinchronizavimo patikra',
    'English', 'Sync validation',
    '_ts', 0
  ));
  result := public.zodis_replace_phrase_snapshot(requested_rows, baseline->>'revision');
  if result->>'revision' is not distinct from baseline->>'revision' then
    raise exception 'Adding a phrase did not change the revision';
  end if;
  select p.id into observed_id from public.phrases p
    where p.user_id = owner_id and p.data->>'_id' = test_id;
  if observed_id is null then raise exception 'Synthetic phrase was not inserted'; end if;
  perform set_config('zodis.validation.synthetic_phrase_id', observed_id::text, true);

  -- In-place update preserves the phrase database UUID.
  select jsonb_agg(
           case when r.value->>'_id' = test_id
             then r.value || jsonb_build_object('English', 'Updated sync validation')
             else r.value end
           order by r.value::text collate "C"
         )
    into requested_rows
    from jsonb_array_elements(result->'rows') r(value);
  result := public.zodis_replace_phrase_snapshot(requested_rows, result->>'revision');
  select p.id into observed_id from public.phrases p
    where p.user_id = owner_id and p.data->>'_id' = test_id;
  if observed_id::text is distinct from current_setting('zodis.validation.synthetic_phrase_id') then
    raise exception 'Updating a phrase changed its database UUID';
  end if;

  -- Update a real phrase that has a pronunciation link; its UUID must survive.
  select jsonb_agg(
           case when r.value->>'_id' = linked_app_id
             then r.value || jsonb_build_object('_zodis_sync_validation', true)
             else r.value end
           order by r.value::text collate "C"
         )
    into requested_rows
    from jsonb_array_elements(result->'rows') r(value);
  result := public.zodis_replace_phrase_snapshot(requested_rows, result->>'revision');
  select p.id into observed_id from public.phrases p
    where p.user_id = owner_id and p.data->>'_id' = linked_app_id;
  if observed_id is distinct from linked_phrase_id then
    raise exception 'Updating a linked phrase changed its database UUID';
  end if;

  -- A stale client must not overwrite the newer snapshot.
  begin
    perform public.zodis_replace_phrase_snapshot(baseline->'rows', baseline->>'revision');
    raise exception 'Stale revision was accepted';
  exception when serialization_failure then
    null;
  end;

  before_invalid := public.zodis_phrase_snapshot();

  -- Invalid input must fail before changing the snapshot.
  begin
    perform public.zodis_replace_phrase_snapshot(
      before_invalid->'rows' || jsonb_build_array(jsonb_build_object('_id', test_id)),
      before_invalid->>'revision'
    );
    raise exception 'Duplicate app ID was accepted';
  exception when invalid_parameter_value then
    null;
  end;
  if (public.zodis_phrase_snapshot()->>'revision') is distinct from before_invalid->>'revision' then
    raise exception 'Duplicate-ID failure changed the snapshot';
  end if;

  begin
    perform public.zodis_replace_phrase_snapshot(
      before_invalid->'rows' || jsonb_build_array(jsonb_build_object('English', 'Missing ID')),
      before_invalid->>'revision'
    );
    raise exception 'Entry without app ID was accepted';
  exception when invalid_parameter_value then
    null;
  end;
  if (public.zodis_phrase_snapshot()->>'revision') is distinct from before_invalid->>'revision' then
    raise exception 'Missing-ID failure changed the snapshot';
  end if;

  -- Restore the exact baseline. This deletes only the synthetic phrase and
  -- restores the temporary JSON marker on the linked phrase.
  result := public.zodis_replace_phrase_snapshot(
    baseline->'rows',
    (public.zodis_phrase_snapshot())->>'revision'
  );
  if result->>'revision' is distinct from baseline->>'revision' then
    raise exception 'Restored snapshot does not match the baseline';
  end if;
  if exists (select 1 from public.phrases p
              where p.user_id = owner_id and p.data->>'_id' = test_id) then
    raise exception 'Synthetic phrase was not removed';
  end if;
  if exists (select 1 from public.phrases p where p.user_id <> owner_id) then
    raise exception 'Authenticated account can see another account through RLS';
  end if;
end;
$$;

reset role;

do $$
declare
  linked_phrase_id uuid := current_setting('zodis.validation.phrase_id')::uuid;
  expected_count bigint := current_setting('zodis.validation.queue_count')::bigint;
  actual_count bigint;
begin
  select count(*) into actual_count
    from public.phonetic_ipa_backfill_queue q where q.phrase_id = linked_phrase_id;
  if actual_count is distinct from expected_count then
    raise exception 'Linked pronunciation records changed during in-place updates';
  end if;
end;
$$;

-- Anonymous callers must not be able to execute the RPC.
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);
set local role anon;
do $$
begin
  begin
    perform public.zodis_phrase_snapshot();
    raise exception 'Anonymous execution was accepted';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;
reset role;

select 'PASS: atomic phrase sync validation completed; transaction will roll back' as result;
rollback;

-- Run only after installing 20260908_atomic_learning_sync.sql.
-- All mutations are rolled back at the end.
begin;

do $$
declare chosen record; linked_count bigint;
begin
  select p.user_id, u.email, p.id as phrase_id, p.data->>'_id' as app_id
    into chosen
    from public.phrases p
    join public.phonetic_ipa_backfill_queue q on q.phrase_id = p.id
    join auth.users u on u.id = p.user_id
    join public.beta_allowlist b on lower(b.email) = lower(u.email)
   where jsonb_typeof(p.data->'_id') = 'string' and length(p.data->>'_id') > 0
   order by p.user_id, p.id limit 1;
  if not found then raise exception 'Validation needs an allowlisted account with a linked pronunciation row'; end if;
  select count(*) into linked_count from public.phonetic_ipa_backfill_queue where phrase_id = chosen.phrase_id;
  perform set_config('zodis.validation.user_id', chosen.user_id::text, true);
  perform set_config('zodis.validation.email', chosen.email, true);
  perform set_config('zodis.validation.phrase_id', chosen.phrase_id::text, true);
  perform set_config('zodis.validation.app_id', chosen.app_id, true);
  perform set_config('zodis.validation.queue_count', linked_count::text, true);
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('zodis.validation.user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', current_setting('zodis.validation.user_id'),
  'email', current_setting('zodis.validation.email'),
  'role', 'authenticated'
)::text, true);

do $$
declare
  owner_id uuid := current_setting('zodis.validation.user_id')::uuid;
  linked_phrase_id uuid := current_setting('zodis.validation.phrase_id')::uuid;
  linked_app_id text := current_setting('zodis.validation.app_id');
  phrase_test_id text := '__zodis_learning_phrase_' || txid_current()::text;
  scenario_test_id text := '__zodis_learning_scenario_' || txid_current()::text;
  baseline jsonb;
  result jsonb;
  before_invalid jsonb;
  requested_phrases jsonb;
  requested_scenarios jsonb;
  observed_phrase_id uuid;
begin
  baseline := public.zodis_learning_snapshot();

  requested_phrases := baseline->'phrases' || jsonb_build_array(jsonb_build_object(
    '_id', phrase_test_id, 'Lithuanian', 'Sinchronizavimo patikra',
    'English', 'Sync validation', '_ts', 0
  ));
  requested_scenarios := baseline->'scenarios' || jsonb_build_array(jsonb_build_object(
    'id', scenario_test_id, 'title', 'Sync validation',
    'phraseIds', jsonb_build_array(phrase_test_id),
    'createdAt', 0, 'updatedAt', 0, '_deleted', false
  ));
  result := public.zodis_replace_learning_snapshot(
    requested_phrases, requested_scenarios, baseline->>'revision'
  );
  if result->>'revision' is not distinct from baseline->>'revision' then
    raise exception 'Adding a phrase and scenario did not change the revision';
  end if;
  if not exists (select 1 from public.zodis_scenarios
    where user_id = owner_id and scenario_id = scenario_test_id
      and data->'phraseIds' @> jsonb_build_array(phrase_test_id)) then
    raise exception 'Synthetic scenario or phrase link was not inserted';
  end if;
  select id into observed_phrase_id from public.phrases
    where user_id = owner_id and data->>'_id' = phrase_test_id;
  if observed_phrase_id is null then raise exception 'Synthetic phrase was not inserted'; end if;
  perform set_config('zodis.validation.synthetic_phrase_id', observed_phrase_id::text, true);

  -- Updating both records must preserve the phrase database UUID.
  select jsonb_agg(case when r.value->>'_id' = phrase_test_id
      then r.value || jsonb_build_object('English', 'Updated sync validation')
      else r.value end order by r.value::text collate "C")
    into requested_phrases from jsonb_array_elements(result->'phrases') r(value);
  select jsonb_agg(case when r.value->>'id' = scenario_test_id
      then r.value || jsonb_build_object('title', 'Updated scenario', 'updatedAt', 1)
      else r.value end order by r.value::text collate "C")
    into requested_scenarios from jsonb_array_elements(result->'scenarios') r(value);
  result := public.zodis_replace_learning_snapshot(
    requested_phrases, requested_scenarios, result->>'revision'
  );
  select id into observed_phrase_id from public.phrases
    where user_id = owner_id and data->>'_id' = phrase_test_id;
  if observed_phrase_id::text is distinct from current_setting('zodis.validation.synthetic_phrase_id') then
    raise exception 'Updating the combined snapshot changed a phrase database UUID';
  end if;

  -- A real phrase with linked pronunciation data must also keep its UUID.
  select jsonb_agg(case when r.value->>'_id' = linked_app_id
      then r.value || jsonb_build_object('_zodis_learning_sync_validation', true)
      else r.value end order by r.value::text collate "C")
    into requested_phrases from jsonb_array_elements(result->'phrases') r(value);
  result := public.zodis_replace_learning_snapshot(
    requested_phrases, result->'scenarios', result->>'revision'
  );
  select id into observed_phrase_id from public.phrases
    where user_id = owner_id and data->>'_id' = linked_app_id;
  if observed_phrase_id is distinct from linked_phrase_id then
    raise exception 'Updating a linked phrase changed its database UUID';
  end if;

  begin
    perform public.zodis_replace_learning_snapshot(
      baseline->'phrases', baseline->'scenarios', baseline->>'revision'
    );
    raise exception 'Stale combined revision was accepted';
  exception when serialization_failure then null;
  end;

  before_invalid := public.zodis_learning_snapshot();
  begin
    perform public.zodis_replace_learning_snapshot(
      before_invalid->'phrases',
      before_invalid->'scenarios' || jsonb_build_array(jsonb_build_object(
        'id', scenario_test_id, 'title', 'Duplicate', 'phraseIds', '[]'::jsonb
      )),
      before_invalid->>'revision'
    );
    raise exception 'Duplicate scenario ID was accepted';
  exception when invalid_parameter_value then null;
  end;
  if (public.zodis_learning_snapshot()->>'revision') is distinct from before_invalid->>'revision' then
    raise exception 'Invalid scenario input changed the snapshot';
  end if;

  result := public.zodis_replace_learning_snapshot(
    baseline->'phrases', baseline->'scenarios',
    (public.zodis_learning_snapshot())->>'revision'
  );
  if result->>'revision' is distinct from baseline->>'revision' then
    raise exception 'Restored combined snapshot does not match baseline';
  end if;
  if exists (select 1 from public.zodis_scenarios
    where user_id = owner_id and scenario_id = scenario_test_id) then
    raise exception 'Synthetic scenario was not removed';
  end if;
  if exists (select 1 from public.zodis_scenarios where user_id <> owner_id) then
    raise exception 'Authenticated account can see another account scenario through RLS';
  end if;
end;
$$;

reset role;

do $$
declare actual_count bigint;
begin
  select count(*) into actual_count from public.phonetic_ipa_backfill_queue
    where phrase_id = current_setting('zodis.validation.phrase_id')::uuid;
  if actual_count is distinct from current_setting('zodis.validation.queue_count')::bigint then
    raise exception 'Linked pronunciation records changed during combined sync';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);
set local role anon;
do $$
begin
  begin
    perform public.zodis_learning_snapshot();
    raise exception 'Anonymous learning snapshot execution was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

select 'PASS: atomic phrase and scenario sync validation completed; transaction will roll back' as result;
rollback;

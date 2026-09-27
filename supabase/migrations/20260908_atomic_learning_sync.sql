-- Adds account-isolated scenario storage and an atomic phrase + scenario sync.
-- Existing phrases and pronunciation links are not rewritten on installation.
begin;

create table public.zodis_scenarios (
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null,
  data jsonb not null,
  primary key (user_id, scenario_id),
  constraint zodis_scenarios_data_object check (jsonb_typeof(data) = 'object'),
  constraint zodis_scenarios_identity check (
    jsonb_typeof(data->'id') = 'string'
    and length(data->>'id') > 0
    and scenario_id = data->>'id'
  )
);

alter table public.zodis_scenarios enable row level security;

create policy "Users read their own Zodis scenarios"
  on public.zodis_scenarios for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert their own Zodis scenarios"
  on public.zodis_scenarios for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own Zodis scenarios"
  on public.zodis_scenarios for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own Zodis scenarios"
  on public.zodis_scenarios for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.zodis_scenarios from public, anon;
grant select, insert, update, delete on table public.zodis_scenarios to authenticated;

create or replace function public.zodis_learning_snapshot()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  phrase_rows jsonb;
  scenario_rows jsonb;
  payload jsonb;
begin
  if owner_id is null then raise exception 'Sign in required' using errcode = '42501'; end if;

  select coalesce(jsonb_agg(to_jsonb(p.data) order by to_jsonb(p.data)::text collate "C"), '[]'::jsonb)
    into phrase_rows from public.phrases p where p.user_id = owner_id;
  select coalesce(jsonb_agg(to_jsonb(s.data) order by to_jsonb(s.data)::text collate "C"), '[]'::jsonb)
    into scenario_rows from public.zodis_scenarios s where s.user_id = owner_id;

  payload := jsonb_build_object('phrases', phrase_rows, 'scenarios', scenario_rows);
  return payload || jsonb_build_object('revision', md5(payload::text));
end;
$$;

create or replace function public.zodis_replace_learning_snapshot(
  p_phrases jsonb,
  p_scenarios jsonb,
  p_expected_revision text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  before_snapshot jsonb;
begin
  if owner_id is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if jsonb_typeof(p_phrases) is distinct from 'array'
     or jsonb_typeof(p_scenarios) is distinct from 'array'
     or p_expected_revision is null then
    raise exception 'Complete phrases, scenarios and revision are required' using errcode = '22023';
  end if;

  if exists (select 1 from jsonb_array_elements(p_phrases) r(value)
    where jsonb_typeof(r.value) is distinct from 'object'
       or jsonb_typeof(r.value->'_id') is distinct from 'string'
       or length(r.value->>'_id') = 0) then
    raise exception 'Each phrase must have a stable ID' using errcode = '22023';
  end if;
  if (select count(*) <> count(distinct r.value->>'_id') from jsonb_array_elements(p_phrases) r(value)) then
    raise exception 'Phrase IDs must be unique' using errcode = '22023';
  end if;

  if exists (select 1 from jsonb_array_elements(p_scenarios) r(value)
    where jsonb_typeof(r.value) is distinct from 'object'
       or jsonb_typeof(r.value->'id') is distinct from 'string'
       or length(r.value->>'id') = 0
       or jsonb_typeof(r.value->'phraseIds') is distinct from 'array') then
    raise exception 'Each scenario must have an ID and phrase list' using errcode = '22023';
  end if;
  if (select count(*) <> count(distinct r.value->>'id') from jsonb_array_elements(p_scenarios) r(value)) then
    raise exception 'Scenario IDs must be unique' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_scenarios) r(value)
    cross join lateral jsonb_array_elements(r.value->'phraseIds') phrase_id(value)
    where jsonb_typeof(phrase_id.value) is distinct from 'string'
       or length(phrase_id.value #>> '{}') = 0) then
    raise exception 'Scenario phrase IDs must be strings' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  before_snapshot := public.zodis_learning_snapshot();
  if before_snapshot->>'revision' is distinct from p_expected_revision then
    raise exception 'Cloud Library changed; read it again before saving' using errcode = '40001';
  end if;

  -- Preserve database UUIDs for retained phrases and their linked records.
  if exists (select 1 from public.phrases p where p.user_id = owner_id
    and (jsonb_typeof(p.data->'_id') is distinct from 'string' or length(p.data->>'_id') = 0))
    or exists (select 1 from public.phrases p where p.user_id = owner_id
      group by p.data->>'_id' having count(*) > 1) then
    raise exception 'Existing Library identities need review before syncing' using errcode = '22023';
  end if;

  delete from public.phrases p where p.user_id = owner_id
    and not exists (select 1 from jsonb_array_elements(p_phrases) r where r->>'_id' = p.data->>'_id');
  update public.phrases p set data = r.value
    from jsonb_array_elements(p_phrases) r(value)
    where p.user_id = owner_id and p.data->>'_id' = r.value->>'_id'
      and p.data is distinct from r.value;
  insert into public.phrases(user_id, data)
    select owner_id, r.value from jsonb_array_elements(p_phrases) r(value)
    where not exists (select 1 from public.phrases p
      where p.user_id = owner_id and p.data->>'_id' = r.value->>'_id');

  delete from public.zodis_scenarios s where s.user_id = owner_id
    and not exists (select 1 from jsonb_array_elements(p_scenarios) r where r->>'id' = s.scenario_id);
  update public.zodis_scenarios s set data = r.value
    from jsonb_array_elements(p_scenarios) r(value)
    where s.user_id = owner_id and s.scenario_id = r.value->>'id'
      and s.data is distinct from r.value;
  insert into public.zodis_scenarios(user_id, scenario_id, data)
    select owner_id, r.value->>'id', r.value from jsonb_array_elements(p_scenarios) r(value)
    where not exists (select 1 from public.zodis_scenarios s
      where s.user_id = owner_id and s.scenario_id = r.value->>'id');

  return public.zodis_learning_snapshot();
end;
$$;

revoke all on function public.zodis_learning_snapshot() from public, anon;
revoke all on function public.zodis_replace_learning_snapshot(jsonb, jsonb, text) from public, anon;
grant execute on function public.zodis_learning_snapshot() to authenticated;
grant execute on function public.zodis_replace_learning_snapshot(jsonb, jsonb, text) to authenticated;

commit;

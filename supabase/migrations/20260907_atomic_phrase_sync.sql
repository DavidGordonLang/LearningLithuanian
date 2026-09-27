-- Validate this migration in a rolled-back transaction before production installation.
-- Uses only the existing phrases(user_id, data) insertion contract. No data is
-- changed by installing these functions. Execution uses the caller's RLS.
begin;

create or replace function public.zodis_phrase_snapshot()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  snapshot jsonb;
begin
  if owner_id is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(to_jsonb(p.data) order by to_jsonb(p.data)::text collate "C"), '[]'::jsonb)
    into snapshot from public.phrases p where p.user_id = owner_id;
  return jsonb_build_object('rows', snapshot, 'revision', md5(snapshot::text));
end;
$$;

create or replace function public.zodis_replace_phrase_snapshot(p_rows jsonb, p_expected_revision text)
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
  if jsonb_typeof(p_rows) is distinct from 'array' or p_expected_revision is null then
    raise exception 'A complete library and its revision are required' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_array_elements(p_rows) r
    where jsonb_typeof(r) is distinct from 'object'
       or jsonb_typeof(r->'_id') is distinct from 'string' or length(r->>'_id') = 0) then
    raise exception 'Each entry must have a stable ID' using errcode = '22023';
  end if;
  if (select count(*) <> count(distinct r->>'_id') from jsonb_array_elements(p_rows) r) then
    raise exception 'Library entry IDs must be unique' using errcode = '22023';
  end if;

  -- Serialise upgraded clients per account; compare the snapshot after locking.
  -- Older clients that write the table directly do not participate in this lock,
  -- so they must be retired before this becomes the only conflict guarantee.
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  before_snapshot := public.zodis_phrase_snapshot();
  if before_snapshot->>'revision' is distinct from p_expected_revision then
    raise exception 'Cloud library changed; read it again before saving' using errcode = '40001';
  end if;

  -- Preserve database UUIDs for surviving entries: backfill tables reference them.
  if exists (select 1 from public.phrases p where p.user_id = owner_id
    and (jsonb_typeof(p.data->'_id') is distinct from 'string' or length(p.data->>'_id') = 0))
    or exists (select 1 from public.phrases p where p.user_id = owner_id
      group by p.data->>'_id' having count(*) > 1) then
    raise exception 'Existing library identities need review before syncing' using errcode = '22023';
  end if;

  -- Only entries actually absent from the requested snapshot are removed.
  delete from public.phrases p where p.user_id = owner_id
    and not exists (select 1 from jsonb_array_elements(p_rows) r where r->>'_id' = p.data->>'_id');

  update public.phrases p set data = r.value
    from jsonb_array_elements(p_rows) r(value)
    where p.user_id = owner_id and p.data->>'_id' = r.value->>'_id'
      and p.data is distinct from r.value;

  insert into public.phrases(user_id, data)
    select owner_id, r.value from jsonb_array_elements(p_rows) r(value)
    where not exists (select 1 from public.phrases p
      where p.user_id = owner_id and p.data->>'_id' = r.value->>'_id');
  -- Any constraint/RLS failure rolls back the entire replacement.
  return public.zodis_phrase_snapshot();
end;
$$;

revoke all on function public.zodis_phrase_snapshot() from public, anon;
revoke all on function public.zodis_replace_phrase_snapshot(jsonb, text) from public, anon;
grant execute on function public.zodis_phrase_snapshot() to authenticated;
grant execute on function public.zodis_replace_phrase_snapshot(jsonb, text) to authenticated;
commit;

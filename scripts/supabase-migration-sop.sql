-- Table
create table if not exists public.sops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  storage_path text not null unique,
  mime_type text not null check (mime_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  status text not null default 'pending' check (status in ('pending','ready')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (not is_active or status = 'ready')
);

create index if not exists sops_user_created_idx on public.sops (user_id, created_at desc);
create unique index if not exists sops_one_active_per_user on public.sops (user_id) where is_active;

alter table public.sops enable row level security;
create policy "sops_select_own" on public.sops for select using (auth.uid() = user_id);
-- No insert/update/delete policies: all writes go through the functions below (service role only).

-- Rate-limit log
create table if not exists public.sop_upload_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists sop_upload_events_user_idx on public.sop_upload_events (user_id, created_at desc);
alter table public.sop_upload_events enable row level security; -- no policies = no client access

-- 1) Create a pending row, enforcing count / total size / rate limit atomically
create or replace function public.create_pending_sop(
  p_user_id uuid, p_display_name text, p_storage_path text, p_mime text, p_size integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_purged text[]; v_count int; v_total bigint; v_recent int; v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text), 0);

  -- purge abandoned uploads (pending > 30 min)
  with d as (
    delete from sops where user_id = p_user_id and status = 'pending'
      and created_at < now() - interval '30 minutes' returning storage_path)
  select coalesce(array_agg(storage_path), '{}') into v_purged from d;

  delete from sop_upload_events where user_id = p_user_id and created_at < now() - interval '1 day';

  select count(*) into v_recent from sop_upload_events
    where user_id = p_user_id and created_at > now() - interval '1 hour';
  if v_recent >= 10 then
    return jsonb_build_object('ok', false, 'error', 'rate_limit', 'purged_paths', v_purged);
  end if;

  select count(*), coalesce(sum(size_bytes), 0) into v_count, v_total from sops where user_id = p_user_id;
  if v_count >= 5 then
    return jsonb_build_object('ok', false, 'error', 'limit_count', 'purged_paths', v_purged);
  end if;
  if v_total + p_size > 26214400 then
    return jsonb_build_object('ok', false, 'error', 'limit_total', 'purged_paths', v_purged);
  end if;

  insert into sop_upload_events (user_id) values (p_user_id);
  insert into sops (user_id, display_name, storage_path, mime_type, size_bytes)
    values (p_user_id, p_display_name, p_storage_path, p_mime, p_size) returning id into v_id;

  return jsonb_build_object('ok', true, 'sop_id', v_id, 'purged_paths', v_purged);
end $$;

-- 2) Mark ready after the file passed checks; first ready SOP becomes active
create or replace function public.finalize_sop(p_user_id uuid, p_sop_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text), 0);
  update sops set status = 'ready' where id = p_sop_id and user_id = p_user_id and status = 'pending';
  if not found then return jsonb_build_object('ok', false); end if;
  if not exists (select 1 from sops where user_id = p_user_id and is_active) then
    update sops set is_active = true where id = p_sop_id;
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- 3) Atomic active switch
create or replace function public.set_active_sop(p_user_id uuid, p_sop_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text), 0);
  if not exists (select 1 from sops where id = p_sop_id and user_id = p_user_id and status = 'ready') then
    return false;
  end if;
  update sops set is_active = false where user_id = p_user_id and is_active and id <> p_sop_id;
  update sops set is_active = true where id = p_sop_id and user_id = p_user_id;
  return true;
end $$;

-- 4) Delete a row; if it was active, the newest remaining ready SOP becomes active
create or replace function public.delete_sop(p_user_id uuid, p_sop_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_was_active boolean;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text), 0);
  delete from sops where id = p_sop_id and user_id = p_user_id returning is_active into v_was_active;
  if not found then return false; end if;
  if v_was_active then
    update sops set is_active = true where id = (
      select id from sops where user_id = p_user_id and status = 'ready'
      order by created_at desc limit 1);
  end if;
  return true;
end $$;

revoke all on function public.create_pending_sop(uuid, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.finalize_sop(uuid, uuid) from public, anon, authenticated;
revoke all on function public.set_active_sop(uuid, uuid) from public, anon, authenticated;
revoke all on function public.delete_sop(uuid, uuid) from public, anon, authenticated;
grant execute on function public.create_pending_sop(uuid, text, text, text, integer) to service_role;
grant execute on function public.finalize_sop(uuid, uuid) to service_role;
grant execute on function public.set_active_sop(uuid, uuid) to service_role;
grant execute on function public.delete_sop(uuid, uuid) to service_role;

-- Private storage bucket with hard limits enforced by Supabase itself
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sops', 'sops', false, 5242880, array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'])
on conflict (id) do nothing;
-- Do NOT add storage.objects policies: anon/authenticated get no direct access.

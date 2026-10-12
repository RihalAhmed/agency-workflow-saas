-- Titles + page count + updated_at
alter table public.sops rename column display_name to title;
alter table public.sops add column if not exists original_filename text
  check (original_filename is null or char_length(original_filename) <= 255);
alter table public.sops add column if not exists page_count integer
  check (page_count is null or (page_count between 1 and 50));
alter table public.sops add column if not exists updated_at timestamptz not null default now();

-- Backfill existing rows: keep the old name as original_filename, strip the extension for the title
update public.sops
set original_filename = coalesce(original_filename, title),
    title = left(nullif(btrim(regexp_replace(title, '\.[A-Za-z0-9]{1,5}$', '')), ''), 120)
where original_filename is null;
update public.sops set title = 'Untitled SOP' where title is null or btrim(title) = '';

drop function if exists public.create_pending_sop(uuid, text, text, text, integer);

-- Recreate create_pending_sop: same body as v1, with these differences
create or replace function public.create_pending_sop(
  p_user_id uuid, p_title text, p_original_filename text, p_storage_path text, p_mime text, p_size integer
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
  insert into sops (user_id, title, original_filename, storage_path, mime_type, size_bytes)
    values (p_user_id, p_title, p_original_filename, p_storage_path, p_mime, p_size) returning id into v_id;

  return jsonb_build_object('ok', true, 'sop_id', v_id, 'purged_paths', v_purged);
end $$;

-- finalize_sop now also records the page count
drop function if exists public.finalize_sop(uuid, uuid);
create or replace function public.finalize_sop(p_user_id uuid, p_sop_id uuid, p_page_count integer default null)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text), 0);
  update sops set status = 'ready', page_count = p_page_count, updated_at = now()
    where id = p_sop_id and user_id = p_user_id and status = 'pending';
  if not found then return jsonb_build_object('ok', false); end if;
  if not exists (select 1 from sops where user_id = p_user_id and is_active) then
    update sops set is_active = true where id = p_sop_id;
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- Rename
create or replace function public.rename_sop(p_user_id uuid, p_sop_id uuid, p_title text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update sops set title = p_title, updated_at = now()
    where id = p_sop_id and user_id = p_user_id and status = 'ready';
  return found;
end $$;

revoke all on function public.create_pending_sop(uuid, text, text, text, text, integer) from public, anon, authenticated;
revoke all on function public.finalize_sop(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.rename_sop(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.create_pending_sop(uuid, text, text, text, text, integer) to service_role;
grant execute on function public.finalize_sop(uuid, uuid, integer) to service_role;
grant execute on function public.rename_sop(uuid, uuid, text) to service_role;

-- Legacy .doc: stop accepting NEW uploads (bucket allowlist). Keep the table CHECK unchanged
-- so existing .doc rows stay valid.
update storage.buckets set allowed_mime_types = array[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'] where id = 'sops';

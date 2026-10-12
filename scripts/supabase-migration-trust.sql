-- Prosflow Trust Segment — Supabase Migration (Phase 0)
-- Run this in the Supabase Dashboard → SQL Editor.
--
-- Pattern (same as the SOP migration):
--   * RLS enabled everywhere, SELECT-only policies for the owner.
--   * All writes go through API route handlers using the service-role client
--     after requireApiUser().
--   * Privileged multi-row operations go through SECURITY DEFINER functions
--     that take p_user_id and are executable by service_role only.
--
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT.

begin;

-- ---------------------------------------------------------------------------
-- 1. Owner column on audits
-- ---------------------------------------------------------------------------
alter table public.audits
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists audits_user_idx on public.audits (user_id);

alter table public.audits enable row level security;
drop policy if exists audits_select_own on public.audits;
create policy audits_select_own on public.audits
  for select using (user_id = auth.uid());

-- Backfill legacy rows (run manually, replacing the UUID with your auth user id):
-- update public.audits set user_id = '00000000-0000-0000-0000-000000000000' where user_id is null;

-- ---------------------------------------------------------------------------
-- 2. Tables (ordered to avoid circular-FK problems)
-- ---------------------------------------------------------------------------

-- 2a. Portfolio pieces (no outbound FK to blueprints yet)
create table if not exists public.portfolio_pieces (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 120),
  source_url    text,
  niche         text not null,
  screenshot_url text not null,                 -- storage path in portfolio-screenshots
  slot_tags     text[] not null default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists portfolio_pieces_user_niche_idx
  on public.portfolio_pieces (user_id, niche, created_at desc);

-- 2b. Blueprints reference portfolio pieces
create table if not exists public.blueprints (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  portfolio_piece_id uuid not null references public.portfolio_pieces(id) on delete cascade,
  niche              text not null,
  regions            jsonb not null,             -- Blueprint['regions']
  created_at         timestamptz not null default now()
);
create index if not exists blueprints_user_niche_idx on public.blueprints (user_id, niche);

-- 2c. Back-reference on portfolio_pieces (added after blueprints exists).
-- ON DELETE SET NULL so removing a blueprint never blocks on its piece.
alter table public.portfolio_pieces
  add column if not exists blueprint_id uuid references public.blueprints(id) on delete set null;

-- 2d. Active blueprint per niche per user
create table if not exists public.active_blueprints (
  user_id      uuid not null references auth.users(id) on delete cascade,
  niche        text not null,
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  primary key (user_id, niche)
);

-- 2e. One trust audit per audits row
create table if not exists public.trust_audits (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  audit_id            uuid not null unique references public.audits(id) on delete cascade,
  prospect_url        text not null,
  niche               text,
  screenshot_url      text,                      -- storage path in trust-screenshots
  screenshot_source   text check (screenshot_source in ('playwright','pagespeed','manual')),
  region_slices       jsonb,                     -- { header?, hero?, reviews?, about? } storage paths
  -- SET NULL: deleting a portfolio piece (→ its blueprint) must not fail
  -- because an old audit was scored against it.
  active_blueprint_id uuid references public.blueprints(id) on delete set null,
  signals             jsonb not null,            -- TrustSignals
  scores              jsonb not null,            -- TrustRow[]
  overall_score       int not null check (overall_score between 0 and 100),
  sections_present    int not null check (sections_present between 0 and 4),
  computed_at         timestamptz not null default now()
);
create index if not exists trust_audits_user_idx on public.trust_audits (user_id, computed_at desc);

-- 2f. Pinned portfolio pieces per trust row
create table if not exists public.trust_row_pins (
  trust_audit_id     uuid not null references public.trust_audits(id) on delete cascade,
  row_key            text not null check (row_key in (
                       'risk_reversal_usp','reviews_social_proof','trust_badges_reputation',
                       'personality_face','like_know_trust','emotional_backstory')),
  portfolio_piece_id uuid not null references public.portfolio_pieces(id) on delete cascade,
  pinned_at          timestamptz not null default now(),
  primary key (trust_audit_id, row_key)
);

-- ---------------------------------------------------------------------------
-- 3. RLS — select-only for the owner; no insert/update/delete policies
-- ---------------------------------------------------------------------------
alter table public.portfolio_pieces enable row level security;
drop policy if exists portfolio_pieces_select_own on public.portfolio_pieces;
create policy portfolio_pieces_select_own on public.portfolio_pieces
  for select using (user_id = auth.uid());

alter table public.blueprints enable row level security;
drop policy if exists blueprints_select_own on public.blueprints;
create policy blueprints_select_own on public.blueprints
  for select using (user_id = auth.uid());

alter table public.active_blueprints enable row level security;
drop policy if exists active_blueprints_select_own on public.active_blueprints;
create policy active_blueprints_select_own on public.active_blueprints
  for select using (user_id = auth.uid());

alter table public.trust_audits enable row level security;
drop policy if exists trust_audits_select_own on public.trust_audits;
create policy trust_audits_select_own on public.trust_audits
  for select using (user_id = auth.uid());

-- trust_row_pins has no user_id; ownership flows through trust_audits
alter table public.trust_row_pins enable row level security;
drop policy if exists trust_row_pins_select_own on public.trust_row_pins;
create policy trust_row_pins_select_own on public.trust_row_pins
  for select using (
    exists (
      select 1 from public.trust_audits a
      where a.id = trust_row_pins.trust_audit_id and a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. set_active_blueprint — service-role only, caller passes the verified user
-- ---------------------------------------------------------------------------
-- auth.uid() is NULL under the service-role client, so the user id is passed
-- explicitly from requireApiUser() (same as set_active_sop).
create or replace function public.set_active_blueprint(
  p_user_id uuid, p_niche text, p_blueprint_id uuid
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_user_id is null then
    return false;
  end if;
  -- Blueprint must exist, belong to the caller, and match the niche.
  if not exists (
    select 1 from blueprints
    where id = p_blueprint_id and user_id = p_user_id and niche = p_niche
  ) then
    return false;
  end if;

  insert into active_blueprints (user_id, niche, blueprint_id)
    values (p_user_id, p_niche, p_blueprint_id)
  on conflict (user_id, niche) do update set blueprint_id = excluded.blueprint_id;
  return true;
end $$;

revoke all on function public.set_active_blueprint(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.set_active_blueprint(uuid, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Storage buckets — private, 5 MB, images only. Reads via signed URL.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('trust-screenshots',     'trust-screenshots',     false, 5242880, array['image/png','image/jpeg','image/webp']),
  ('portfolio-screenshots', 'portfolio-screenshots', false, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
-- Do NOT add storage.objects policies: anon/authenticated get no direct access.

commit;

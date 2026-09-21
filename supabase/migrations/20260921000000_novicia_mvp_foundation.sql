-- NOVICIA 2026 MVP: event rules, private participant data, and admin access.
-- Apply with the Supabase CLI after linking the production project.

create extension if not exists pgcrypto;

-- The first SQL Editor attempt may have created this enum before stopping.
-- Preserve the existing, verified role values and allow a safe re-run.
do $$
begin
  create type public.admin_role as enum ('SUPER_ADMIN', 'EVENT_ADMIN', 'CHECKIN_ADMIN');
exception
  when duplicate_object then null;
end
$$;
-- Preserve the existing, verified participant lifecycle enum on re-runs.
do $$
begin
  create type public.participant_status as enum (
    'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'INVALID'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  venue_name text not null,
  capacity integer not null check (capacity > 0),
  registration_opens_at timestamptz not null default now(),
  registration_closes_at timestamptz,
  registration_is_open boolean not null default true,
  allowed_email_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.admin_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  participant_code text not null unique,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  admission_number text not null,
  department text not null,
  academic_year smallint not null check (academic_year = 1),
  college_email text not null,
  phone text not null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  photo_consent boolean not null default false,
  overnight_consent boolean not null,
  status public.participant_status not null default 'CONFIRMED',
  qr_token_hash text not null unique,
  qr_token_last4 text not null,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  checked_in_by uuid references public.profiles(id) on delete set null,
  checked_out_by uuid references public.profiles(id) on delete set null,
  cancelled_at timestamptz,
  invalidated_at timestamptz,
  invalidated_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, admission_number),
  unique (event_id, college_email),
  check (checked_out_at is null or checked_in_at is not null)
);

create index if not exists participants_event_status_created_idx
  on public.participants (event_id, status, created_at);
create index if not exists participants_event_name_idx
  on public.participants (event_id, full_name);
create index if not exists participants_event_phone_idx
  on public.participants (event_id, phone);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  message text not null,
  priority smallint not null default 0 check (priority between 0 and 2),
  is_pinned boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  event_id uuid references public.events(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_event_created_idx on public.audit_logs (event_id, created_at desc);

-- A profile is deliberately never self-created. Create the five launch admins
-- with a server-side provisioning process after their Auth accounts exist.
create or replace function public.current_admin_role()
returns public.admin_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.has_any_admin_role(allowed public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() = any(allowed), false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
do $$
begin
  create trigger participants_set_updated_at before update on public.participants
    for each row execute function public.set_updated_at();
exception
  when duplicate_object then null;
end
$$;
create trigger announcements_set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();

-- Public registration is intentionally a single transaction. An advisory lock
-- serializes registrations per event, so the 31st simultaneous request cannot
-- receive a confirmed place.
create or replace function public.register_for_novicia(
  p_event_slug text,
  p_full_name text,
  p_admission_number text,
  p_department text,
  p_academic_year smallint,
  p_college_email text,
  p_phone text,
  p_emergency_contact_name text,
  p_emergency_contact_phone text,
  p_photo_consent boolean,
  p_overnight_consent boolean
)
returns table(participant_id uuid, participant_code text, pass_token text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_event public.events;
  v_confirmed_count integer;
  v_participant_id uuid;
  v_participant_code text;
  v_pass_token text;
begin
  select * into v_event from public.events where slug = p_event_slug for update;
  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  -- Lock on the stable event UUID, even if future changes remove row locking.
  perform pg_advisory_xact_lock(hashtext(v_event.id::text));

  if not v_event.registration_is_open
     or now() < v_event.registration_opens_at
     or (v_event.registration_closes_at is not null and now() >= v_event.registration_closes_at) then
    raise exception 'REGISTRATION_CLOSED';
  end if;

  if p_academic_year <> 1 then
    raise exception 'INELIGIBLE_STUDENT';
  end if;

  if not p_overnight_consent then
    raise exception 'OVERNIGHT_CONSENT_REQUIRED';
  end if;

  if v_event.allowed_email_domain is not null
     and lower(split_part(trim(p_college_email), '@', 2)) <> lower(v_event.allowed_email_domain) then
    raise exception 'INELIGIBLE_EMAIL_DOMAIN';
  end if;

  if exists (
    select 1 from public.participants
    where event_id = v_event.id
      and (lower(college_email) = lower(trim(p_college_email))
        or lower(admission_number) = lower(trim(p_admission_number)))
  ) then
    raise exception 'DUPLICATE_REGISTRATION';
  end if;

  select count(*) into v_confirmed_count
  from public.participants
  where event_id = v_event.id
    and status in ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT');

  if v_confirmed_count >= v_event.capacity then
    update public.events set registration_is_open = false where id = v_event.id;
    raise exception 'REGISTRATION_CLOSED';
  end if;

  v_participant_id := gen_random_uuid();
  v_participant_code := 'NOV26-' || lpad((v_confirmed_count + 1)::text, 3, '0');
  v_pass_token := encode(gen_random_bytes(32), 'hex');

  insert into public.participants (
    id, event_id, participant_code, full_name, admission_number, department,
    academic_year, college_email, phone, emergency_contact_name,
    emergency_contact_phone, photo_consent, overnight_consent, qr_token_hash,
    qr_token_last4
  ) values (
    v_participant_id, v_event.id, v_participant_code, trim(p_full_name),
    trim(p_admission_number), trim(p_department), p_academic_year,
    lower(trim(p_college_email)), trim(p_phone), trim(p_emergency_contact_name),
    trim(p_emergency_contact_phone), p_photo_consent, p_overnight_consent,
    crypt(v_pass_token, gen_salt('bf')), right(v_pass_token, 4)
  );

  if v_confirmed_count + 1 = v_event.capacity then
    update public.events set registration_is_open = false where id = v_event.id;
  end if;

  insert into public.audit_logs (event_id, action, target_type, target_id, metadata)
  values (v_event.id, 'PARTICIPANT_REGISTERED', 'participant', v_participant_id::text,
    jsonb_build_object('participant_code', v_participant_code));

  return query select v_participant_id, v_participant_code, v_pass_token;
end;
$$;

-- This exposes only the public seat count needed by the registration page.
-- It deliberately does not expose names or any participant data.
create or replace function public.get_registration_status(p_event_slug text)
returns table(capacity integer, confirmed_count integer, registration_is_open boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.capacity,
    count(p.id) filter (where p.status in ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'))::integer,
    e.registration_is_open
  from public.events e
  left join public.participants p on p.event_id = e.id
  where e.slug = p_event_slug
  group by e.id;
$$;

-- A QR token is a bearer credential for the participant pass. This function
-- validates it without ever returning contact, emergency, or admin data.
create or replace function public.get_participant_pass(p_pass_token text)
returns table(
  participant_code text,
  full_name text,
  department text,
  event_name text,
  starts_at timestamptz,
  venue_name text,
  participant_status public.participant_status
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select p.participant_code, p.full_name, p.department, e.name, e.starts_at,
    e.venue_name, p.status
  from public.participants p
  join public.events e on e.id = p.event_id
  where crypt(p_pass_token, p.qr_token_hash) = p.qr_token_hash
    and p.status not in ('CANCELLED', 'INVALID');
$$;

create or replace function public.get_admin_dashboard_stats(p_event_slug text)
returns table(capacity integer, confirmed_count integer, checked_in_count integer, checked_out_count integer)
language sql stable security definer set search_path = public
as $$
  select e.capacity,
    count(p.id) filter (where p.status in ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'))::integer,
    count(p.id) filter (where p.status in ('CHECKED_IN', 'CHECKED_OUT'))::integer,
    count(p.id) filter (where p.status = 'CHECKED_OUT')::integer
  from public.events e left join public.participants p on p.event_id = e.id
  where e.slug = p_event_slug
    and public.has_any_admin_role(array['SUPER_ADMIN', 'EVENT_ADMIN', 'CHECKIN_ADMIN']::public.admin_role[])
  group by e.id;
$$;

create or replace function public.record_attendance(p_pass_token text, p_mode text)
returns table(participant_code text, full_name text, department text, participant_status public.participant_status, recorded_at timestamptz, outcome text)
language plpgsql security definer set search_path = public, extensions
as $$
declare v_participant public.participants; v_now timestamptz := now();
begin
  if not public.has_any_admin_role(array['SUPER_ADMIN', 'CHECKIN_ADMIN']::public.admin_role[]) then raise exception 'NOT_AUTHORIZED'; end if;
  if p_mode not in ('CHECK_IN', 'CHECK_OUT') then raise exception 'INVALID_ATTENDANCE_MODE'; end if;
  select * into v_participant from public.participants where crypt(p_pass_token, qr_token_hash) = qr_token_hash for update;
  if not found then raise exception 'INVALID_PASS'; end if;
  if v_participant.status in ('CANCELLED', 'INVALID') then raise exception 'INACTIVE_PARTICIPANT'; end if;
  if p_mode = 'CHECK_IN' then
    if v_participant.status in ('CHECKED_IN', 'CHECKED_OUT') then
      return query select v_participant.participant_code, v_participant.full_name, v_participant.department, v_participant.status, v_participant.checked_in_at, 'ALREADY_CHECKED_IN'; return;
    end if;
    update public.participants set status = 'CHECKED_IN', checked_in_at = v_now, checked_in_by = auth.uid() where id = v_participant.id;
    insert into public.audit_logs(event_id, actor_id, action, target_type, target_id) values (v_participant.event_id, auth.uid(), 'PARTICIPANT_CHECKED_IN', 'participant', v_participant.id::text);
    return query select v_participant.participant_code, v_participant.full_name, v_participant.department, 'CHECKED_IN'::public.participant_status, v_now, 'CHECKED_IN'; return;
  end if;
  if v_participant.status = 'CHECKED_OUT' then
    return query select v_participant.participant_code, v_participant.full_name, v_participant.department, v_participant.status, v_participant.checked_out_at, 'ALREADY_CHECKED_OUT'; return;
  end if;
  if v_participant.status <> 'CHECKED_IN' then raise exception 'NOT_CHECKED_IN'; end if;
  update public.participants set status = 'CHECKED_OUT', checked_out_at = v_now, checked_out_by = auth.uid() where id = v_participant.id;
  insert into public.audit_logs(event_id, actor_id, action, target_type, target_id) values (v_participant.event_id, auth.uid(), 'PARTICIPANT_CHECKED_OUT', 'participant', v_participant.id::text);
  return query select v_participant.participant_code, v_participant.full_name, v_participant.department, 'CHECKED_OUT'::public.participant_status, v_now, 'CHECKED_OUT';
end;
$$;

-- Rejected scans are logged in a separate successful transaction. Keeping this
-- separate is deliberate: a PostgreSQL exception rolls back its own audit row.
create or replace function public.log_attendance_rejection(p_reason text, p_token_suffix text)
returns void
language plpgsql security definer set search_path = public
as $$
declare v_event_id uuid;
begin
  if not public.has_any_admin_role(array['SUPER_ADMIN', 'CHECKIN_ADMIN']::public.admin_role[]) then raise exception 'NOT_AUTHORIZED'; end if;
  select id into v_event_id from public.events where slug = 'novicia-2026';
  insert into public.audit_logs(event_id, actor_id, action, target_type, metadata)
  values (v_event_id, auth.uid(), 'ATTENDANCE_REJECTED', 'attendance_attempt', jsonb_build_object('reason', left(p_reason, 80), 'token_suffix', right(p_token_suffix, 4)));
end;
$$;

create or replace function public.search_attendance_participants(p_query text)
returns table(participant_id uuid, participant_code text, full_name text, department text, participant_status public.participant_status, checked_in_at timestamptz, checked_out_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select p.id, p.participant_code, p.full_name, p.department, p.status, p.checked_in_at, p.checked_out_at
  from public.participants p
  where public.has_any_admin_role(array['SUPER_ADMIN', 'CHECKIN_ADMIN']::public.admin_role[])
    and length(trim(p_query)) >= 2
    and (p.participant_code ilike '%' || trim(p_query) || '%'
      or p.full_name ilike '%' || trim(p_query) || '%'
      or p.admission_number ilike '%' || trim(p_query) || '%')
  order by p.full_name limit 10;
$$;

alter table public.events enable row level security;
alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read event registration state" on public.events
  for select using (true);
create policy "admins can read profiles" on public.profiles
  for select using (public.has_any_admin_role(array['SUPER_ADMIN']::public.admin_role[]));
create policy "event admins can read participants" on public.participants
  for select using (public.has_any_admin_role(array['SUPER_ADMIN', 'EVENT_ADMIN']::public.admin_role[]));
create policy "event admins can update participants" on public.participants
  for update using (public.has_any_admin_role(array['SUPER_ADMIN', 'EVENT_ADMIN']::public.admin_role[]));
-- CHECKIN_ADMIN has no direct UPDATE policy: check-in/out will be exposed
-- through narrowly scoped RPCs, so that role cannot change private participant data.
create policy "public can read published announcements" on public.announcements
  for select using (is_published = true);
create policy "event admins manage announcements" on public.announcements
  for all using (public.has_any_admin_role(array['SUPER_ADMIN', 'EVENT_ADMIN']::public.admin_role[]));
create policy "super admins read audit logs" on public.audit_logs
  for select using (public.has_any_admin_role(array['SUPER_ADMIN']::public.admin_role[]));

revoke all on function public.register_for_novicia from public;
grant execute on function public.register_for_novicia to anon, authenticated;
revoke all on function public.get_registration_status from public;
grant execute on function public.get_registration_status to anon, authenticated;
revoke all on function public.get_participant_pass from public;
grant execute on function public.get_participant_pass to anon, authenticated;
revoke all on function public.get_admin_dashboard_stats from public;
grant execute on function public.get_admin_dashboard_stats to authenticated;
revoke all on function public.record_attendance from public;
grant execute on function public.record_attendance to authenticated;
revoke all on function public.log_attendance_rejection from public;
grant execute on function public.log_attendance_rejection to authenticated;
revoke all on function public.search_attendance_participants from public;
grant execute on function public.search_attendance_participants to authenticated;

insert into public.events (
  slug, name, starts_at, ends_at, venue_name, capacity, registration_is_open
) values (
  'novicia-2026', 'NOVICIA 2026', '2026-09-26 16:00:00+05:30',
  '2026-09-27 08:00:00+05:30', 'ASAP OpenMind, Kasaragod', 30, true
) on conflict (slug) do nothing;

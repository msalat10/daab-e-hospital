-- Patient portal auth linkage.
-- Run this after the base schema in the Supabase SQL editor.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('patient', 'doctor', 'admin');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patients
add column if not exists user_id uuid unique references auth.users(id) on delete cascade;

create index if not exists patients_user_id_idx
  on public.patients(user_id);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

-- Replace the MVP-wide patient policies with stricter versions before production.
-- The current app pages filter by user_id, and these policies are the target RLS shape:
--   patients.user_id = auth.uid()
--   appointments.patient_id in (select id from public.patients where user_id = auth.uid())

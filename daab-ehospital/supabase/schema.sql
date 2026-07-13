-- Dadaab E-Hospital MVP schema
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create type public.camp_name as enum ('Hagadera', 'Ifo', 'Dhagahley');
create type public.gender as enum ('female', 'male', 'other', 'prefer_not_to_say');
create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'missed',
  'cancelled'
);

create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  camp public.camp_name not null,
  location text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  clinic_id uuid references public.clinics(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  title text,
  specialty text,
  clinic_id uuid references public.clinics(id) on delete set null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  refugee_id text,
  phone text,
  gender public.gender,
  date_of_birth date,
  camp public.camp_name,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index patients_refugee_id_unique
  on public.patients(refugee_id)
  where refugee_id is not null and refugee_id <> '';

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinic_id uuid not null references public.clinics(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  doctor_id uuid references public.doctors(id) on delete set null,
  requested_date date not null,
  requested_time time,
  reason text,
  status public.appointment_status not null default 'pending',
  doctor_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_requested_date_idx
  on public.appointments(requested_date);

create index appointments_status_idx
  on public.appointments(status);

create index appointments_patient_id_idx
  on public.appointments(patient_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_clinics_updated_at
before update on public.clinics
for each row execute function public.set_updated_at();

create trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger set_doctors_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.clinics enable row level security;
alter table public.services enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;

-- Development policies for the MVP prototype.
-- Tighten these before production when auth roles are implemented.
create policy "Public read clinics"
on public.clinics for select
to anon, authenticated
using (true);

create policy "Public read services"
on public.services for select
to anon, authenticated
using (true);

create policy "Public read doctors"
on public.doctors for select
to anon, authenticated
using (true);

create policy "MVP patient read"
on public.patients for select
to anon, authenticated
using (true);

create policy "MVP patient insert"
on public.patients for insert
to anon, authenticated
with check (true);

create policy "MVP patient update"
on public.patients for update
to anon, authenticated
using (true)
with check (true);

create policy "MVP appointment read"
on public.appointments for select
to anon, authenticated
using (true);

create policy "MVP appointment insert"
on public.appointments for insert
to anon, authenticated
with check (true);

create policy "MVP appointment update"
on public.appointments for update
to anon, authenticated
using (true)
with check (true);

insert into public.clinics (name, camp, location, phone)
values
  ('Hagadera Main Clinic', 'Hagadera', 'Hagadera Camp', '+254700000001'),
  ('Ifo Health Post', 'Ifo', 'Ifo Camp', '+254700000002'),
  ('Dhagahley Clinic', 'Dhagahley', 'Dhagahley Camp', '+254700000003');

insert into public.services (name, description, clinic_id)
select service_name, service_description, clinics.id
from public.clinics
cross join (
  values
    ('General clinic visit', 'Routine consultation and triage'),
    ('Child health service', 'Pediatric care and follow-up'),
    ('Maternal care service', 'Antenatal and maternal health visit')
) as service_seed(service_name, service_description);

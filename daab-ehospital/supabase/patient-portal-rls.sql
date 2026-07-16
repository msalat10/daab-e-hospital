-- Patient portal production RLS.
-- Run this only after auth is enabled again and patients.user_id is populated.
-- It replaces the broad MVP policies from supabase/schema.sql.

drop policy if exists "MVP patient read" on public.patients;
drop policy if exists "MVP patient insert" on public.patients;
drop policy if exists "MVP patient update" on public.patients;

drop policy if exists "MVP appointment read" on public.appointments;
drop policy if exists "MVP appointment insert" on public.appointments;
drop policy if exists "MVP appointment update" on public.appointments;

alter table public.patients enable row level security;
alter table public.appointments enable row level security;

create policy "Patients read own record"
on public.patients for select
to authenticated
using (user_id = auth.uid());

create policy "Patients create own record"
on public.patients for insert
to authenticated
with check (user_id = auth.uid());

create policy "Patients update own record"
on public.patients for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Patients read own appointments"
on public.appointments for select
to authenticated
using (
  patient_id in (
    select id
    from public.patients
    where user_id = auth.uid()
  )
);

create policy "Patients create own appointments"
on public.appointments for insert
to authenticated
with check (
  patient_id in (
    select id
    from public.patients
    where user_id = auth.uid()
  )
);

create policy "Patients update own appointments"
on public.appointments for update
to authenticated
using (
  patient_id in (
    select id
    from public.patients
    where user_id = auth.uid()
  )
)
with check (
  patient_id in (
    select id
    from public.patients
    where user_id = auth.uid()
  )
);

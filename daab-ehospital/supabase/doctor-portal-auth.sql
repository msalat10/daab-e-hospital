-- Doctor portal auth linkage.
-- Run after the base schema and patient-portal-auth.sql when auth is enabled.

alter table public.doctors
add column if not exists user_id uuid unique references auth.users(id) on delete set null;

create index if not exists doctors_user_id_idx
  on public.doctors(user_id);

drop policy if exists "Doctors create own record" on public.doctors;
create policy "Doctors create own record"
on public.doctors for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Doctors update own record" on public.doctors;
create policy "Doctors update own record"
on public.doctors for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Doctors read post appointments" on public.appointments;
create policy "Doctors read post appointments"
on public.appointments for select
to authenticated
using (
  exists (
    select 1
    from public.doctors
    where doctors.user_id = auth.uid()
      and (
        appointments.clinic_id = doctors.clinic_id
        or appointments.doctor_id = doctors.id
      )
  )
);

drop policy if exists "Doctors update post appointments" on public.appointments;
create policy "Doctors update post appointments"
on public.appointments for update
to authenticated
using (
  exists (
    select 1
    from public.doctors
    where doctors.user_id = auth.uid()
      and (
        appointments.clinic_id = doctors.clinic_id
        or appointments.doctor_id = doctors.id
      )
  )
)
with check (
  exists (
    select 1
    from public.doctors
    where doctors.user_id = auth.uid()
      and (
        appointments.clinic_id = doctors.clinic_id
        or appointments.doctor_id = doctors.id
      )
  )
);

drop policy if exists "Doctors read post patients" on public.patients;
create policy "Doctors read post patients"
on public.patients for select
to authenticated
using (
  exists (
    select 1
    from public.appointments
    join public.doctors on doctors.user_id = auth.uid()
    where appointments.patient_id = patients.id
      and (
        appointments.clinic_id = doctors.clinic_id
        or appointments.doctor_id = doctors.id
      )
  )
);

-- Target production shape:
--   doctors.user_id = auth.uid()
--   doctors review appointments for their assigned post.

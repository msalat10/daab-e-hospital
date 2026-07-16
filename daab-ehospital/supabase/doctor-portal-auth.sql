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

-- Target production shape:
--   doctors.user_id = auth.uid()
--   doctors review appointments assigned to them or pending in their clinic.
-- Keep the current MVP appointment policies until the admin role is implemented.

# Daryeel E-Hospital

Web-based hospital management system for appointment booking, doctor workflows, and admin reporting for Dadaab health posts.

## Tech Stack

- React + TypeScript + Vite
- Refine for routing, auth, data access, and resource management
- Supabase for auth, database, and row-level security
- Tailwind CSS + shadcn/ui
- TanStack Table

## Run Locally

```bash
npm install
```

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run start
```

## Database

The app uses Supabase directly through `@refinedev/supabase`.

Main tables:

- `profiles` - authenticated user profile and role
- `patients` - patient records
- `doctors` - doctor records
- `clinics` - facilities / health posts
- `services` - facility services
- `appointments` - appointment requests and visit status

SQL files are in `supabase/`:

- `schema.sql` - base tables, enums, seed data, and MVP RLS
- `patient-portal-auth.sql` - profiles table and patient auth links
- `patient-portal-rls.sql` - patient-only RLS policies
- `doctor-portal-auth.sql` - doctor auth links and policies

Run these SQL files in the Supabase SQL Editor when setting up a new project.

## App Routes

Public:

- `/` - landing page
- `/login` - sign in
- `/signup` - create account
- `/forgot-password` - request password reset
- `/update-password` - set new password

Patient:

- `/patient/dashboard`
- `/patient/book`
- `/patient/appointments`
- `/patient/care`
- `/patient/notifications`
- `/patient/profile`

Doctor:

- `/doctor/dashboard`
- `/doctor/appointments`
- `/doctor/profile`

Admin:

- `/admin/dashboard`
- `/admin/patients`
- `/admin/doctors`
- `/admin/facilities`

## API / Data Access

There is no separate Express API yet. Refine talks to Supabase using the Supabase data provider.

Resource names used by the frontend:

- `patients`
- `doctors`
- `clinics`
- `services`
- `appointments`
- `profiles`

Auth actions are handled by Supabase Auth:

- email/password login
- signup with role metadata
- logout
- forgot password
- update password

## Roles

- `patient` - books appointments and views own care records
- `doctor` - reviews appointment queue and consultation details
- `admin` - views overview, patients, doctors, and facilities


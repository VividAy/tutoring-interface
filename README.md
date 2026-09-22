# LVAEP Tutor Portal

A web replacement for LVAEP's paper "Student Monthly Attendance & Achievement
Form": tutors log sessions and check off student achievements per student,
and admins pull a per-tutor report from the same data.

- **Tutor view** (`/tutor`): pick your name, enter that tutor's password →
  click a student card → log a session (date, hours, or a TA/SA/H code) and
  check off achievements across the five categories from the paper form
  (Economic, Educational, Family, Societal/Community, Other).
- **Admin view** (`/admin`): enter the administrator password → pick a
  tutor → see that tutor's monthly totals across every student (the
  primary report, in an emphasized panel at the top) plus a per-student
  breakdown below, each exportable as a CSV or PDF for any individual
  month with session-level detail.

## Stack

Next.js (App Router, Server Actions) + Prisma + SQLite + Tailwind CSS + pdfkit.

## Access / passwords

Every tutor page and the admin area are gated by a password (a lightweight
cookie-based check, not a full account system — there's still no username
to enter, just click your name/Admin and type the password).

- Each tutor has their own `password` column on the `Tutor` model. It
  defaults to **their first name, lowercase, + "123"** — e.g. Maria Santos
  → `maria123`, James O'Connor → `james123` — set automatically whenever a
  tutor is created (see `defaultTutorPassword` in
  [`src/lib/password.ts`](src/lib/password.ts)). Change any tutor's
  password directly in `npx prisma studio` if you need something else.
- The admin password is one shared value, `ADMIN_PASSWORD` in `.env`
  (falls back to `admin123` if unset).

A "Log out" button in the header clears that person's/admin's session
cookie so the next person at the same computer has to re-enter a password.
Before real use, set distinct per-tutor passwords and a real `ADMIN_PASSWORD`
and `AUTH_SECRET` (used to sign the session cookies) in `.env`.

## Monthly reports (CSV / PDF)

On a tutor's report page (`/admin/tutors/[id]`) there are two kinds of
export, both as CSV or PDF, both scoped to one month at a time (not the
whole year):

- **Tutor Monthly Totals** (the darker, gold-bordered panel at the top —
  the primary report). Combines every student under that tutor: total
  hours, hours-by-student breakdown, every session across all students
  (date, student, hours or TA/SA/H code, note), and every achievement
  attained that month.
- **Per-student report** (below, one card per student, plain background).
  Same shape, scoped to a single student.

Both are formatted as a clean, formal document: an LVAEP letterhead,
a tutor/student/schedule header block, clearly labeled sections (Summary,
Session Detail, Achievements Attained), and consistent number/date
formatting — meant to be handed to someone outside the app, not just a
raw data dump. See [`src/lib/report.ts`](src/lib/report.ts) (CSV) and
[`src/lib/report-pdf.ts`](src/lib/report-pdf.ts) (PDF) for the format.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database
(`prisma/dev.db`) comes pre-seeded with 3 sample tutors and 6 students so
there's data to click around immediately.

### Useful commands

```bash
npx prisma studio      # browse/edit the database in a GUI
npx prisma db seed     # reset to the sample data (deletes existing rows!)
npx prisma migrate dev # apply a schema change you've made to prisma/schema.prisma
```

## Data model

See [`prisma/schema.prisma`](prisma/schema.prisma). The achievement catalog
(the fixed checklist items from the paper form) lives in
[`src/lib/achievements.ts`](src/lib/achievements.ts) — edit that file to
add/rename/remove achievement options; "Other" achievements are free text
entered per student.

## Deploying to Vercel

This currently runs on a local SQLite file, which won't work on Vercel's
serverless functions (no persistent writable disk). Before deploying:

1. Provision a hosted Postgres database (e.g. Vercel Postgres, Neon, or
   Supabase) and set `DATABASE_URL` to its connection string in your Vercel
   project's environment variables.
2. In `prisma/schema.prisma`, change the datasource provider from `sqlite`
   to `postgresql`.
3. Run `npx prisma migrate dev` once locally against the new database to
   create the schema (or `npx prisma migrate deploy` in your deploy step).
4. Push to a Git repo and import it in Vercel — no other code changes are
   needed.
5. Also set `ADMIN_PASSWORD` and `AUTH_SECRET` in Vercel's environment
   variables (see **Access / passwords** above) — without them the app
   falls back to the dev defaults, which is fine for testing but not for
   a real deployment.

# Maria's Mission Control

Study schedule dashboard for the **Guardia Civil Escala de Cabos y Guardias** civil service exam.

Dark dashboard with a 4-week schedule, per-tema progress tracking, and a streak counter. Built with Next.js 14, Tailwind, and Supabase.

---

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the entire contents of `supabase-schema.sql`
3. Hit **Run** - this creates all tables, seeds the 23 temas, and generates the 28-day schedule

> To change the start date, edit the line `start_date date := '2026-06-09';` in the SQL file before running.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values from the Supabase project dashboard (Settings > API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Netlify

1. Push this repo to GitHub
2. Connect the repo in Netlify
3. Add the two environment variables in Site settings > Environment variables
4. Deploy - `netlify.toml` handles the Next.js build config automatically

---

## Pages

| Route | Description |
|---|---|
| `/` | Today's schedule with checkboxes to mark blocks done |
| `/week` | Weekly calendar view with day-type badges and progress bars |
| `/progress` | Per-tema progress bars grouped by difficulty |

---

## Schedule logic

- 28 days, 2 blocks per day: Manana (10:30-14:30, 240 min) and Tarde (16:30-20:00, 210 min)
- Day types: `review` (repaso + test), `test` (test_tema + test_mixto), `simulacro` (2x full simulacro), `mixed`
- Hard temas (T1, T2, T9, T14, T15, T16) appear 3x more frequently than easy temas
- T6 (Fuerzas Armadas) is always skipped - image-based topic
- Week 4 shifts to 70% test/simulacro days

---

## Stack

- Next.js 14 with App Router + Turbopack
- Tailwind CSS with Space Grotesk font
- Supabase (PostgreSQL) for DB
- Netlify for deployment via @netlify/plugin-nextjs

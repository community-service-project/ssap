-- ============================================================================
-- SSAP — Student Productivity & Life Management PWA
-- Supabase (PostgreSQL) schema
--
-- NOTE: Supabase's built-in database engine is PostgreSQL, not MySQL.
-- Supabase does not offer MySQL hosting, so this schema targets Postgres.
-- Everything else about the stack (Supabase Auth + Supabase JS client) works
-- exactly as you'd expect from "Supabase as the backend".
--
-- HOW TO USE:
-- 1. Create a project at https://supabase.com
-- 2. Open SQL Editor -> New Query -> paste this whole file -> Run
-- 3. Project Settings -> API -> copy the "Project URL" and "anon public" key
--    into js/config.js
-- 4. Authentication -> Providers -> make sure "Email" is enabled
-- ============================================================================

-- Extension for gen_random_uuid() (usually already enabled on Supabase)
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- PROFILES (1 row per authenticated user — extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),

  -- flattened UserPreferences
  time_format text not null default '12h',
  timezone text not null default 'UTC',
  week_start text not null default 'monday',
  week_start_day smallint,
  priority_academic int not null default 60,
  priority_personal int not null default 25,
  priority_goals int not null default 15,
  default_priority text not null default 'Medium',
  notifications_enabled boolean not null default true,
  notify_5min boolean not null default true,
  notify_1min boolean not null default true,
  notify_at_start boolean not null default true,
  notify_overdue boolean not null default true,
  notify_sleep_winddown boolean not null default true,
  sound_enabled boolean not null default true,
  theme text not null default 'light',
  theme_mode text
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- ACADEMIC SUBJECTS
-- ---------------------------------------------------------------------------
create table if not exists public.academic_subjects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  name text not null,
  color text not null default '#3b82f6',
  instructor text,
  room text
);
alter table public.academic_subjects enable row level security;
create policy "subjects_all_own" on public.academic_subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- TIMETABLE ENTRIES
-- ---------------------------------------------------------------------------
create table if not exists public.timetable_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text references public.academic_subjects(id) on delete cascade,
  day_of_week int not null,
  start_time text not null,
  end_time text not null,
  room text,
  type text
);
alter table public.timetable_entries enable row level security;
create policy "timetable_all_own" on public.timetable_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ACADEMIC WORKS (assignments, exams, projects...)
-- ---------------------------------------------------------------------------
create table if not exists public.academic_works (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text references public.academic_subjects(id) on delete cascade,
  title text not null,
  type text not null,
  priority text not null default 'Medium',
  estimated_minutes int not null default 30,
  due_date text not null,
  due_time text,
  status text not null default 'Pending',
  linked_goal_id text,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.academic_works enable row level security;
create policy "academic_works_all_own" on public.academic_works for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- PERSONAL WORKS (sleep, exercise, meals, chores...)
-- ---------------------------------------------------------------------------
create table if not exists public.personal_works (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  priority text not null default 'Medium',
  estimated_minutes int not null default 30,
  scheduled_date text,
  start_time text,
  end_time text,
  is_recurring boolean not null default false,
  recurring_days int[] default '{}',
  notes text,
  wind_down_minutes int,
  status text not null default 'Scheduled',
  created_at timestamptz not null default now()
);
alter table public.personal_works enable row level security;
create policy "personal_works_all_own" on public.personal_works for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- GOALS + MILESTONES
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null,
  priority text not null default 'Medium',
  target_date text not null,
  status text not null default 'Active',
  progress_percent int not null default 0,
  at_risk boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "goals_all_own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.goal_milestones (
  id text primary key,
  goal_id text not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_date text,
  completed boolean not null default false,
  completed_at text
);
alter table public.goal_milestones enable row level security;
create policy "milestones_all_own" on public.goal_milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- TASKS
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  classification text not null default 'Academic',
  priority text not null default 'Medium',
  estimated_minutes int not null default 30,
  status text not null default 'Pending',
  scheduled_date text,
  scheduled_time text,
  due_date text,
  due_time text,
  linked_goal_id text,
  linked_subject_id text,
  reminders_enabled boolean not null default true,
  custom_reminder_minutes int,
  recurring text default 'none',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.tasks enable row level security;
create policy "tasks_all_own" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- FREE TIME SLOTS
-- ---------------------------------------------------------------------------
create table if not exists public.free_time_slots (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  date text not null,
  start_time text not null,
  end_time text not null,
  notes text,
  is_recurring boolean not null default false,
  recurring_days int[] default '{}',
  color text
);
alter table public.free_time_slots enable row level security;
create policy "free_slots_all_own" on public.free_time_slots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system',
  timestamp timestamptz not null default now(),
  read boolean not null default false,
  related_item_id text,
  related_item_type text
);
alter table public.notifications enable row level security;
create policy "notifications_all_own" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- PUSH SUBSCRIPTIONS (one row per browser/device, powers background Web Push)
--
-- The client (js/push.js) writes here after the user grants Notification
-- permission. The "send-reminders" Edge Function (run on a schedule) reads
-- from here with the service role key to deliver push notifications even
-- when the app is closed — see supabase/functions/send-reminders/README.md.
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "push_subs_all_own" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- OPTIONAL: schedule the send-reminders Edge Function to run every minute.
--
-- This requires the "pg_cron" and "pg_net" extensions (Database -> Extensions
-- in the Supabase dashboard -> enable both). Then run the block below, with
-- the two <PLACEHOLDER> values filled in:
--   - <YOUR-PROJECT-REF>   e.g. rumjmzlovtdypfjyfvgk
--   - <YOUR-CRON-SECRET>   any random string you also set as the
--                          CRON_SECRET secret on the Edge Function (see its
--                          README) — stops randoms from spamming the endpoint
-- ---------------------------------------------------------------------------
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
--
-- select cron.schedule(
--   'ssap-send-reminders-every-minute',
--   '* * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/send-reminders',
--     headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', '<YOUR-CRON-SECRET>'),
--     body := '{}'::jsonb
--   );
--   $$
-- );

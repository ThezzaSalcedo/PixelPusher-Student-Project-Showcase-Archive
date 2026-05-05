-- Extend `projects` for Sprint 3–4 archive features (run in Supabase SQL editor or CLI).
-- Adjust table/column names if your schema differs.

alter table if exists public.projects
  add column if not exists submission_type text default 'project',
  add column if not exists attachments jsonb default '[]'::jsonb,
  add column if not exists contributors jsonb default '[]'::jsonb,
  add column if not exists version_group_id text,
  add column if not exists version_number integer default 1,
  add column if not exists is_latest_version boolean default true;

create index if not exists projects_version_group_idx on public.projects (version_group_id);

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id bigint not null references public.projects (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, project_id)
);

alter table public.bookmarks enable row level security;

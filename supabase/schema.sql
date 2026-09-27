-- Problem Intelligence MVP schema
create extension if not exists pgcrypto;

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  audience text,
  source text,
  category text,
  frequency text,
  money_cost text,
  time_cost text,
  current_solution text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.problems enable row level security;

-- Public MVP browsing and submission. Tighten these policies when authentication is added.
drop policy if exists "public can read problems" on public.problems;
create policy "public can read problems"
  on public.problems for select
  using (true);

drop policy if exists "public can insert problems" on public.problems;
create policy "public can insert problems"
  on public.problems for insert
  with check (true);

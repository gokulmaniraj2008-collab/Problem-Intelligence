-- Problem Intelligence production MVP schema
create extension if not exists pgcrypto;

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null,
  audience text, industry text, source text, category text, frequency text, money_cost text, time_cost text,
  current_solution text, status text not null default 'new', created_by uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.problems add column if not exists industry text;
alter table public.problems add column if not exists created_by uuid;

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(), problem_id uuid not null references public.problems(id) on delete cascade,
  source text, date date not null default current_date, persona text not null, confirmed boolean not null default false,
  pain_score numeric, current_solution text, willingness_to_pay numeric, notes text not null, created_by uuid, created_at timestamptz not null default now()
);
alter table public.evidence add column if not exists date date default current_date;

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(), problem_id uuid not null references public.problems(id) on delete cascade,
  people_score numeric not null default 5, pain_score numeric not null default 5, wtp_score numeric not null default 5,
  market_score numeric not null default 5, gap_score numeric not null default 5, feasibility_score numeric not null default 5,
  ai_score numeric, human_score numeric, final_score numeric, updated_by uuid, updated_at timestamptz not null default now(),
  unique(problem_id)
);

create table if not exists public.solutions (
  id uuid primary key default gen_random_uuid(), problem_id uuid not null references public.problems(id) on delete cascade,
  name text not null, description text default '', solution_type text not null default 'Software', customer text default '',
  pricing text default '', competition text default '', feasibility numeric default 5, status text default 'idea', created_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(), problem_id uuid not null references public.problems(id) on delete cascade,
  decision text not null check (decision in ('BUILD','VALIDATE MORE','WATCH','STOP')), notes text default '', created_by uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(problem_id)
);

alter table public.problems enable row level security;
alter table public.evidence enable row level security;
alter table public.scores enable row level security;
alter table public.solutions enable row level security;
alter table public.decisions enable row level security;

-- The current Vercel API uses the Supabase service-role key server-side, so these policies protect direct client access.
-- Tighten to auth.uid() ownership when authentication/private workspaces are enabled.
drop policy if exists "public can read problems" on public.problems;
create policy "public can read problems" on public.problems for select using (true);
drop policy if exists "public can insert problems" on public.problems;
create policy "public can insert problems" on public.problems for insert with check (true);
drop policy if exists "public can read evidence" on public.evidence;
create policy "public can read evidence" on public.evidence for select using (true);
drop policy if exists "public can insert evidence" on public.evidence;
create policy "public can insert evidence" on public.evidence for insert with check (true);
drop policy if exists "public can read scores" on public.scores;
create policy "public can read scores" on public.scores for select using (true);
drop policy if exists "public can insert scores" on public.scores;
create policy "public can insert scores" on public.scores for insert with check (true);
drop policy if exists "public can update scores" on public.scores;
create policy "public can update scores" on public.scores for update using (true) with check (true);
drop policy if exists "public can read solutions" on public.solutions;
create policy "public can read solutions" on public.solutions for select using (true);
drop policy if exists "public can insert solutions" on public.solutions;
create policy "public can insert solutions" on public.solutions for insert with check (true);
drop policy if exists "public can read decisions" on public.decisions;
create policy "public can read decisions" on public.decisions for select using (true);
drop policy if exists "public can insert decisions" on public.decisions;
create policy "public can insert decisions" on public.decisions for insert with check (true);
drop policy if exists "public can update decisions" on public.decisions;
create policy "public can update decisions" on public.decisions for update using (true) with check (true);

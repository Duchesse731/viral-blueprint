-- Viral Blueprint launch package: persistent workspace, fixed seven-day retention,
-- and a scheduled purge so expiry is enforced even when a user never returns.

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create table if not exists public.viral_blueprint_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  content text not null default '',
  content_type text not null default 'post',
  target_platform text not null default 'instagram',
  goal text not null default 'engagement',
  tone text not null default 'authentic',
  target_audience text not null default '',
  analysis_result jsonb,
  is_analyzed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists viral_blueprint_projects_user_updated_idx
  on public.viral_blueprint_projects (user_id, updated_at desc);
create index if not exists viral_blueprint_projects_expiry_idx
  on public.viral_blueprint_projects (expires_at);

create or replace function public.viral_blueprint_projects_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.user_id := (select auth.uid());
    new.created_at := now();
    new.updated_at := now();
    new.expires_at := now() + interval '7 days';
  else
    new.user_id := old.user_id;
    new.created_at := old.created_at;
    new.expires_at := old.expires_at;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists viral_blueprint_projects_before_write on public.viral_blueprint_projects;
create trigger viral_blueprint_projects_before_write
before insert or update on public.viral_blueprint_projects
for each row execute function public.viral_blueprint_projects_before_write();

alter table public.viral_blueprint_projects enable row level security;
revoke all on table public.viral_blueprint_projects from public, anon;
grant select, insert, update, delete on table public.viral_blueprint_projects to authenticated;

drop policy if exists "viral blueprint owners read active projects" on public.viral_blueprint_projects;
create policy "viral blueprint owners read active projects"
on public.viral_blueprint_projects
for select to authenticated
using ((select auth.uid()) = user_id and expires_at > now());

drop policy if exists "viral blueprint owners create projects" on public.viral_blueprint_projects;
create policy "viral blueprint owners create projects"
on public.viral_blueprint_projects
for insert to authenticated
with check ((select auth.uid()) = user_id and expires_at > now());

drop policy if exists "viral blueprint owners update active projects" on public.viral_blueprint_projects;
create policy "viral blueprint owners update active projects"
on public.viral_blueprint_projects
for update to authenticated
using ((select auth.uid()) = user_id and expires_at > now())
with check ((select auth.uid()) = user_id and expires_at > now());

drop policy if exists "viral blueprint owners delete projects" on public.viral_blueprint_projects;
create policy "viral blueprint owners delete projects"
on public.viral_blueprint_projects
for delete to authenticated
using ((select auth.uid()) = user_id);

create or replace function private.purge_expired_viral_blueprint_projects()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.viral_blueprint_projects
  where expires_at <= now();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;
revoke all on function private.purge_expired_viral_blueprint_projects() from public, anon, authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid into existing_job_id
  from cron.job
  where jobname = 'viral-blueprint-purge-expired-projects'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'viral-blueprint-purge-expired-projects',
    '17 * * * *',
    'select private.purge_expired_viral_blueprint_projects();'
  );
end;
$$;

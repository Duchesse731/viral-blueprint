create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

drop trigger if exists create_viral_blueprint_account_after_signup on auth.users;
drop function if exists private.create_viral_blueprint_account();
drop function if exists public.get_viral_blueprint_remaining_credits();
drop function if exists public.consume_viral_blueprint_credit();
drop table if exists public.viral_blueprint_accounts cascade;

create table private.viral_blueprint_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  free_credits_total smallint not null default 1 check (free_credits_total = 1),
  free_credits_used smallint not null default 0 check (free_credits_used between 0 and free_credits_total),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

revoke all on table private.viral_blueprint_accounts from public, anon;
grant select on table private.viral_blueprint_accounts to authenticated;
grant update (free_credits_used, updated_at) on table private.viral_blueprint_accounts to authenticated;

create function private.create_viral_blueprint_account()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ->> 'app_id' = 'viral-blueprint' then
    insert into private.viral_blueprint_accounts (user_id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.create_viral_blueprint_account() from public, anon, authenticated;

create trigger create_viral_blueprint_account_after_signup
after insert on auth.users for each row execute function private.create_viral_blueprint_account();

create function public.get_viral_blueprint_remaining_credits()
returns smallint language sql stable security invoker set search_path = '' as $$
  select greatest(0, free_credits_total - free_credits_used)::smallint
  from private.viral_blueprint_accounts
  where user_id = (select auth.uid());
$$;

create function public.consume_viral_blueprint_credit()
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed_count integer;
begin
  if (select auth.uid()) is null then return false; end if;
  update private.viral_blueprint_accounts
  set free_credits_used = free_credits_used + 1, updated_at = now()
  where user_id = (select auth.uid()) and free_credits_used < free_credits_total;
  get diagnostics changed_count = row_count;
  return changed_count = 1;
end;
$$;

revoke all on function public.get_viral_blueprint_remaining_credits() from public, anon;
revoke all on function public.consume_viral_blueprint_credit() from public, anon;
grant execute on function public.get_viral_blueprint_remaining_credits() to authenticated;
grant execute on function public.consume_viral_blueprint_credit() to authenticated;

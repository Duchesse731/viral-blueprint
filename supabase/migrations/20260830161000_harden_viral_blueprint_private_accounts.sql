alter table private.viral_blueprint_accounts enable row level security;

create policy "viral blueprint users read own private account"
on private.viral_blueprint_accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "viral blueprint users consume own private credit"
on private.viral_blueprint_accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

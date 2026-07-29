-- Comparisons-Made counter for Giants of the World.
--
-- A plain vanity stat, not billing-sensitive, but writes still go through
-- the service-role client rather than a user-editable RLS policy -- the
-- same reasoning schema.sql gives for plan: a client-writable counter is a
-- client-writable counter, free to inflate from devtools.

alter table public.profiles
  add column if not exists comparisons_made integer not null default 0;

create or replace function public.increment_comparisons_made(uid uuid)
returns void
language sql
as $$
  update public.profiles set comparisons_made = comparisons_made + 1 where id = uid;
$$;

-- Supabase grants EXECUTE on new functions to anon/authenticated by default.
-- This one is only ever called from the server with the service-role key,
-- so revoke public execute and grant it back to service_role alone.
revoke execute on function public.increment_comparisons_made(uuid) from public;
revoke execute on function public.increment_comparisons_made(uuid) from anon, authenticated;
grant execute on function public.increment_comparisons_made(uuid) to service_role;

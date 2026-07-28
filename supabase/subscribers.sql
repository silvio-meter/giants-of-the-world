-- Newsletter subscribers for Giants of the World.
--
-- No RLS policies are defined on purpose: the table has zero anon access in
-- either direction. Every read and write goes through /api/subscribe using
-- the service-role client, the same pattern profiles.plan uses for
-- billing-sensitive fields.

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source_page text,
  subscribed_at timestamptz not null default now()
);

create index if not exists subscribers_email_idx
  on public.subscribers (email);

alter table public.subscribers enable row level security;

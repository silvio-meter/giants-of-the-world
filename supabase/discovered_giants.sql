-- Codex completion tracking for Giants of the World.
--
-- Records that a signed-in user has opened a giant's detail page. Free
-- feature (overall %), so this is written for every signed-in user
-- regardless of plan -- RLS per user, same shape as favourites.sql.

create table if not exists public.discovered_giants (
  user_id uuid not null references auth.users (id) on delete cascade,
  giant_slug text not null,
  discovered_at timestamptz not null default now(),
  primary key (user_id, giant_slug)
);

create index if not exists discovered_giants_user_id_idx
  on public.discovered_giants (user_id);

alter table public.discovered_giants enable row level security;

drop policy if exists "Users read own discoveries" on public.discovered_giants;
create policy "Users read own discoveries"
  on public.discovered_giants for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own discoveries" on public.discovered_giants;
create policy "Users insert own discoveries"
  on public.discovered_giants for insert
  with check (auth.uid() = user_id);

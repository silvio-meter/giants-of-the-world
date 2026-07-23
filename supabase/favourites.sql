-- Favourites for Giants of the World (paid feature, RLS per user)

create table if not exists public.favourites (
  user_id uuid not null references auth.users (id) on delete cascade,
  giant_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, giant_slug)
);

create index if not exists favourites_user_id_idx
  on public.favourites (user_id);

create index if not exists favourites_giant_slug_idx
  on public.favourites (giant_slug);

alter table public.favourites enable row level security;

drop policy if exists "Users read own favourites" on public.favourites;
create policy "Users read own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own favourites" on public.favourites;
create policy "Users insert own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own favourites" on public.favourites;
create policy "Users delete own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);

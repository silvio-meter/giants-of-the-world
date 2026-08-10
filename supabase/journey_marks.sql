-- My Journey marks (paid sync). Free readers keep marks in the browser session only.

create table if not exists public.journey_marks (
  user_id uuid not null references auth.users (id) on delete cascade,
  giant_slug text not null,
  marks text[] not null default '{}',
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, giant_slug),
  constraint journey_marks_note_len check (char_length(note) <= 280)
);

create index if not exists journey_marks_user_id_idx
  on public.journey_marks (user_id);

alter table public.journey_marks enable row level security;

drop policy if exists "Users read own journey marks" on public.journey_marks;
create policy "Users read own journey marks"
  on public.journey_marks for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own journey marks" on public.journey_marks;
create policy "Users insert own journey marks"
  on public.journey_marks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own journey marks" on public.journey_marks;
create policy "Users update own journey marks"
  on public.journey_marks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own journey marks" on public.journey_marks;
create policy "Users delete own journey marks"
  on public.journey_marks for delete
  using (auth.uid() = user_id);

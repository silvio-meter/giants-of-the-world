-- One Seam: unsubscribe token + timestamp for list hygiene.
-- Safe to re-run.

alter table public.subscribers
  add column if not exists unsubscribe_token uuid,
  add column if not exists unsubscribed_at timestamptz;

create index if not exists subscribers_unsubscribe_token_idx
  on public.subscribers (unsubscribe_token)
  where unsubscribe_token is not null;

-- Confirmed active list (for export / count).
create index if not exists subscribers_active_confirmed_idx
  on public.subscribers (confirmed_at)
  where confirmed_at is not null and unsubscribed_at is null;

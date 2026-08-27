-- One Seam confirm drip (emails 1-4).
-- Safe to re-run.
--
-- drip_step: 0 = not in drip; 1-3 = last mail sent (E1/E2/E3); 4 = finished.
-- drip_opt_in_at: set ONLY when a person confirms after this ships.
-- Do not backfill. Existing confirmed rows must not enter the sequence.

alter table public.subscribers
  add column if not exists drip_step integer not null default 0,
  add column if not exists drip_opt_in_at timestamptz;

create index if not exists subscribers_drip_due_idx
  on public.subscribers (drip_step, drip_opt_in_at)
  where drip_opt_in_at is not null
    and unsubscribed_at is null
    and drip_step between 1 and 3;

-- Double opt-in for the newsletter.
--
-- Run once in the Supabase SQL editor. Safe to re-run: every statement is
-- guarded, and the legacy backfill at the bottom only ever touches rows that
-- predate this migration.
--
-- Consent is recorded in three parts, none of them redundant:
--   subscribed_at  when the person submitted the form, so when consent was given
--   consent_text   the exact wording they agreed to at that moment
--   confirmed_at   when they clicked the link in the confirmation email
--
-- A row without confirmed_at is not a subscriber. It is a pending request.

alter table public.subscribers
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirm_token uuid,
  add column if not exists consent_text text,
  add column if not exists legacy_single_optin boolean not null default false;

-- Token lookup happens on every confirmation click.
create index if not exists subscribers_confirm_token_idx
  on public.subscribers (confirm_token)
  where confirm_token is not null;

-- Counting confirmed subscribers is the common read.
create index if not exists subscribers_confirmed_at_idx
  on public.subscribers (confirmed_at)
  where confirmed_at is not null;

-- Everyone who subscribed before double opt-in existed stays subscribed. They
-- consented under the single opt-in flow that was live at the time, so
-- invalidating them would be wrong. They are marked instead, so the two groups
-- can always be told apart, and their consent timestamp is the one moment we
-- actually have on record: when they submitted.
update public.subscribers
set legacy_single_optin = true,
    confirmed_at = subscribed_at
where confirmed_at is null
  and legacy_single_optin = false;

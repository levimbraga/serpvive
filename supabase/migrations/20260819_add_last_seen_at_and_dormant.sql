-- Inactivity pause.
--
-- With the 90-day free freeze disabled, an abandoned account keeps syncing
-- Google Search Console forever. That costs no money (the GSC API is free) but
-- it grows Postgres without bound — a single site already holds ~22k rows in
-- page_queries — until the Supabase storage limit becomes the failure.
--
-- So: track when a user was last seen, stop ingesting for accounts nobody has
-- opened in 60 days, and resume automatically on their next login. This is
-- storage hygiene, not a paywall: no data is deleted and nothing must be
-- purchased to come back.
--
-- 'dormant' is a distinct status from 'paused' on purpose. 'paused' carries the
-- semantics of the free-plan freeze (now disabled); keeping them separate means
-- neither story has to be reconstructed from context later.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON COLUMN public.profiles.last_seen_at IS
  'Last dashboard visit, written at most once per day. Drives the 60-day inactivity pause.';

-- Allow the new status value alongside the existing ones.
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_status_check;
ALTER TABLE public.sites
  ADD CONSTRAINT sites_status_check
  CHECK (status IN ('active', 'paused', 'dormant', 'error', 'importing'));

-- Ingestion skips dormant sites; this index keeps the daily cron's scan cheap.
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles (last_seen_at);

-- Set free_since default so new free-plan users get it automatically.
-- Previously, only users who downgraded from paid had free_since set.
-- This ensures the 90-day inactivity freeze works for all free users.
ALTER TABLE public.profiles ALTER COLUMN free_since SET DEFAULT NOW();

-- Backfill any free users created after the original migration that still have NULL free_since
UPDATE public.profiles SET free_since = created_at WHERE plan = 'free' AND free_since IS NULL;

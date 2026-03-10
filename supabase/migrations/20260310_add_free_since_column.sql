-- Add free_since column to track when user entered free plan
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_since TIMESTAMPTZ;

-- Backfill: existing free users get their created_at as free_since
UPDATE public.profiles SET free_since = created_at WHERE plan = 'free' AND free_since IS NULL;

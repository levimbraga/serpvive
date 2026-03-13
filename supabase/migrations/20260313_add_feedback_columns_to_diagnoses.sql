ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS feedback_text TEXT;
ALTER TABLE public.diagnoses ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ;

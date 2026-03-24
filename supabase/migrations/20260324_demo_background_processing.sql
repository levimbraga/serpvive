-- Add status tracking for background demo processing
ALTER TABLE public.demo_analyses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed'
  CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE public.demo_analyses ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Allow diagnosis to be NULL while processing
ALTER TABLE public.demo_analyses ALTER COLUMN diagnosis DROP NOT NULL;

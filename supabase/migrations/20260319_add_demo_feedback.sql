CREATE TABLE IF NOT EXISTS public.demo_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_analysis_id TEXT NOT NULL REFERENCES public.demo_analyses(id) ON DELETE CASCADE,
  helpful BOOLEAN NOT NULL,
  comment TEXT,
  page_url TEXT,
  keyword TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS needed — public demo, no user context
-- Unique constraint prevents double-voting per analysis
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_feedback_analysis ON demo_feedback(demo_analysis_id);

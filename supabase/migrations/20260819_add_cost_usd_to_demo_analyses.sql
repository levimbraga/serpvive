-- Demo analyses run the same paid pipeline as a user diagnosis but never
-- recorded what they cost, so any spend accounting that summed diagnoses +
-- external_analyses was silently blind to them. The global spend cap must see
-- every dollar the app spends, otherwise it is a cap you trust and shouldn't.
ALTER TABLE public.demo_analyses
  ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.demo_analyses.cost_usd IS
  'AI cost of the pipeline run that produced this demo. Counted by the global spend cap.';

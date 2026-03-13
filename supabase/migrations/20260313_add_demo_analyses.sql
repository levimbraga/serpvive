CREATE TABLE public.demo_analyses (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  diagnosis JSONB NOT NULL,
  refresh_brief JSONB,
  serp_snapshot JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '21 days'),
  views INT NOT NULL DEFAULT 0
);

ALTER TABLE public.demo_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demo analyses"
  ON public.demo_analyses FOR SELECT
  USING (true);

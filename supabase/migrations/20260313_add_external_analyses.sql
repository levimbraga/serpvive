CREATE TABLE public.external_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  keyword TEXT NOT NULL,
  diagnosis JSONB NOT NULL,
  refresh_brief JSONB,
  serp_snapshot JSONB,
  model_used TEXT DEFAULT 'claude-opus-4-6',
  tokens_input INT,
  tokens_output INT,
  cost_usd DECIMAL(6,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.external_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own external analyses"
  ON public.external_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own external analyses"
  ON public.external_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own external analyses"
  ON public.external_analyses FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_external_analyses_user_id ON public.external_analyses(user_id);

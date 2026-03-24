-- ============================================================
-- Fix remaining RLS gaps
-- Most tables already had RLS + policies via Dashboard.
-- This migration fixes the 2 tables that were missing.
-- Service role (crons, webhooks) bypasses RLS automatically.
-- ============================================================

-- 1. cancel_feedback: RLS enabled but had no policies
CREATE POLICY "Users can insert own cancel feedback"
  ON public.cancel_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admin can read cancel feedback"
  ON public.cancel_feedback FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- 2. demo_feedback: RLS not enabled, no policies
ALTER TABLE public.demo_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert demo feedback"
  ON public.demo_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admin can read demo feedback"
  ON public.demo_feedback FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- 3. Functions: fix missing search_path
ALTER FUNCTION public.set_trial_ends_at() SET search_path = public;

DO $$ BEGIN
  ALTER FUNCTION public.handle_new_user() SET search_path = public;
EXCEPTION WHEN undefined_function THEN
  NULL;
END $$;

-- NOTE: Leaked password protection must be enabled
-- manually in Supabase Dashboard:
-- Authentication > Settings > Password Protection
-- > Enable "Leaked Password Protection"

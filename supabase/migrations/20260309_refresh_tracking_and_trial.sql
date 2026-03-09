-- Set trial_ends_at for existing trial users who don't have it set
UPDATE profiles
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE plan = 'trial' AND trial_ends_at IS NULL;

-- Create function to set trial_ends_at on new profile creation
CREATE OR REPLACE FUNCTION set_trial_ends_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan = 'trial' AND NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at := NOW() + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_trial_ends_at
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_trial_ends_at();

-- Indices for refresh tracking queries
CREATE INDEX IF NOT EXISTS idx_refreshes_page_status ON refreshes (page_id, result_status);
CREATE INDEX IF NOT EXISTS idx_refreshes_user_result ON refreshes (user_id, result_status, result_calculated_at DESC);

-- RLS for refreshes table
ALTER TABLE refreshes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own refreshes"
ON refreshes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own refreshes"
ON refreshes FOR INSERT
WITH CHECK (user_id = auth.uid());

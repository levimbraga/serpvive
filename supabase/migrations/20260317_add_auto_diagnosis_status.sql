-- Add persistent state machine for auto-diagnosis flow
ALTER TABLE sites
ADD COLUMN IF NOT EXISTS auto_diagnosis_status TEXT DEFAULT 'pending'
CHECK (auto_diagnosis_status IN ('pending', 'engine_running', 'diagnosing', 'completed', 'failed'));

-- Backfill existing sites
UPDATE sites SET auto_diagnosis_status = 'completed' WHERE has_free_diagnosis = true;
UPDATE sites SET auto_diagnosis_status = 'failed'
WHERE has_free_diagnosis = false AND last_engine_run_at IS NOT NULL AND status = 'active';

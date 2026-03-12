-- Add feedback column to diagnoses for tracking diagnosis quality
ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS feedback TEXT
  CHECK (feedback IN ('helpful', 'not_helpful'));

-- Add token_error to sites for tracking GSC connection issues
ALTER TABLE sites ADD COLUMN IF NOT EXISTS token_error BOOLEAN DEFAULT FALSE;

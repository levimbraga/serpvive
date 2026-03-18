ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'monthly'
CHECK (billing_interval IN ('monthly', 'annual'));

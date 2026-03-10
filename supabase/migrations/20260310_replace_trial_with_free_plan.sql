-- Drop both CHECK constraints first
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_plan_status_check;

-- Update data
UPDATE profiles SET plan = 'free' WHERE plan = 'trial';
UPDATE profiles SET plan_status = 'active' WHERE plan_status = 'trialing';

-- Re-add constraints with new values
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'agency'));
ALTER TABLE profiles ADD CONSTRAINT profiles_plan_status_check CHECK (plan_status IN ('active', 'canceled', 'past_due'));

-- Change defaults
ALTER TABLE profiles ALTER COLUMN plan SET DEFAULT 'free';
ALTER TABLE profiles ALTER COLUMN plan_status SET DEFAULT 'active';

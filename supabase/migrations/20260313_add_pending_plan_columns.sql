-- Add pending_plan and plan_changes_at columns for deferred downgrades/cancellations.
-- When a user downgrades or cancels, the new plan is stored in pending_plan
-- and only applied when plan_changes_at <= now().

ALTER TABLE profiles ADD COLUMN pending_plan TEXT;
ALTER TABLE profiles ADD COLUMN plan_changes_at TIMESTAMPTZ;

-- Move welcome/free-diagnosis banner dismissal from localStorage to DB.
-- This ensures the banner state persists across logins and devices.

ALTER TABLE sites ADD COLUMN welcome_dismissed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE sites ADD COLUMN free_diag_dismissed BOOLEAN NOT NULL DEFAULT FALSE;

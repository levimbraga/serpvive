-- Add merge/redirect columns to pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS redirect_to UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS redirect_url TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS merged_from UUID REFERENCES pages(id) ON DELETE SET NULL;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS merged_at TIMESTAMPTZ;

-- Update status CHECK constraint to include 'redirected'
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_status_check;
ALTER TABLE pages ADD CONSTRAINT pages_status_check
  CHECK (status IN ('healthy','warning','critical','dead','new','unknown','redirected'));

-- Index for FK lookups
CREATE INDEX IF NOT EXISTS idx_pages_redirect_to ON pages(redirect_to) WHERE redirect_to IS NOT NULL;

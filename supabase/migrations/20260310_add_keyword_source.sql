-- Add keyword_source column to track where primary_keyword came from
ALTER TABLE pages ADD COLUMN IF NOT EXISTS keyword_source TEXT DEFAULT NULL;

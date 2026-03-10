-- Track total discovered content pages (before plan-limit pruning)
ALTER TABLE sites ADD COLUMN IF NOT EXISTS total_content_pages integer DEFAULT 0;

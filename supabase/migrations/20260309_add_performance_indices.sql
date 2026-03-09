-- Performance indices for dashboard and engine queries
CREATE INDEX IF NOT EXISTS idx_pages_site_status ON pages (site_id, status);
CREATE INDEX IF NOT EXISTS idx_pages_site_decay ON pages (site_id, decay_score DESC);
CREATE INDEX IF NOT EXISTS idx_pages_site_url ON pages (site_id, url);
CREATE INDEX IF NOT EXISTS idx_metrics_page_date ON page_metrics_daily (page_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_queries_page_clicks ON page_queries (page_id, clicks DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_page_created ON diagnoses (page_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sites_user_status ON sites (user_id, status);

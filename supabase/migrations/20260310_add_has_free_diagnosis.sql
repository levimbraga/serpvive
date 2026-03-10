ALTER TABLE sites ADD COLUMN IF NOT EXISTS has_free_diagnosis boolean DEFAULT false;

-- Mark existing sites that already have diagnoses
UPDATE sites SET has_free_diagnosis = true
WHERE id IN (SELECT DISTINCT s.id FROM sites s INNER JOIN pages p ON p.site_id = s.id INNER JOIN diagnoses d ON d.page_id = p.id);

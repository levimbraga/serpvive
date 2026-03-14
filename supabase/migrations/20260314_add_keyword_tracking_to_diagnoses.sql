-- Track which keyword was used for each diagnosis and its source
ALTER TABLE diagnoses ADD COLUMN keyword_used TEXT;
ALTER TABLE diagnoses ADD COLUMN keyword_source TEXT
  CHECK (keyword_source IN ('gsc', 'override', 'estimated', 'manual'));

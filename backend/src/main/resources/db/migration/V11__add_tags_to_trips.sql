-- Stores tags as a comma-separated string (e.g. "beach,solo,backpacking")
-- Empty string or NULL both mean no tags.
ALTER TABLE trips ADD COLUMN IF NOT EXISTS tags TEXT;

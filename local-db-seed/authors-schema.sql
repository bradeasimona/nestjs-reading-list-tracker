CREATE TABLE IF NOT EXISTS reading_list_tracker.authors (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  email TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS authors_email_idx
ON reading_list_tracker.authors (email);
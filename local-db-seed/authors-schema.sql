CREATE TABLE IF NOT EXISTS reading_list_tracker.authors (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id)
);

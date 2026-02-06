CREATE TABLE IF NOT EXISTS reading_list_tracker.books (
  id UUID,
  title TEXT,
  author TEXT,
  total_pages INT,
  current_page INT,
  progress INT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id)
);

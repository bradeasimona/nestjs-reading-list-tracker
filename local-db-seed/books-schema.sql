CREATE TABLE IF NOT EXISTS reading_list_tracker.books ( 
  isbn TEXT,
  id UUID,
  title TEXT,
  author_id UUID,
  total_pages INT,
  current_page INT,
  progress INT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS books_isbn_idx
ON reading_list_tracker.books (isbn);

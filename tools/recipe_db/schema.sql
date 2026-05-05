PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS source_files (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  processed_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dishes (
  id INTEGER PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  cuisine_group TEXT,
  source_file_id INTEGER NOT NULL,
  source_order INTEGER NOT NULL,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  servings TEXT,
  tips TEXT,
  instructions TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL,
  UNIQUE(canonical_name, category),
  FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dish_ingredients (
  id INTEGER PRIMARY KEY,
  dish_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  ingredient_text TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  UNIQUE(dish_id, position)
);

CREATE TABLE IF NOT EXISTS dish_steps (
  id INTEGER PRIMARY KEY,
  dish_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  step_text TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  UNIQUE(dish_id, position)
);

CREATE TABLE IF NOT EXISTS dish_sources (
  id INTEGER PRIMARY KEY,
  dish_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  publisher TEXT,
  accessed_at_utc TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrichment_queue (
  dish_id INTEGER PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('pending','in_progress','completed','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  updated_at_utc TEXT NOT NULL,
  FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);


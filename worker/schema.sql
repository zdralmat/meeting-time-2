CREATE TABLE IF NOT EXISTS submissions (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL CHECK(length(name) > 0 AND length(name) <= 100),
  day        TEXT     NOT NULL CHECK(day GLOB '????-??-??'),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, day)
);

CREATE INDEX IF NOT EXISTS idx_submissions_day ON submissions (day);

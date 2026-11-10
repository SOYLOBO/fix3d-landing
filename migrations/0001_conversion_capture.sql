ALTER TABLE repair_requests ADD COLUMN submission_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_submission ON repair_requests(submission_id);

CREATE TABLE IF NOT EXISTS contact_requests (
  event_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  kind TEXT NOT NULL CHECK(kind IN ('email','consultation')),
  email TEXT NOT NULL,
  preferred_time TEXT NOT NULL DEFAULT '',
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT,
  fbclid TEXT, referrer TEXT, landing_page TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

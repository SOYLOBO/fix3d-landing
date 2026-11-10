-- FIX3D repair requests.
-- Apply:  npx wrangler d1 execute fix3d-leads --remote --file=schema.sql
-- Local:  npx wrangler d1 execute fix3d-leads --local  --file=schema.sql

CREATE TABLE IF NOT EXISTS repair_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),

  -- who
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL,
  zip         TEXT NOT NULL,

  -- the machine
  make        TEXT,
  model       TEXT,

  -- the fault
  issue       TEXT NOT NULL,   -- spaghetti | blob | adhesion | layer-shift |
                               -- no-extrusion | no-power | maintenance | unknown
  details     TEXT NOT NULL,
  service     TEXT,            -- Drop-off | On-site | Not sure

  -- where the lead came from
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,
  fbclid       TEXT,
  referrer     TEXT,
  landing_page TEXT,

  -- request context
  country     TEXT,
  user_agent  TEXT,

  -- workflow
  status      TEXT NOT NULL DEFAULT 'new'  -- new | contacted | scheduled | done | junk
);

CREATE INDEX IF NOT EXISTS idx_requests_created ON repair_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status  ON repair_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_source  ON repair_requests (utm_source, utm_campaign);

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

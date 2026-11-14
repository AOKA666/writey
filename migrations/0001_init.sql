-- writey preview D1 schema. Re-runnable / idempotent enough for wrangler migrations.
-- User source_text is never stored.

CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT,
  guest_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_guest ON sessions(guest_id);

CREATE TABLE IF NOT EXISTS entitlements (
  subject_id TEXT PRIMARY KEY, -- user_id or guest:<id>
  plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro', 'guest_free')),
  period_yyyy_mm TEXT NOT NULL,
  pages_used INTEGER NOT NULL DEFAULT 0,
  jobs_used_today INTEGER NOT NULL DEFAULT 0,
  previews_used_today INTEGER NOT NULL DEFAULT 0,
  usage_day TEXT NOT NULL,
  quota_reset_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('teams_education', 'payments_open')),
  name TEXT,
  email TEXT NOT NULL,
  organisation TEXT,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Intentionally no table for source_text / export payload bodies.

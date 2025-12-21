-- Weekly Gift Limits (150 tokens per week)
-- Track weekly gift amounts to prevent exceeding the limit

-- Weekly gift tracking table
CREATE TABLE IF NOT EXISTS weekly_gift_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  year_week TEXT NOT NULL, -- Format: YYYY-WW (e.g., 2025-52)
  total_gifted INTEGER DEFAULT 0,
  gift_count INTEGER DEFAULT 0,
  last_gift_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year_week),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_weekly_gift_user_week ON weekly_gift_tracking(user_id, year_week);

-- Weekly gift limit configuration
CREATE TABLE IF NOT EXISTS weekly_gift_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_name TEXT UNIQUE NOT NULL,
  config_value INTEGER NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration (150 tokens per week)
INSERT OR IGNORE INTO weekly_gift_config (config_name, config_value, description, is_active) 
VALUES 
  ('weekly_gift_limit', 150, 'Maximum tokens a user can gift per week', 1),
  ('warning_threshold', 120, 'Tokens remaining threshold for warning (80%)', 1);

-- Weekly gift history for auditing
CREATE TABLE IF NOT EXISTS weekly_gift_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  year_week TEXT NOT NULL,
  amount INTEGER NOT NULL,
  recipient_id TEXT NOT NULL,
  total_gifted_after INTEGER NOT NULL,
  limit_value INTEGER NOT NULL,
  exceeded INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weekly_gift_history_user ON weekly_gift_history(user_id, year_week);

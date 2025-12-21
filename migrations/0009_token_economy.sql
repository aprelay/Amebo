-- Migration 0009: Token Economy System
-- Tier system, daily caps, earning history, and rate limiting

-- Update users table for email authentication and Nigerian users
ALTER TABLE users ADD COLUMN email TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN verification_expires DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN country_code TEXT DEFAULT 'NG';
ALTER TABLE users ADD COLUMN phone_number TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0;

-- Add token tier system
ALTER TABLE users ADD COLUMN token_tier TEXT DEFAULT 'bronze';
ALTER TABLE users ADD COLUMN total_earned INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_spent INTEGER DEFAULT 0;

-- Create index for email uniqueness (SQLite workaround)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Token earning history table
CREATE TABLE IF NOT EXISTS token_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  amount INTEGER NOT NULL,
  daily_total INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_token_earnings_user_date ON token_earnings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_token_earnings_action ON token_earnings(action);

-- Daily earning caps table
CREATE TABLE IF NOT EXISTS daily_earning_caps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  messages_count INTEGER DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  last_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_daily_caps_user_date ON daily_earning_caps(user_id, date);

-- Token tier multipliers and caps
-- Bronze: 0-99 tokens, 1x multiplier
-- Silver: 100-499 tokens, 1.2x multiplier
-- Gold: 500-999 tokens, 1.5x multiplier
-- Platinum: 1000+ tokens, 2x multiplier

-- Daily earning caps:
-- Messages: 100 tokens/day max
-- Files: 60 tokens/day max
-- Total: 500 tokens/day max

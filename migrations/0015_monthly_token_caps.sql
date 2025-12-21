-- Migration: Monthly Token Caps System
-- Purpose: Limit users to 1500 tokens per month to create scarcity and value
-- Created: 2025-12-20

-- Create monthly_earning_caps table to track monthly token earnings
CREATE TABLE IF NOT EXISTS monthly_earning_caps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    year_month TEXT NOT NULL, -- Format: YYYY-MM (e.g., "2025-12")
    total_earned INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    files_count INTEGER DEFAULT 0,
    rooms_created_count INTEGER DEFAULT 0,
    rooms_joined_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year_month),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_monthly_caps_user_month ON monthly_earning_caps(user_id, year_month);
CREATE INDEX IF NOT EXISTS idx_monthly_caps_year_month ON monthly_earning_caps(year_month);

-- Create monthly_cap_config table for flexible cap settings
CREATE TABLE IF NOT EXISTS monthly_cap_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cap_name TEXT UNIQUE NOT NULL,
    cap_value INTEGER NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default monthly cap configuration
INSERT OR IGNORE INTO monthly_cap_config (cap_name, cap_value, description, is_active) VALUES
    ('monthly_total_cap', 1500, 'Maximum tokens a user can earn per month (HARD LIMIT)', 1),
    ('message_tokens', 1, 'Tokens earned per message sent', 1),
    ('file_share_tokens', 3, 'Tokens earned per file shared', 1),
    ('room_create_tokens', 10, 'Tokens earned for creating a room', 1),
    ('room_join_tokens', 5, 'Tokens earned for joining a room', 1),
    ('warning_threshold', 1400, 'Show warning when user reaches this threshold', 1),
    -- One-Time Bonus Token Awards (count toward 1500 limit)
    ('bonus_login_streak_7', 150, 'One-time bonus tokens for 7-day login streak', 1),
    ('bonus_referral', 100, 'One-time bonus tokens per friend referred who joins', 1),
    ('bonus_profile_complete', 10, 'One-time bonus tokens for completing profile with avatar', 1),
    ('bonus_email_verified', 10, 'One-time bonus tokens for verifying email', 1),
    ('bonus_first_ad_campaign', 200, 'One-time bonus tokens for creating first ad campaign', 1);

-- Create monthly_cap_history table for audit trail
CREATE TABLE IF NOT EXISTS monthly_cap_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    year_month TEXT NOT NULL,
    action TEXT NOT NULL,
    tokens_earned INTEGER NOT NULL,
    tokens_total INTEGER NOT NULL, -- Running total for the month
    cap_limit INTEGER NOT NULL, -- What was the cap at the time
    exceeded INTEGER DEFAULT 0, -- Was the cap exceeded?
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_bonus_achievements table to track earned bonuses
CREATE TABLE IF NOT EXISTS user_bonus_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    year_month TEXT NOT NULL,
    bonus_type TEXT NOT NULL, -- 'login_streak_7', 'referral', 'profile_complete', etc.
    bonus_amount INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year_month, bonus_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for bonus lookups
CREATE INDEX IF NOT EXISTS idx_bonus_user_month ON user_bonus_achievements(user_id, year_month);
CREATE INDEX IF NOT EXISTS idx_bonus_type ON user_bonus_achievements(bonus_type);

-- Create index for history lookups
CREATE INDEX IF NOT EXISTS idx_cap_history_user_month ON monthly_cap_history(user_id, year_month);
CREATE INDEX IF NOT EXISTS idx_cap_history_created ON monthly_cap_history(created_at);

-- Add monthly_tokens_earned column to users table if not exists
ALTER TABLE users ADD COLUMN current_month_tokens INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_token_reset_month TEXT DEFAULT '';

-- Create view for easy monthly stats
CREATE VIEW IF NOT EXISTS v_monthly_token_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.tokens as current_balance,
    u.total_earned as lifetime_earned,
    u.current_month_tokens as month_earned,
    mec.year_month,
    mec.total_earned as month_total,
    mcc.cap_value as monthly_cap,
    (mcc.cap_value - COALESCE(mec.total_earned, 0)) as remaining_tokens,
    CAST((COALESCE(mec.total_earned, 0) * 100.0 / mcc.cap_value) AS INTEGER) as cap_percentage,
    CASE 
        WHEN COALESCE(mec.total_earned, 0) >= mcc.cap_value THEN 'capped'
        WHEN COALESCE(mec.total_earned, 0) >= (SELECT cap_value FROM monthly_cap_config WHERE cap_name = 'warning_threshold') THEN 'warning'
        ELSE 'normal'
    END as status
FROM users u
CROSS JOIN monthly_cap_config mcc
LEFT JOIN monthly_earning_caps mec ON u.id = mec.user_id 
    AND mec.year_month = strftime('%Y-%m', 'now')
WHERE mcc.cap_name = 'monthly_total_cap'
    AND mcc.is_active = 1;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_current_month ON users(current_month_tokens);
CREATE INDEX IF NOT EXISTS idx_users_last_reset ON users(last_token_reset_month);

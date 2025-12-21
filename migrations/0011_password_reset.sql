-- Migration 0011: Password Reset System
-- Adds password reset token functionality for users who forget their password

-- Add password reset columns to users table
ALTER TABLE users ADD COLUMN password_reset_token TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN password_reset_expires DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN password_reset_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_password_reset DATETIME DEFAULT NULL;

-- Create index for faster password reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);

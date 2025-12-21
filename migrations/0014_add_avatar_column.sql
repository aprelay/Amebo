-- Add avatar column to users table
ALTER TABLE users ADD COLUMN avatar TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar);

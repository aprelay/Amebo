-- Enhanced Features: Contact Requests, Block, Online Status, Typing, Read Receipts

-- Add status tracking columns to users table
ALTER TABLE users ADD COLUMN last_seen DATETIME;
ALTER TABLE users ADD COLUMN online_status TEXT DEFAULT 'offline'; -- 'online', 'offline', 'away'

-- Add typing status table
CREATE TABLE IF NOT EXISTS typing_status (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    started_at DATETIME,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add read receipts table
CREATE TABLE IF NOT EXISTS message_receipts (
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    read_at DATETIME,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    user_id TEXT NOT NULL,
    blocked_user_id TEXT NOT NULL,
    blocked_at DATETIME,
    reason TEXT,
    PRIMARY KEY (user_id, blocked_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_typing_status_room ON typing_status(room_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_user ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_online_status ON users(online_status);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- Update contacts table to support pending/accepted/rejected states
-- (already exists from previous migration, just documenting)
-- status: 'pending', 'accepted', 'rejected', 'blocked'

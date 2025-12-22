-- Migration for Profile & Chat Management Features
-- Date: 2025-12-22

-- Custom nicknames table (user-specific, private)
CREATE TABLE IF NOT EXISTS custom_nicknames (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    target_user_id TEXT,
    room_id TEXT,
    nickname TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id, room_id)
);

CREATE INDEX idx_custom_nicknames_user ON custom_nicknames(user_id);
CREATE INDEX idx_custom_nicknames_target ON custom_nicknames(target_user_id);

-- Muted chats table
CREATE TABLE IF NOT EXISTS muted_chats (
    user_id TEXT NOT NULL,
    room_id TEXT NOT NULL,
    muted_until DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, room_id)
);

CREATE INDEX idx_muted_chats_user ON muted_chats(user_id);
CREATE INDEX idx_muted_chats_expires ON muted_chats(muted_until);

-- Group permissions table
CREATE TABLE IF NOT EXISTS group_permissions (
    room_id TEXT NOT NULL,
    permission_type TEXT NOT NULL, -- messages, add_members, edit_info
    permission_value TEXT NOT NULL, -- everyone, admins
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, permission_type)
);

CREATE INDEX idx_group_permissions_room ON group_permissions(room_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    reported_user_id TEXT,
    reported_room_id TEXT,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
    resolved_by TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_user ON reports(reported_user_id);
CREATE INDEX idx_reports_room ON reports(reported_room_id);
CREATE INDEX idx_reports_status ON reports(status);

-- Deleted messages table (soft delete per user)
CREATE TABLE IF NOT EXISTS deleted_messages (
    user_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, message_id)
);

CREATE INDEX idx_deleted_messages_user ON deleted_messages(user_id);
CREATE INDEX idx_deleted_messages_message ON deleted_messages(message_id);

-- Add new columns to rooms table (if not exists)
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we handle this in application

-- Example queries to add columns (run manually if needed):
-- ALTER TABLE rooms ADD COLUMN description TEXT;
-- ALTER TABLE rooms ADD COLUMN avatar TEXT;
-- ALTER TABLE rooms ADD COLUMN privacy TEXT DEFAULT 'private'; -- public, private, secret
-- ALTER TABLE rooms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

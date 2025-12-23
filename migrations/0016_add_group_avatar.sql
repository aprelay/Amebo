-- Add avatar and description columns to chat_rooms table for group customization
-- Date: 2025-12-23

ALTER TABLE chat_rooms ADD COLUMN description TEXT;
ALTER TABLE chat_rooms ADD COLUMN avatar TEXT;
ALTER TABLE chat_rooms ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_chat_rooms_avatar ON chat_rooms(avatar);

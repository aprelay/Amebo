-- Add file attachments support to messages
ALTER TABLE messages ADD COLUMN file_url TEXT;
ALTER TABLE messages ADD COLUMN file_name TEXT;
ALTER TABLE messages ADD COLUMN file_type TEXT;
ALTER TABLE messages ADD COLUMN file_size INTEGER;

-- Create calls table for call history
CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  caller_id TEXT NOT NULL,
  call_type TEXT NOT NULL, -- 'voice', 'video'
  status TEXT DEFAULT 'initiated', -- 'initiated', 'ringing', 'active', 'ended', 'missed'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  duration INTEGER, -- in seconds
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  FOREIGN KEY (caller_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_calls_room_id ON calls(room_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller_id ON calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_started_at ON calls(started_at);

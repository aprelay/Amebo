-- Add user search and privacy features

-- Add search fields to users table
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN is_searchable INTEGER DEFAULT 1; -- 1 = public, 0 = private

-- Add privacy settings
ALTER TABLE users ADD COLUMN message_privacy TEXT DEFAULT 'anyone'; -- 'anyone', 'contacts_only'
ALTER TABLE users ADD COLUMN last_seen_privacy TEXT DEFAULT 'everyone'; -- 'everyone', 'contacts', 'nobody'

-- Create contacts/allowed users table
CREATE TABLE IF NOT EXISTS user_contacts (
  user_id TEXT NOT NULL,
  contact_user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, contact_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (contact_user_id) REFERENCES users(id)
);

-- Create direct message rooms table (1-on-1 chats)
CREATE TABLE IF NOT EXISTS direct_message_rooms (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT NOT NULL,
  room_id TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  -- Ensure no duplicate DM rooms
  UNIQUE(user1_id, user2_id)
);

-- Add room type to chat_rooms
ALTER TABLE chat_rooms ADD COLUMN room_type TEXT DEFAULT 'group'; -- 'group', 'direct'

-- Create index for faster user search
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_searchable ON users(is_searchable);
CREATE INDEX IF NOT EXISTS idx_user_contacts_status ON user_contacts(status);

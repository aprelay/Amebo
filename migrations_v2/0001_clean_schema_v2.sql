-- ============================================
-- AMEBO v2.0 - CLEAN DATABASE SCHEMA
-- ============================================
-- This is a complete rewrite with proper constraints
-- All operations are atomic with CASCADE deletes
-- No orphaned records, no data integrity issues
-- ============================================

-- Drop all existing tables for clean slate
DROP TABLE IF EXISTS typing_status;
DROP TABLE IF EXISTS read_receipts;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS token_transactions;
DROP TABLE IF EXISTS token_earnings;
DROP TABLE IF EXISTS daily_earning_caps;
DROP TABLE IF EXISTS monthly_token_tracking;
DROP TABLE IF EXISTS user_contacts;
DROP TABLE IF EXISTS blocked_users;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS room_members;
DROP TABLE IF EXISTS direct_message_rooms;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS users;

-- ============================================
-- CORE TABLES
-- ============================================

-- 1. USERS - Core identity and settings
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar TEXT,
    
    -- Status
    online_status TEXT DEFAULT 'offline' CHECK(online_status IN ('online', 'offline', 'away')),
    last_seen DATETIME,
    
    -- Privacy settings
    is_searchable INTEGER DEFAULT 1,
    message_privacy TEXT DEFAULT 'anyone' CHECK(message_privacy IN ('anyone', 'contacts_only', 'nobody')),
    last_seen_privacy TEXT DEFAULT 'everyone' CHECK(last_seen_privacy IN ('everyone', 'contacts_only', 'nobody')),
    
    -- Token economy
    tokens INTEGER DEFAULT 0,
    token_tier TEXT DEFAULT 'bronze',
    total_earned INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CHAT ROOMS - All conversation types
CREATE TABLE chat_rooms (
    id TEXT PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    room_name TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK(room_type IN ('direct', 'group')),
    created_by TEXT NOT NULL,
    avatar TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. ROOM MEMBERS - Who's in each room (WITH CASCADE!)
CREATE TABLE room_members (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK(role IN ('member', 'admin', 'owner')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. DIRECT MESSAGES - Mapping for 1-on-1 chats
CREATE TABLE direct_message_rooms (
    room_id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure unique DM pairs (ordered to prevent duplicates)
    UNIQUE(user1_id, user2_id),
    CHECK(user1_id < user2_id)
);

-- 5. MESSAGES - Core communication
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    iv TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'file', 'voice', 'image')),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- 6. CONTACTS - User connections
CREATE TABLE user_contacts (
    user_id TEXT NOT NULL,
    contact_user_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, contact_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. BLOCKED USERS
CREATE TABLE blocked_users (
    user_id TEXT NOT NULL,
    blocked_user_id TEXT NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, blocked_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- REAL-TIME FEATURES
-- ============================================

-- 8. TYPING INDICATORS
CREATE TABLE typing_status (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. READ RECEIPTS
CREATE TABLE read_receipts (
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- 10. NOTIFICATIONS
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data TEXT, -- JSON
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- FILE ATTACHMENTS
-- ============================================

-- 11. ATTACHMENTS
CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    view_once INTEGER DEFAULT 0,
    viewed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Messages
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Room Members
CREATE INDEX idx_room_members_user ON room_members(user_id);
CREATE INDEX idx_room_members_room ON room_members(room_id);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(online_status);

-- Direct Messages
CREATE INDEX idx_direct_messages_users ON direct_message_rooms(user1_id, user2_id);

-- Contacts
CREATE INDEX idx_contacts_user ON user_contacts(user_id);
CREATE INDEX idx_contacts_status ON user_contacts(status);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_chat_rooms_timestamp 
AFTER UPDATE ON chat_rooms
BEGIN
    UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_contacts_timestamp 
AFTER UPDATE ON user_contacts
BEGIN
    UPDATE user_contacts SET updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = NEW.user_id AND contact_user_id = NEW.contact_user_id;
END;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check schema integrity
SELECT 
    'Tables created' as status,
    COUNT(*) as count
FROM sqlite_master 
WHERE type = 'table' AND name NOT LIKE 'sqlite_%';

-- Check indexes created
SELECT 
    'Indexes created' as status,
    COUNT(*) as count
FROM sqlite_master 
WHERE type = 'index' AND name NOT LIKE 'sqlite_%';

-- Check triggers created
SELECT 
    'Triggers created' as status,
    COUNT(*) as count
FROM sqlite_master 
WHERE type = 'trigger';

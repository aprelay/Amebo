-- Database Cleanup Script
-- Fixes orphaned records and missing memberships
-- Run this to fix "news1 chat not showing" and similar issues

-- 1. Remove orphaned members (room doesn't exist)
DELETE FROM room_members 
WHERE room_id NOT IN (SELECT id FROM chat_rooms);

-- 2. Remove orphaned messages (room doesn't exist)
DELETE FROM messages 
WHERE room_id NOT IN (SELECT id FROM chat_rooms);

-- 3. Remove DM mappings for deleted rooms
DELETE FROM direct_message_rooms 
WHERE room_id NOT IN (SELECT id FROM chat_rooms);

-- 4. Add missing members for DMs (CRITICAL FIX)
-- For user1
INSERT OR IGNORE INTO room_members (room_id, user_id)
SELECT room_id, user1_id FROM direct_message_rooms
WHERE NOT EXISTS (
    SELECT 1 FROM room_members 
    WHERE room_id = direct_message_rooms.room_id 
    AND user_id = direct_message_rooms.user1_id
);

-- For user2
INSERT OR IGNORE INTO room_members (room_id, user_id)
SELECT room_id, user2_id FROM direct_message_rooms
WHERE NOT EXISTS (
    SELECT 1 FROM room_members 
    WHERE room_id = direct_message_rooms.room_id 
    AND user_id = direct_message_rooms.user2_id
);

-- 5. Verify integrity
SELECT 
    'Rooms without members' as issue,
    COUNT(*) as count
FROM chat_rooms cr
WHERE NOT EXISTS (
    SELECT 1 FROM room_members WHERE room_id = cr.id
)
UNION ALL
SELECT 
    'DMs without both members' as issue,
    COUNT(*) as count
FROM direct_message_rooms dm
WHERE NOT EXISTS (
    SELECT 1 FROM room_members WHERE room_id = dm.room_id AND user_id = dm.user1_id
) OR NOT EXISTS (
    SELECT 1 FROM room_members WHERE room_id = dm.room_id AND user_id = dm.user2_id
);

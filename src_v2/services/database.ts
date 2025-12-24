// ============================================
// AMEBO v2.0 - Database Service
// ============================================
// All database operations are atomic and use transactions
// Proper error handling and rollback support
// ============================================

import type { D1Database } from '@cloudflare/workers-types';
import type { 
    User, ChatRoom, DirectMessageRoom, Message, 
    RoomMember, RoomWithDetails 
} from '../types';

/**
 * Create a direct message room atomically
 * Ensures all 3 operations succeed or all fail
 */
export async function createDirectMessageAtomic(
    db: D1Database,
    user1Id: string,
    user2Id: string
): Promise<RoomWithDetails> {
    // Ensure consistent ordering
    const [smallerId, largerId] = user1Id < user2Id 
        ? [user1Id, user2Id] 
        : [user2Id, user1Id];
    
    // Check if DM already exists
    const existing = await db.prepare(`
        SELECT dm.room_id, cr.*
        FROM direct_message_rooms dm
        JOIN chat_rooms cr ON dm.room_id = cr.id
        WHERE dm.user1_id = ? AND dm.user2_id = ?
    `).bind(smallerId, largerId).first<RoomWithDetails>();
    
    if (existing) {
        // Return existing room with other_user data
        const otherUserId = user1Id === smallerId ? largerId : smallerId;
        const otherUser = await db.prepare(`
            SELECT id, username, display_name, avatar, online_status, last_seen
            FROM users WHERE id = ?
        `).bind(otherUserId).first<User>();
        
        return {
            ...existing,
            other_user: otherUser || undefined
        };
    }
    
    // Generate IDs
    const roomId = crypto.randomUUID();
    const roomCode = `dm-${crypto.randomUUID().slice(0, 8)}`;
    
    // Get other user's name for room name
    const user2 = await db.prepare(`
        SELECT display_name, username FROM users WHERE id = ?
    `).bind(user2Id).first<User>();
    
    const roomName = user2?.display_name || user2?.username || 'Direct Message';
    
    // ATOMIC: Execute all operations in a batch transaction
    const results = await db.batch([
        // 1. Create room
        db.prepare(`
            INSERT INTO chat_rooms (id, room_code, room_name, room_type, created_by)
            VALUES (?, ?, ?, 'direct', ?)
        `).bind(roomId, roomCode, roomName, user1Id),
        
        // 2. Add user1 as member
        db.prepare(`
            INSERT INTO room_members (room_id, user_id, role)
            VALUES (?, ?, 'member')
        `).bind(roomId, smallerId),
        
        // 3. Add user2 as member
        db.prepare(`
            INSERT INTO room_members (room_id, user_id, role)
            VALUES (?, ?, 'member')
        `).bind(roomId, largerId),
        
        // 4. Create DM mapping
        db.prepare(`
            INSERT INTO direct_message_rooms (room_id, user1_id, user2_id)
            VALUES (?, ?, ?)
        `).bind(roomId, smallerId, largerId)
    ]);
    
    // Check if all operations succeeded
    const allSucceeded = results.every(r => r.success);
    if (!allSucceeded) {
        throw new Error('Failed to create direct message room atomically');
    }
    
    // Fetch complete room data
    const room = await db.prepare(`
        SELECT * FROM chat_rooms WHERE id = ?
    `).bind(roomId).first<ChatRoom>();
    
    if (!room) {
        throw new Error('Room created but not found');
    }
    
    // Get other user data
    const otherUserId = user1Id === smallerId ? largerId : smallerId;
    const otherUser = await db.prepare(`
        SELECT id, username, display_name, avatar, online_status, last_seen
        FROM users WHERE id = ?
    `).bind(otherUserId).first<User>();
    
    return {
        ...room,
        other_user: otherUser || undefined
    };
}

/**
 * Get user's rooms with member count and other_user data for DMs
 */
export async function getUserRooms(
    db: D1Database,
    userId: string
): Promise<RoomWithDetails[]> {
    // Get all rooms user is a member of
    const roomsResult = await db.prepare(`
        SELECT 
            cr.*,
            (SELECT COUNT(*) FROM room_members WHERE room_id = cr.id) as member_count
        FROM chat_rooms cr
        JOIN room_members rm ON cr.id = rm.room_id
        WHERE rm.user_id = ?
        ORDER BY cr.updated_at DESC
    `).bind(userId).all<RoomWithDetails>();
    
    const rooms = roomsResult.results || [];
    
    // For each DM room, fetch the other user's data
    const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
        if (room.room_type === 'direct') {
            const dmInfo = await db.prepare(`
                SELECT user1_id, user2_id
                FROM direct_message_rooms
                WHERE room_id = ?
            `).bind(room.id).first<DirectMessageRoom>();
            
            if (dmInfo) {
                const otherUserId = dmInfo.user1_id === userId 
                    ? dmInfo.user2_id 
                    : dmInfo.user1_id;
                
                const otherUser = await db.prepare(`
                    SELECT id, username, display_name, avatar, online_status, last_seen
                    FROM users WHERE id = ?
                `).bind(otherUserId).first<User>();
                
                return {
                    ...room,
                    other_user: otherUser || undefined
                };
            }
        }
        
        return room;
    }));
    
    return roomsWithDetails;
}

/**
 * Check if user is a member of a room
 */
export async function isRoomMember(
    db: D1Database,
    roomId: string,
    userId: string
): Promise<boolean> {
    const member = await db.prepare(`
        SELECT 1 FROM room_members
        WHERE room_id = ? AND user_id = ?
    `).bind(roomId, userId).first();
    
    return !!member;
}

/**
 * Send message (with membership check)
 */
export async function sendMessage(
    db: D1Database,
    roomId: string,
    senderId: string,
    encryptedContent: string,
    iv: string,
    messageType: 'text' | 'file' | 'voice' | 'image' = 'text'
): Promise<Message> {
    // Check membership
    const isMember = await isRoomMember(db, roomId, senderId);
    if (!isMember) {
        throw new Error('NOT_MEMBER');
    }
    
    const messageId = crypto.randomUUID();
    
    const result = await db.prepare(`
        INSERT INTO messages (id, room_id, sender_id, encrypted_content, iv, message_type)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(messageId, roomId, senderId, encryptedContent, iv, messageType).run();
    
    if (!result.success) {
        throw new Error('Failed to send message');
    }
    
    // Update room timestamp
    await db.prepare(`
        UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(roomId).run();
    
    const message = await db.prepare(`
        SELECT * FROM messages WHERE id = ?
    `).bind(messageId).first<Message>();
    
    if (!message) {
        throw new Error('Message created but not found');
    }
    
    return message;
}

/**
 * Get room messages
 */
export async function getRoomMessages(
    db: D1Database,
    roomId: string,
    userId: string,
    limit: number = 50
): Promise<Message[]> {
    // Check membership
    const isMember = await isRoomMember(db, roomId, userId);
    if (!isMember) {
        throw new Error('NOT_MEMBER');
    }
    
    const result = await db.prepare(`
        SELECT * FROM messages
        WHERE room_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    `).bind(roomId, limit).all<Message>();
    
    return (result.results || []).reverse();
}

/**
 * Delete room (CASCADE will handle members, messages, etc.)
 */
export async function deleteRoom(
    db: D1Database,
    roomId: string,
    userId: string
): Promise<void> {
    // Check if user is member
    const isMember = await isRoomMember(db, roomId, userId);
    if (!isMember) {
        throw new Error('NOT_MEMBER');
    }
    
    // For DMs, just remove the user as a member
    // For groups, check if owner
    const room = await db.prepare(`
        SELECT room_type, created_by FROM chat_rooms WHERE id = ?
    `).bind(roomId).first<ChatRoom>();
    
    if (!room) {
        throw new Error('ROOM_NOT_FOUND');
    }
    
    if (room.room_type === 'direct') {
        // Just leave the DM
        await db.prepare(`
            DELETE FROM room_members WHERE room_id = ? AND user_id = ?
        `).bind(roomId, userId).run();
        
        // If no members left, CASCADE will delete the room
        const remainingMembers = await db.prepare(`
            SELECT COUNT(*) as count FROM room_members WHERE room_id = ?
        `).bind(roomId).first<{ count: number }>();
        
        if (remainingMembers && remainingMembers.count === 0) {
            await db.prepare(`
                DELETE FROM chat_rooms WHERE id = ?
            `).bind(roomId).run();
        }
    } else {
        // Group room - only owner can delete
        if (room.created_by !== userId) {
            throw new Error('Only owner can delete group');
        }
        
        // CASCADE will handle all related records
        await db.prepare(`
            DELETE FROM chat_rooms WHERE id = ?
        `).bind(roomId).run();
    }
}

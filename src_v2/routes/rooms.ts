// ============================================
// AMEBO v2.0 - Room Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types';
import { 
    createDirectMessageAtomic, 
    getUserRooms,
    deleteRoom 
} from '../services/database';
import { 
    sendError, 
    sendSuccess, 
    validateRequired 
} from '../middleware/errorHandler';

const rooms = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v2/rooms/direct
 * Create or get existing direct message room
 */
rooms.post('/direct', async (c) => {
    try {
        const { recipient_id, sender_id } = await c.req.json();
        
        // Validate required fields
        const validation = validateRequired({ recipient_id, sender_id }, ['recipient_id', 'sender_id']);
        if (validation) {
            return sendError(c, 'MISSING_FIELDS', validation);
        }
        
        // Check if trying to DM self
        if (recipient_id === sender_id) {
            return sendError(c, 'CANNOT_DM_SELF');
        }
        
        // Check if recipient exists
        const recipient = await c.env.DB.prepare(`
            SELECT id, message_privacy FROM users WHERE id = ?
        `).bind(recipient_id).first();
        
        if (!recipient) {
            return sendError(c, 'USER_NOT_FOUND');
        }
        
        // Check privacy settings
        if (recipient.message_privacy === 'contacts_only') {
            const isContact = await c.env.DB.prepare(`
                SELECT 1 FROM user_contacts
                WHERE user_id = ? AND contact_user_id = ? AND status = 'accepted'
            `).bind(recipient_id, sender_id).first();
            
            if (!isContact) {
                return sendError(c, 'PRIVACY_VIOLATION', 'This user only accepts messages from contacts');
            }
        } else if (recipient.message_privacy === 'nobody') {
            return sendError(c, 'PRIVACY_VIOLATION', 'This user does not accept messages');
        }
        
        // Create DM atomically
        const room = await createDirectMessageAtomic(c.env.DB, sender_id, recipient_id);
        
        console.log('[V2] ✅ DM created/fetched:', { 
            roomId: room.id, 
            user1: sender_id, 
            user2: recipient_id,
            other_user: room.other_user?.username
        });
        
        return sendSuccess(c, { room }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ DM creation error:', error);
        return sendError(c, 'ROOM_CREATION_FAILED', error.message);
    }
});

/**
 * GET /api/v2/rooms/user/:userId
 * Get all rooms for a user
 */
rooms.get('/user/:userId', async (c) => {
    try {
        const userId = c.req.param('userId');
        
        if (!userId) {
            return sendError(c, 'MISSING_FIELDS', 'userId is required');
        }
        
        const rooms = await getUserRooms(c.env.DB, userId);
        
        console.log('[V2] ✅ Loaded rooms:', { 
            userId, 
            count: rooms.length,
            sample: rooms.slice(0, 2).map(r => ({
                id: r.id,
                type: r.room_type,
                other_user: r.other_user?.username
            }))
        });
        
        return sendSuccess(c, { rooms }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Load rooms error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * POST /api/v2/rooms/:roomId/leave
 * Leave/delete a room
 */
rooms.post('/:roomId/leave', async (c) => {
    try {
        const roomId = c.req.param('roomId');
        const { user_id } = await c.req.json();
        
        const validation = validateRequired({ roomId, user_id }, ['roomId', 'user_id']);
        if (validation) {
            return sendError(c, 'MISSING_FIELDS', validation);
        }
        
        await deleteRoom(c.env.DB, roomId, user_id);
        
        console.log('[V2] ✅ Room deleted:', { roomId, userId: user_id });
        
        return sendSuccess(c, { message: 'Successfully left room' }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Delete room error:', error);
        
        if (error.message === 'NOT_MEMBER') {
            return sendError(c, 'NOT_MEMBER');
        }
        if (error.message === 'ROOM_NOT_FOUND') {
            return sendError(c, 'ROOM_NOT_FOUND');
        }
        
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * GET /api/v2/rooms/:roomId/members
 * Get room members
 */
rooms.get('/:roomId/members', async (c) => {
    try {
        const roomId = c.req.param('roomId');
        
        if (!roomId) {
            return sendError(c, 'MISSING_FIELDS', 'roomId is required');
        }
        
        const membersResult = await c.env.DB.prepare(`
            SELECT 
                rm.*,
                u.id as user_id,
                u.username,
                u.display_name,
                u.avatar,
                u.online_status,
                u.last_seen
            FROM room_members rm
            JOIN users u ON rm.user_id = u.id
            WHERE rm.room_id = ?
        `).bind(roomId).all();
        
        const members = membersResult.results || [];
        
        return sendSuccess(c, { members }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Get members error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

export default rooms;

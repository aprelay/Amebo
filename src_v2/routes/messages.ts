// ============================================
// AMEBO v2.0 - Message Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types';
import { 
    sendMessage, 
    getRoomMessages 
} from '../services/database';
import { 
    sendError, 
    sendSuccess, 
    validateRequired 
} from '../middleware/errorHandler';

const messages = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v2/messages/send
 * Send a message to a room
 */
messages.post('/send', async (c) => {
    try {
        const { roomId, senderId, encryptedContent, iv, messageType } = await c.req.json();
        
        // Validate required fields
        const validation = validateRequired(
            { roomId, senderId, encryptedContent, iv },
            ['roomId', 'senderId', 'encryptedContent', 'iv']
        );
        if (validation) {
            return sendError(c, 'MISSING_FIELDS', validation);
        }
        
        // Send message
        const message = await sendMessage(
            c.env.DB,
            roomId,
            senderId,
            encryptedContent,
            iv,
            messageType || 'text'
        );
        
        console.log('[V2] ✅ Message sent:', { 
            messageId: message.id, 
            roomId, 
            senderId,
            type: message.message_type
        });
        
        return sendSuccess(c, { message }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Send message error:', error);
        
        if (error.message === 'NOT_MEMBER') {
            return sendError(c, 'NOT_MEMBER');
        }
        
        return sendError(c, 'MESSAGE_SEND_FAILED', error.message);
    }
});

/**
 * GET /api/v2/messages/:roomId
 * Get messages for a room
 */
messages.get('/:roomId', async (c) => {
    try {
        const roomId = c.req.param('roomId');
        const userId = c.req.query('userId');
        const limit = parseInt(c.req.query('limit') || '50');
        
        if (!roomId || !userId) {
            return sendError(c, 'MISSING_FIELDS', 'roomId and userId are required');
        }
        
        const messages = await getRoomMessages(c.env.DB, roomId, userId, limit);
        
        console.log('[V2] ✅ Messages loaded:', { 
            roomId, 
            userId,
            count: messages.length 
        });
        
        return sendSuccess(c, { messages }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Load messages error:', error);
        
        if (error.message === 'NOT_MEMBER') {
            return sendError(c, 'NOT_MEMBER');
        }
        
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

export default messages;

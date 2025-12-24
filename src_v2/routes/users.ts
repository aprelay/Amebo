// ============================================
// AMEBO v2.0 - User Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types';
import { 
    sendError, 
    sendSuccess 
} from '../middleware/errorHandler';

const users = new Hono<{ Bindings: Env }>();

/**
 * GET /api/v2/users/search
 * Search for users
 */
users.get('/search', async (c) => {
    try {
        const query = c.req.query('q') || '';
        const currentUserId = c.req.query('userId');
        
        if (!query || query.length < 2) {
            return sendSuccess(c, { users: [] }, 200);
        }
        
        // Search users (exclude current user)
        const result = await c.env.DB.prepare(`
            SELECT id, username, display_name, avatar, online_status
            FROM users
            WHERE (username LIKE ? OR display_name LIKE ?)
            AND id != ?
            AND is_searchable = 1
            LIMIT 20
        `).bind(`%${query}%`, `%${query}%`, currentUserId || '').all();
        
        const users = result.results || [];
        
        console.log('[V2] ✅ User search:', { query, count: users.length });
        
        return sendSuccess(c, { users }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Search error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * GET /api/v2/users/:userId
 * Get user profile
 */
users.get('/:userId', async (c) => {
    try {
        const userId = c.req.param('userId');
        
        if (!userId) {
            return sendError(c, 'MISSING_FIELDS', 'userId is required');
        }
        
        const user = await c.env.DB.prepare(`
            SELECT id, username, display_name, avatar, online_status, last_seen, tokens, token_tier
            FROM users WHERE id = ?
        `).bind(userId).first();
        
        if (!user) {
            return sendError(c, 'USER_NOT_FOUND');
        }
        
        return sendSuccess(c, { user }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Get user error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * PUT /api/v2/users/:userId/privacy
 * Update privacy settings
 */
users.put('/:userId/privacy', async (c) => {
    try {
        const userId = c.req.param('userId');
        const { is_searchable, message_privacy, last_seen_privacy } = await c.req.json();
        
        if (!userId) {
            return sendError(c, 'MISSING_FIELDS', 'userId is required');
        }
        
        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        
        if (is_searchable !== undefined) {
            updates.push('is_searchable = ?');
            values.push(is_searchable ? 1 : 0);
        }
        if (message_privacy) {
            updates.push('message_privacy = ?');
            values.push(message_privacy);
        }
        if (last_seen_privacy) {
            updates.push('last_seen_privacy = ?');
            values.push(last_seen_privacy);
        }
        
        if (updates.length === 0) {
            return sendError(c, 'VALIDATION_ERROR', 'No valid fields to update');
        }
        
        values.push(userId);
        
        await c.env.DB.prepare(`
            UPDATE users SET ${updates.join(', ')} WHERE id = ?
        `).bind(...values).run();
        
        console.log('[V2] ✅ Privacy updated:', { userId, updates });
        
        return sendSuccess(c, { message: 'Privacy settings updated' }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Update privacy error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * PUT /api/v2/users/:userId/online
 * Update online status
 */
users.put('/:userId/online', async (c) => {
    try {
        const userId = c.req.param('userId');
        const { status } = await c.req.json();
        
        if (!userId || !status) {
            return sendError(c, 'MISSING_FIELDS', 'userId and status are required');
        }
        
        if (!['online', 'offline', 'away'].includes(status)) {
            return sendError(c, 'VALIDATION_ERROR', 'Invalid status');
        }
        
        await c.env.DB.prepare(`
            UPDATE users SET online_status = ?, last_seen = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(status, userId).run();
        
        return sendSuccess(c, { status }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Update online status error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

export default users;

// ============================================
// AMEBO v2.0 - Authentication Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types';
import { 
    sendError, 
    sendSuccess, 
    validateRequired 
} from '../middleware/errorHandler';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/v2/auth/register
 * Register a new user
 */
auth.post('/register', async (c) => {
    try {
        const { email, username, password, display_name } = await c.req.json();
        
        // Validate required fields
        const validation = validateRequired(
            { email, username, password },
            ['email', 'username', 'password']
        );
        if (validation) {
            return sendError(c, 'MISSING_FIELDS', validation);
        }
        
        // Hash password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Create user
        const userId = crypto.randomUUID();
        
        await c.env.DB.prepare(`
            INSERT INTO users (id, email, username, password_hash, display_name)
            VALUES (?, ?, ?, ?, ?)
        `).bind(userId, email, username, password_hash, display_name || username).run();
        
        // Fetch created user (without password)
        const user = await c.env.DB.prepare(`
            SELECT id, email, username, display_name, avatar, tokens, token_tier
            FROM users WHERE id = ?
        `).bind(userId).first();
        
        console.log('[V2] ✅ User registered:', { userId, email, username });
        
        return sendSuccess(c, { user }, 201);
        
    } catch (error: any) {
        console.error('[V2] ❌ Registration error:', error);
        
        // Handle unique constraint violations
        if (error.message.includes('UNIQUE constraint failed')) {
            if (error.message.includes('email')) {
                return sendError(c, 'EMAIL_EXISTS');
            }
            if (error.message.includes('username')) {
                return sendError(c, 'USERNAME_EXISTS');
            }
        }
        
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * POST /api/v2/auth/login
 * Login with email and password
 */
auth.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        
        const validation = validateRequired({ email, password }, ['email', 'password']);
        if (validation) {
            return sendError(c, 'MISSING_FIELDS', validation);
        }
        
        // Hash password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Find user
        const user = await c.env.DB.prepare(`
            SELECT id, email, username, display_name, avatar, tokens, token_tier, password_hash
            FROM users WHERE email = ?
        `).bind(email).first<any>();
        
        if (!user || user.password_hash !== password_hash) {
            return sendError(c, 'INVALID_CREDENTIALS');
        }
        
        // Update online status
        await c.env.DB.prepare(`
            UPDATE users SET online_status = 'online', last_seen = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(user.id).run();
        
        // Remove password from response
        delete user.password_hash;
        
        console.log('[V2] ✅ User logged in:', { userId: user.id, email });
        
        return sendSuccess(c, { user }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Login error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

/**
 * POST /api/v2/auth/logout
 * Logout user
 */
auth.post('/logout', async (c) => {
    try {
        const { user_id } = await c.req.json();
        
        if (!user_id) {
            return sendError(c, 'MISSING_FIELDS', 'user_id is required');
        }
        
        // Update online status
        await c.env.DB.prepare(`
            UPDATE users SET online_status = 'offline', last_seen = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(user_id).run();
        
        console.log('[V2] ✅ User logged out:', { userId: user_id });
        
        return sendSuccess(c, { message: 'Logged out successfully' }, 200);
        
    } catch (error: any) {
        console.error('[V2] ❌ Logout error:', error);
        return sendError(c, 'INTERNAL_ERROR', error.message);
    }
});

export default auth;

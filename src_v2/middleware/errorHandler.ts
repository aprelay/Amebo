// ============================================
// AMEBO v2.0 - Error Codes & Handler
// ============================================

import type { Context } from 'hono';
import type { APIError, APIResponse } from '../types';

// Standard error codes
export const ERROR_CODES = {
    // Authentication (1xxx)
    AUTH_FAILED: { code: 'AUTH_001', status: 401, message: 'Authentication failed' },
    INVALID_CREDENTIALS: { code: 'AUTH_002', status: 401, message: 'Invalid email or password' },
    EMAIL_EXISTS: { code: 'AUTH_003', status: 409, message: 'Email already registered' },
    USERNAME_EXISTS: { code: 'AUTH_004', status: 409, message: 'Username already taken' },
    TOKEN_EXPIRED: { code: 'AUTH_005', status: 401, message: 'Token expired' },
    
    // Room Management (2xxx)
    ROOM_NOT_FOUND: { code: 'ROOM_001', status: 404, message: 'Room not found' },
    NOT_MEMBER: { code: 'ROOM_002', status: 403, message: 'You are not a member of this room' },
    ROOM_CREATION_FAILED: { code: 'ROOM_003', status: 500, message: 'Failed to create room' },
    DM_ALREADY_EXISTS: { code: 'ROOM_004', status: 409, message: 'Direct message already exists' },
    CANNOT_DM_SELF: { code: 'ROOM_005', status: 400, message: 'Cannot create DM with yourself' },
    
    // User Management (3xxx)
    USER_NOT_FOUND: { code: 'USER_001', status: 404, message: 'User not found' },
    USER_BLOCKED: { code: 'USER_002', status: 403, message: 'User is blocked' },
    PRIVACY_VIOLATION: { code: 'USER_003', status: 403, message: 'Privacy settings do not allow this action' },
    
    // Messages (4xxx)
    MESSAGE_SEND_FAILED: { code: 'MSG_001', status: 500, message: 'Failed to send message' },
    MESSAGE_NOT_FOUND: { code: 'MSG_002', status: 404, message: 'Message not found' },
    INVALID_CONTENT: { code: 'MSG_003', status: 400, message: 'Invalid message content' },
    
    // Validation (5xxx)
    VALIDATION_ERROR: { code: 'VAL_001', status: 400, message: 'Validation error' },
    MISSING_FIELDS: { code: 'VAL_002', status: 400, message: 'Required fields missing' },
    INVALID_FORMAT: { code: 'VAL_003', status: 400, message: 'Invalid data format' },
    
    // Server (9xxx)
    INTERNAL_ERROR: { code: 'SRV_001', status: 500, message: 'Internal server error' },
    DATABASE_ERROR: { code: 'SRV_002', status: 500, message: 'Database error' },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    errorCode: ErrorCodeKey,
    details?: string
): APIResponse {
    const error = ERROR_CODES[errorCode];
    
    return {
        success: false,
        error: {
            code: error.code,
            message: error.message,
            details,
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T): APIResponse<T> {
    return {
        success: true,
        data
    };
}

/**
 * Global error handler middleware
 */
export async function errorHandler(err: Error, c: Context) {
    console.error('[ERROR]', {
        message: err.message,
        stack: err.stack,
        path: c.req.path,
        method: c.req.method
    });
    
    // Check if it's a known error type
    if (err.message.includes('UNIQUE constraint failed')) {
        if (err.message.includes('email')) {
            const response = createErrorResponse('EMAIL_EXISTS');
            return c.json(response, ERROR_CODES.EMAIL_EXISTS.status);
        }
        if (err.message.includes('username')) {
            const response = createErrorResponse('USERNAME_EXISTS');
            return c.json(response, ERROR_CODES.USERNAME_EXISTS.status);
        }
    }
    
    if (err.message.includes('FOREIGN KEY constraint failed')) {
        const response = createErrorResponse('VALIDATION_ERROR', 'Referenced entity does not exist');
        return c.json(response, ERROR_CODES.VALIDATION_ERROR.status);
    }
    
    // Default internal error
    const response = createErrorResponse('INTERNAL_ERROR', err.message);
    return c.json(response, ERROR_CODES.INTERNAL_ERROR.status);
}

/**
 * Validation helper
 */
export function validateRequired(fields: Record<string, any>, requiredFields: string[]): string | null {
    for (const field of requiredFields) {
        if (!fields[field]) {
            return `Missing required field: ${field}`;
        }
    }
    return null;
}

/**
 * Send error response
 */
export function sendError(c: Context, errorCode: ErrorCodeKey, details?: string) {
    const error = ERROR_CODES[errorCode];
    const response = createErrorResponse(errorCode, details);
    return c.json(response, error.status);
}

/**
 * Send success response
 */
export function sendSuccess<T>(c: Context, data: T, status: number = 200) {
    const response = createSuccessResponse(data);
    return c.json(response, status);
}

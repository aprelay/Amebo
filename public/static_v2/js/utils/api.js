// ============================================
// AMEBO v2.0 - API Client
// ============================================

import { CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './config.js';

class APIError extends Error {
    constructor(message, code, status, details) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE;
        this.userEmail = null;
    }
    
    setAuth(userEmail) {
        this.userEmail = userEmail;
        console.log('[API] Auth set:', userEmail);
    }
    
    clearAuth() {
        this.userEmail = null;
        console.log('[API] Auth cleared');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.userEmail) {
            headers['X-User-Email'] = this.userEmail;
        }
        
        try {
            console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
            
            const response = await fetch(url, {
                ...options,
                headers,
                signal: options.signal
            });
            
            const data = await response.json();
            
            if (!data.success) {
                const error = data.error || {};
                throw new APIError(
                    error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
                    error.code,
                    response.status,
                    error.details
                );
            }
            
            console.log(`[API] ✅ ${endpoint}`, data.data);
            return data.data;
            
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            
            console.error('[API] ❌ Error:', error);
            throw new APIError(
                ERROR_MESSAGES.NETWORK_ERROR,
                'NETWORK_ERROR',
                0,
                error.message
            );
        }
    }
    
    // Auth methods
    async register(email, username, password, displayName) {
        return this.request(API_ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify({
                email,
                username,
                password,
                display_name: displayName
            })
        });
    }
    
    async login(email, password) {
        return this.request(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
    
    async logout(userId) {
        return this.request(API_ENDPOINTS.LOGOUT, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId })
        });
    }
    
    // Room methods
    async createDirectMessage(senderId, recipientId) {
        return this.request(API_ENDPOINTS.CREATE_DM, {
            method: 'POST',
            body: JSON.stringify({
                sender_id: senderId,
                recipient_id: recipientId
            })
        });
    }
    
    async getUserRooms(userId) {
        return this.request(API_ENDPOINTS.GET_ROOMS(userId));
    }
    
    async leaveRoom(roomId, userId) {
        return this.request(API_ENDPOINTS.LEAVE_ROOM(roomId), {
            method: 'POST',
            body: JSON.stringify({ user_id: userId })
        });
    }
    
    async getRoomMembers(roomId) {
        return this.request(API_ENDPOINTS.GET_MEMBERS(roomId));
    }
    
    // Message methods
    async sendMessage(roomId, senderId, encryptedContent, iv, messageType = 'text') {
        return this.request(API_ENDPOINTS.SEND_MESSAGE, {
            method: 'POST',
            body: JSON.stringify({
                roomId,
                senderId,
                encryptedContent,
                iv,
                messageType
            })
        });
    }
    
    async getMessages(roomId, userId, limit = 50) {
        return this.request(
            `${API_ENDPOINTS.GET_MESSAGES(roomId)}?userId=${userId}&limit=${limit}`
        );
    }
    
    // User methods
    async searchUsers(query, currentUserId) {
        return this.request(
            `${API_ENDPOINTS.SEARCH_USERS}?q=${encodeURIComponent(query)}&userId=${currentUserId}`
        );
    }
    
    async getUser(userId) {
        return this.request(API_ENDPOINTS.GET_USER(userId));
    }
    
    async updatePrivacy(userId, settings) {
        return this.request(API_ENDPOINTS.UPDATE_PRIVACY(userId), {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }
    
    async updateOnlineStatus(userId, status) {
        return this.request(API_ENDPOINTS.UPDATE_ONLINE(userId), {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
    
    // Health check
    async healthCheck() {
        return this.request(API_ENDPOINTS.HEALTH);
    }
}

// Export singleton
export default new APIClient();

// ============================================
// AMEBO v2.0 - Messages Module
// ============================================

import api from '../utils/api.js';
import state from '../utils/state.js';
import crypto from '../utils/crypto.js';
import { UI } from '../utils/ui.js';
import { CONFIG } from '../config.js';

export class MessagesModule {
    constructor() {
        this.isInitialized = false;
        this.pollInterval = null;
        this.encryptionKeys = new Map(); // roomId -> key
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('[MESSAGES] Initializing...');
        this.isInitialized = true;
    }
    
    /**
     * Load messages for a room
     */
    async loadMessages(roomId) {
        try {
            if (!state.user) return [];
            
            console.log('[MESSAGES] Loading messages for:', roomId);
            
            const result = await api.getMessages(roomId, state.user.id, CONFIG.MESSAGES_PER_PAGE);
            const messages = result.messages || [];
            
            // Get room to get encryption key
            const room = state.rooms.find(r => r.id === roomId);
            if (!room) {
                console.error('[MESSAGES] Room not found:', roomId);
                return [];
            }
            
            // Get or generate encryption key
            let encryptionKey = this.encryptionKeys.get(roomId);
            if (!encryptionKey) {
                encryptionKey = await crypto.generateKey(room.room_code);
                this.encryptionKeys.set(roomId, encryptionKey);
            }
            
            // Decrypt messages
            const decryptedMessages = await Promise.all(
                messages.map(async (msg) => {
                    try {
                        const decrypted = await crypto.decrypt(
                            msg.encrypted_content,
                            msg.iv,
                            encryptionKey
                        );
                        return { ...msg, content: decrypted };
                    } catch (error) {
                        console.error('[MESSAGES] Decrypt error:', error);
                        return { ...msg, content: '[Encrypted message]' };
                    }
                })
            );
            
            state.setMessages(roomId, decryptedMessages);
            
            console.log('[MESSAGES] ✅ Loaded:', decryptedMessages.length, 'messages');
            
            return decryptedMessages;
            
        } catch (error) {
            console.error('[MESSAGES] ❌ Load error:', error);
            UI.showToast('Failed to load messages', 'error');
            return [];
        }
    }
    
    /**
     * Send message
     */
    async sendMessage(roomId, content, messageType = 'text') {
        try {
            if (!state.user || !content.trim()) return;
            
            console.log('[MESSAGES] Sending message to:', roomId);
            
            // Get room
            const room = state.rooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }
            
            // Get or generate encryption key
            let encryptionKey = this.encryptionKeys.get(roomId);
            if (!encryptionKey) {
                encryptionKey = await crypto.generateKey(room.room_code);
                this.encryptionKeys.set(roomId, encryptionKey);
            }
            
            // Encrypt message
            const { encrypted, iv } = await crypto.encrypt(content, encryptionKey);
            
            // Send to backend
            const result = await api.sendMessage(
                roomId,
                state.user.id,
                encrypted,
                iv,
                messageType
            );
            
            const message = result.message;
            
            // Add decrypted content
            message.content = content;
            
            // Add to state
            state.addMessage(roomId, message);
            
            console.log('[MESSAGES] ✅ Message sent:', message.id);
            
            return message;
            
        } catch (error) {
            console.error('[MESSAGES] ❌ Send error:', error);
            UI.showToast(error.message, 'error');
            throw error;
        }
    }
    
    /**
     * Poll for new messages
     */
    async pollMessages(roomId) {
        try {
            if (!state.currentRoom || state.currentRoom.id !== roomId) {
                return; // Stop polling if room changed
            }
            
            const currentMessages = state.messages.get(roomId) || [];
            const lastMessageId = currentMessages.length > 0 
                ? currentMessages[currentMessages.length - 1].id 
                : null;
            
            const newMessages = await this.loadMessages(roomId);
            
            // Check if there are new messages
            if (newMessages.length > currentMessages.length) {
                console.log('[MESSAGES] New messages detected:', newMessages.length - currentMessages.length);
            }
            
        } catch (error) {
            console.error('[MESSAGES] ❌ Poll error:', error);
        }
    }
    
    /**
     * Start polling for message updates
     */
    startPolling(roomId) {
        this.stopPolling();
        
        this.pollInterval = setInterval(() => {
            if (state.currentRoom?.id === roomId) {
                this.pollMessages(roomId);
            }
        }, CONFIG.POLL_MESSAGES);
        
        console.log('[MESSAGES] Polling started for:', roomId);
    }
    
    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('[MESSAGES] Polling stopped');
        }
    }
    
    /**
     * Format message for display
     */
    formatMessage(message) {
        const isMine = message.sender_id === state.user?.id;
        const timestamp = UI.formatTime(message.created_at);
        const fullTime = UI.formatFullTime(message.created_at);
        
        return {
            ...message,
            isMine,
            timestamp,
            fullTime
        };
    }
    
    /**
     * Clear encryption key for a room
     */
    clearKey(roomId) {
        this.encryptionKeys.delete(roomId);
    }
}

// Export singleton
export default new MessagesModule();

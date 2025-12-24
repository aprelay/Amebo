// ============================================
// AMEBO v2.0 - Rooms Module
// ============================================

import api from '../utils/api.js';
import state from '../utils/state.js';
import { UI } from '../utils/ui.js';
import { CONFIG } from '../config.js';

export class RoomsModule {
    constructor() {
        this.isInitialized = false;
        this.pollInterval = null;
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('[ROOMS] Initializing...');
        
        // Load rooms if user is logged in
        if (state.user) {
            this.loadRooms();
            this.startPolling();
        }
        
        this.isInitialized = true;
    }
    
    /**
     * Load user's rooms
     */
    async loadRooms() {
        try {
            if (!state.user) return;
            
            console.log('[ROOMS] Loading rooms...');
            
            const result = await api.getUserRooms(state.user.id);
            const rooms = result.rooms || [];
            
            state.setRooms(rooms);
            
            console.log('[ROOMS] ✅ Loaded:', rooms.length, 'rooms');
            
            return rooms;
            
        } catch (error) {
            console.error('[ROOMS] ❌ Load error:', error);
            UI.showToast('Failed to load rooms', 'error');
            throw error;
        }
    }
    
    /**
     * Create direct message room
     */
    async createDirectMessage(recipientId, recipientUsername) {
        try {
            if (!state.user) {
                throw new Error('Not logged in');
            }
            
            state.setLoading(true);
            
            console.log('[ROOMS] Creating DM with:', recipientUsername);
            
            const result = await api.createDirectMessage(state.user.id, recipientId);
            const room = result.room;
            
            // Add to state if new
            const existingRoom = state.rooms.find(r => r.id === room.id);
            if (!existingRoom) {
                state.addRoom(room);
            }
            
            console.log('[ROOMS] ✅ DM created:', room.id);
            
            return room;
            
        } catch (error) {
            console.error('[ROOMS] ❌ Create DM error:', error);
            UI.showToast(error.message, 'error');
            throw error;
            
        } finally {
            state.setLoading(false);
        }
    }
    
    /**
     * Open/select a room
     */
    async openRoom(room) {
        try {
            console.log('[ROOMS] Opening room:', room.id);
            
            // Set current room
            state.setCurrentRoom(room);
            
            // Clear unread count
            state.clearUnreadCount(room.id);
            
            console.log('[ROOMS] ✅ Room opened:', room.id);
            
        } catch (error) {
            console.error('[ROOMS] ❌ Open room error:', error);
            UI.showToast('Failed to open room', 'error');
        }
    }
    
    /**
     * Leave/delete room
     */
    async leaveRoom(roomId) {
        try {
            if (!state.user) return;
            
            const room = state.rooms.find(r => r.id === roomId);
            if (!room) return;
            
            // Confirm
            const roomName = room.room_type === 'direct' 
                ? (room.other_user?.display_name || room.other_user?.username || 'this chat')
                : room.room_name;
            
            const confirmed = await UI.confirm(
                `Are you sure you want to delete chat with ${roomName}?`,
                'Delete Chat'
            );
            
            if (!confirmed) return;
            
            state.setLoading(true);
            
            console.log('[ROOMS] Leaving room:', roomId);
            
            await api.leaveRoom(roomId, state.user.id);
            
            // Remove from state
            state.removeRoom(roomId);
            
            UI.showToast('Chat deleted', 'success');
            console.log('[ROOMS] ✅ Room left:', roomId);
            
        } catch (error) {
            console.error('[ROOMS] ❌ Leave room error:', error);
            UI.showToast(error.message, 'error');
            throw error;
            
        } finally {
            state.setLoading(false);
        }
    }
    
    /**
     * Get room members
     */
    async getRoomMembers(roomId) {
        try {
            const result = await api.getRoomMembers(roomId);
            return result.members || [];
            
        } catch (error) {
            console.error('[ROOMS] ❌ Get members error:', error);
            return [];
        }
    }
    
    /**
     * Start polling for room updates
     */
    startPolling() {
        if (this.pollInterval) return;
        
        this.pollInterval = setInterval(() => {
            if (state.user && state.view === 'rooms') {
                this.loadRooms();
            }
        }, CONFIG.POLL_ROOMS);
        
        console.log('[ROOMS] Polling started');
    }
    
    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('[ROOMS] Polling stopped');
        }
    }
    
    /**
     * Format room display name
     */
    getRoomDisplayName(room) {
        if (room.room_type === 'direct') {
            const otherUser = room.other_user;
            return otherUser?.display_name || otherUser?.username || 'Unknown User';
        }
        return room.room_name;
    }
    
    /**
     * Get room avatar
     */
    getRoomAvatar(room) {
        if (room.room_type === 'direct') {
            return room.other_user;
        }
        return { display_name: room.room_name, avatar: room.avatar };
    }
}

// Export singleton
export default new RoomsModule();

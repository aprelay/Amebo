// ============================================
// AMEBO v2.0 - State Management
// ============================================

import { CONFIG } from '../config.js';

class AppState {
    constructor() {
        // Core state
        this.user = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages = new Map(); // roomId -> messages[]
        this.unreadCounts = new Map(); // roomId -> count
        this.lastReadMessageIds = new Map(); // roomId -> messageId
        
        // UI state
        this.view = 'auth'; // auth, rooms, chat, settings
        this.isLoading = false;
        this.error = null;
        
        // Listeners
        this.listeners = new Set();
        
        // Load from storage
        this.loadFromStorage();
    }
    
    // State updates
    setState(updates) {
        Object.assign(this, updates);
        this.notifyListeners();
        this.saveToStorage();
    }
    
    // User management
    setUser(user) {
        this.user = user;
        this.view = 'rooms';
        this.notifyListeners();
        this.saveToStorage();
    }
    
    clearUser() {
        this.user = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages.clear();
        this.unreadCounts.clear();
        this.lastReadMessageIds.clear();
        this.view = 'auth';
        this.notifyListeners();
        this.clearStorage();
    }
    
    // Room management
    setRooms(rooms) {
        this.rooms = rooms;
        this.notifyListeners();
        this.saveToStorage();
    }
    
    addRoom(room) {
        this.rooms.unshift(room);
        this.notifyListeners();
        this.saveToStorage();
    }
    
    removeRoom(roomId) {
        this.rooms = this.rooms.filter(r => r.id !== roomId);
        if (this.currentRoom?.id === roomId) {
            this.currentRoom = null;
        }
        this.messages.delete(roomId);
        this.unreadCounts.delete(roomId);
        this.lastReadMessageIds.delete(roomId);
        this.notifyListeners();
        this.saveToStorage();
    }
    
    setCurrentRoom(room) {
        this.currentRoom = room;
        this.view = 'chat';
        
        // Clear unread count
        this.unreadCounts.set(room.id, 0);
        
        this.notifyListeners();
    }
    
    // Message management
    setMessages(roomId, messages) {
        this.messages.set(roomId, messages);
        
        // Update last read
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.lastReadMessageIds.set(roomId, lastMessage.id);
        }
        
        this.notifyListeners();
    }
    
    addMessage(roomId, message) {
        const messages = this.messages.get(roomId) || [];
        messages.push(message);
        this.messages.set(roomId, messages);
        
        // Update last read if viewing this room
        if (this.currentRoom?.id === roomId) {
            this.lastReadMessageIds.set(roomId, message.id);
            this.unreadCounts.set(roomId, 0);
        } else {
            // Increment unread count
            const count = this.unreadCounts.get(roomId) || 0;
            this.unreadCounts.set(roomId, count + 1);
        }
        
        this.notifyListeners();
    }
    
    // Unread management
    getUnreadCount(roomId) {
        return this.unreadCounts.get(roomId) || 0;
    }
    
    clearUnreadCount(roomId) {
        this.unreadCounts.set(roomId, 0);
        this.notifyListeners();
    }
    
    getTotalUnreadCount() {
        let total = 0;
        this.unreadCounts.forEach(count => {
            total += count;
        });
        return total;
    }
    
    // View management
    setView(view) {
        this.view = view;
        this.notifyListeners();
    }
    
    goToRooms() {
        this.currentRoom = null;
        this.view = 'rooms';
        this.notifyListeners();
    }
    
    // Loading & Error
    setLoading(isLoading) {
        this.isLoading = isLoading;
        this.notifyListeners();
    }
    
    setError(error) {
        this.error = error;
        this.notifyListeners();
        
        // Clear error after 5 seconds
        if (error) {
            setTimeout(() => {
                if (this.error === error) {
                    this.error = null;
                    this.notifyListeners();
                }
            }, 5000);
        }
    }
    
    // Listener management
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    notifyListeners() {
        this.listeners.forEach(fn => fn(this));
    }
    
    // Storage
    saveToStorage() {
        try {
            if (this.user) {
                localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(this.user));
            }
            
            if (this.rooms.length > 0) {
                localStorage.setItem(CONFIG.STORAGE_ROOMS, JSON.stringify(this.rooms));
            }
            
            // Save last read message IDs
            const lastReadObj = {};
            this.lastReadMessageIds.forEach((messageId, roomId) => {
                lastReadObj[roomId] = messageId;
            });
            localStorage.setItem(CONFIG.STORAGE_LAST_READ, JSON.stringify(lastReadObj));
            
        } catch (error) {
            console.error('[STATE] Save error:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const userStr = localStorage.getItem(CONFIG.STORAGE_USER);
            if (userStr) {
                this.user = JSON.parse(userStr);
                this.view = 'rooms';
            }
            
            const roomsStr = localStorage.getItem(CONFIG.STORAGE_ROOMS);
            if (roomsStr) {
                this.rooms = JSON.parse(roomsStr);
            }
            
            const lastReadStr = localStorage.getItem(CONFIG.STORAGE_LAST_READ);
            if (lastReadStr) {
                const lastReadObj = JSON.parse(lastReadStr);
                Object.entries(lastReadObj).forEach(([roomId, messageId]) => {
                    this.lastReadMessageIds.set(roomId, messageId);
                });
            }
            
        } catch (error) {
            console.error('[STATE] Load error:', error);
            this.clearStorage();
        }
    }
    
    clearStorage() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_USER);
            localStorage.removeItem(CONFIG.STORAGE_ROOMS);
            localStorage.removeItem(CONFIG.STORAGE_LAST_READ);
        } catch (error) {
            console.error('[STATE] Clear error:', error);
        }
    }
}

// Export singleton
export default new AppState();

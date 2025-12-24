// ============================================
// AMEBO v2.0 - Main Application
// ============================================

import state from './utils/state.js';
import auth from './modules/auth.js';
import rooms from './modules/rooms.js';
import messages from './modules/messages.js';
import { UI } from './utils/ui.js';

class App {
    constructor() {
        this.currentView = null;
    }
    
    /**
     * Initialize application
     */
    async init() {
        console.log('[APP] 🚀 Initializing Amebo v2.0...');
        
        // Initialize modules
        auth.init();
        rooms.init();
        messages.init();
        
        // Subscribe to state changes
        state.subscribe(() => this.render());
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
        
        console.log('[APP] ✅ Initialized');
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('[APP] App hidden - pausing updates');
                messages.stopPolling();
                rooms.stopPolling();
            } else {
                console.log('[APP] App visible - resuming updates');
                if (state.currentRoom) {
                    messages.startPolling(state.currentRoom.id);
                }
                if (state.user) {
                    rooms.startPolling();
                }
            }
        });
        
        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            if (state.user) {
                auth.updateOnlineStatus('offline');
            }
        });
    }
    
    /**
     * Main render function
     */
    render() {
        console.log('[APP] render() called - view:', state.view, 'user:', state.user?.username);
        
        const container = document.getElementById('app');
        if (!container) {
            console.error('[APP] ❌ #app container not found!');
            return;
        }
        
        // Determine view
        const view = state.view;
        
        // Only re-render if view changed
        if (this.currentView === view) {
            console.log('[APP] View unchanged, calling updateView()');
            this.updateView();
            return;
        }
        
        console.log('[APP] Rendering view:', view);
        this.currentView = view;
        
        // Render appropriate view
        switch (view) {
            case 'auth':
                this.renderAuthView(container);
                break;
            case 'rooms':
                this.renderRoomsView(container);
                break;
            case 'chat':
                this.renderChatView(container);
                break;
            default:
                container.innerHTML = '<p>Unknown view</p>';
        }
    }
    
    /**
     * Update current view without full re-render
     */
    updateView() {
        switch (state.view) {
            case 'rooms':
                this.updateRoomsList();
                break;
            case 'chat':
                this.updateChat();
                break;
        }
    }
    
    /**
     * Render authentication view
     */
    renderAuthView(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1>🚀 Amebo v2.0</h1>
                        <p>Clean, Bug-Free Messaging</p>
                    </div>
                    
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Login</button>
                        <button class="auth-tab" data-tab="register">Register</button>
                    </div>
                    
                    <div class="auth-forms">
                        <!-- Login Form -->
                        <form id="login-form" class="auth-form active">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" required placeholder="your@email.com">
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                Login
                            </button>
                        </form>
                        
                        <!-- Register Form -->
                        <form id="register-form" class="auth-form">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" required placeholder="your@email.com">
                            </div>
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" name="username" required placeholder="username">
                            </div>
                            <div class="form-group">
                                <label>Display Name</label>
                                <input type="text" name="displayName" placeholder="Your Name">
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                Register
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="auth-footer">
                    <small>v2.0.0 - Built for reliability</small>
                </div>
            </div>
        `;
        
        // Setup auth event listeners
        this.setupAuthListeners();
    }
    
    /**
     * Setup authentication event listeners
     */
    setupAuthListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update tabs
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update forms
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById(`${targetTab}-form`).classList.add('active');
            });
        });
        
        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                await auth.login(
                    formData.get('email'),
                    formData.get('password')
                );
            } catch (error) {
                // Error already handled by auth module
            }
        });
        
        // Register form
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                await auth.register(
                    formData.get('email'),
                    formData.get('username'),
                    formData.get('password'),
                    formData.get('displayName') || formData.get('username')
                );
            } catch (error) {
                // Error already handled by auth module
            }
        });
    }
    
    /**
     * Render rooms list view
     */
    renderRoomsView(container) {
        const totalUnread = state.getTotalUnreadCount();
        
        container.innerHTML = `
            <div class="rooms-container">
                <div class="rooms-header">
                    <h2>Chats ${totalUnread > 0 ? `<span class="badge">${totalUnread}</span>` : ''}</h2>
                    <button id="logout-btn" class="btn btn-secondary">Logout</button>
                </div>
                
                <div class="search-container">
                    <input type="text" id="search-users" placeholder="Search users..." class="search-input">
                    <div id="search-results" class="search-results"></div>
                </div>
                
                <div id="rooms-list" class="rooms-list">
                    ${this.renderRoomsList()}
                </div>
            </div>
        `;
        
        this.setupRoomsListeners();
    }
    
    /**
     * Render rooms list HTML
     */
    renderRoomsList() {
        if (state.rooms.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p>No chats yet</p>
                    <small>Search for users above to start chatting</small>
                </div>
            `;
        }
        
        return state.rooms.map(room => {
            const displayName = rooms.getRoomDisplayName(room);
            const avatarUser = rooms.getRoomAvatar(room);
            const avatar = UI.renderAvatar(avatarUser, 48);
            const unreadCount = state.getUnreadCount(room.id);
            
            return `
                <div class="room-item" data-room-id="${room.id}">
                    ${avatar}
                    <div class="room-info">
                        <div class="room-name">${UI.escapeHtml(displayName)}</div>
                        <div class="room-preview">Tap to open</div>
                    </div>
                    ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}
                    <button class="room-delete" data-room-id="${room.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Update rooms list
     */
    updateRoomsList() {
        const roomsList = document.getElementById('rooms-list');
        if (roomsList) {
            roomsList.innerHTML = this.renderRoomsList();
        }
    }
    
    /**
     * Setup rooms view event listeners
     */
    setupRoomsListeners() {
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            auth.logout();
        });
        
        // Open room
        document.querySelectorAll('.room-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('.room-delete')) return;
                
                const roomId = item.dataset.roomId;
                const room = state.rooms.find(r => r.id === roomId);
                if (room) {
                    await rooms.openRoom(room);
                    await messages.loadMessages(roomId);
                    messages.startPolling(roomId);
                }
            });
        });
        
        // Delete room
        document.querySelectorAll('.room-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const roomId = btn.dataset.roomId;
                await rooms.leaveRoom(roomId);
            });
        });
        
        // User search
        const searchInput = document.getElementById('search-users');
        const searchResults = document.getElementById('search-results');
        
        if (searchInput && searchResults) {
            const debouncedSearch = UI.debounce(async (query) => {
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    searchResults.classList.remove('show');
                    return;
                }
                
                try {
                    const result = await api.searchUsers(query, state.user.id);
                    const users = result.users || [];
                    
                    if (users.length === 0) {
                        searchResults.innerHTML = '<div class="search-empty">No users found</div>';
                    } else {
                        searchResults.innerHTML = users.map(user => `
                            <div class="search-result-item" data-user-id="${user.id}" 
                                 data-username="${user.username}">
                                ${UI.renderAvatar(user, 32)}
                                <div class="search-result-info">
                                    <div class="search-result-name">${UI.escapeHtml(user.display_name || user.username)}</div>
                                    <div class="search-result-username">@${UI.escapeHtml(user.username)}</div>
                                </div>
                            </div>
                        `).join('');
                    }
                    
                    searchResults.classList.add('show');
                    
                    // Setup click handlers
                    searchResults.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', async () => {
                            const userId = item.dataset.userId;
                            const username = item.dataset.username;
                            
                            try {
                                const room = await rooms.createDirectMessage(userId, username);
                                await rooms.openRoom(room);
                                await messages.loadMessages(room.id);
                                messages.startPolling(room.id);
                                
                                // Clear search
                                searchInput.value = '';
                                searchResults.innerHTML = '';
                                searchResults.classList.remove('show');
                            } catch (error) {
                                // Error already handled
                            }
                        });
                    });
                    
                } catch (error) {
                    searchResults.innerHTML = '<div class="search-empty">Search failed</div>';
                }
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
            
            // Close search results on outside click
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.remove('show');
                }
            });
        }
    }
    
    /**
     * Render chat view
     */
    renderChatView(container) {
        if (!state.currentRoom) {
            state.setView('rooms');
            return;
        }
        
        const room = state.currentRoom;
        const displayName = rooms.getRoomDisplayName(room);
        const roomMessages = state.messages.get(room.id) || [];
        
        container.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <button id="back-btn" class="btn-icon">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="chat-header-info">
                        <div class="chat-header-name">${UI.escapeHtml(displayName)}</div>
                        <div class="chat-header-status">Online</div>
                    </div>
                </div>
                
                <div id="messages-container" class="messages-container">
                    ${this.renderMessages(roomMessages)}
                </div>
                
                <div class="chat-input-container">
                    <textarea id="message-input" class="message-input" 
                              placeholder="Type a message..." rows="1"></textarea>
                    <button id="send-btn" class="btn-icon btn-primary">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.setupChatListeners();
        this.scrollToBottom();
    }
    
    /**
     * Render messages HTML
     */
    renderMessages(roomMessages) {
        if (roomMessages.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💬</div>
                    <p>No messages yet</p>
                    <small>Send a message to start the conversation</small>
                </div>
            `;
        }
        
        return roomMessages.map(msg => {
            const formatted = messages.formatMessage(msg);
            const cssClass = formatted.isMine ? 'message-mine' : 'message-theirs';
            
            return `
                <div class="message ${cssClass}" title="${formatted.fullTime}">
                    <div class="message-content">${UI.escapeHtml(formatted.content)}</div>
                    <div class="message-time">${formatted.timestamp}</div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Update chat messages
     */
    updateChat() {
        if (!state.currentRoom) return;
        
        const roomMessages = state.messages.get(state.currentRoom.id) || [];
        const messagesContainer = document.getElementById('messages-container');
        
        if (messagesContainer) {
            const wasAtBottom = this.isScrolledToBottom();
            messagesContainer.innerHTML = this.renderMessages(roomMessages);
            
            if (wasAtBottom) {
                this.scrollToBottom();
            }
        }
    }
    
    /**
     * Setup chat view event listeners
     */
    setupChatListeners() {
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            messages.stopPolling();
            state.goToRooms();
        });
        
        // Send message
        const sendBtn = document.getElementById('send-btn');
        const messageInput = document.getElementById('message-input');
        
        const sendMessage = async () => {
            const content = messageInput.value.trim();
            if (!content || !state.currentRoom) return;
            
            try {
                messageInput.value = '';
                messageInput.style.height = 'auto';
                
                await messages.sendMessage(state.currentRoom.id, content);
                this.scrollToBottom();
                
            } catch (error) {
                // Error already handled
                messageInput.value = content;
            }
        };
        
        sendBtn?.addEventListener('click', sendMessage);
        
        messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        messageInput?.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        });
    }
    
    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('messages-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 10);
    }
    
    /**
     * Check if scrolled to bottom
     */
    isScrolledToBottom() {
        const container = document.getElementById('messages-container');
        if (!container) return true;
        
        const threshold = 100;
        return container.scrollHeight - container.clientHeight - container.scrollTop < threshold;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}

export default App;

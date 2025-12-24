// ============================================
// AMEBO v2.0 - Configuration & Constants
// ============================================

export const CONFIG = {
    API_BASE: '/api/v2',
    APP_NAME: 'Amebo v2.0',
    VERSION: '2.0.0',
    
    // Polling intervals
    POLL_MESSAGES: 2000,      // 2 seconds
    POLL_ROOMS: 5000,         // 5 seconds
    POLL_ONLINE_STATUS: 10000, // 10 seconds
    
    // UI
    MAX_MESSAGE_LENGTH: 5000,
    MESSAGES_PER_PAGE: 50,
    SEARCH_DEBOUNCE: 300,
    
    // Storage keys
    STORAGE_USER: 'amebo_v2_user',
    STORAGE_ROOMS: 'amebo_v2_rooms',
    STORAGE_LAST_READ: 'amebo_v2_last_read'
};

export const API_ENDPOINTS = {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    
    // Rooms
    CREATE_DM: '/rooms/direct',
    GET_ROOMS: (userId) => `/rooms/user/${userId}`,
    LEAVE_ROOM: (roomId) => `/rooms/${roomId}/leave`,
    GET_MEMBERS: (roomId) => `/rooms/${roomId}/members`,
    
    // Messages
    SEND_MESSAGE: '/messages/send',
    GET_MESSAGES: (roomId) => `/messages/${roomId}`,
    
    // Users
    SEARCH_USERS: '/users/search',
    GET_USER: (userId) => `/users/${userId}`,
    UPDATE_PRIVACY: (userId) => `/users/${userId}/privacy`,
    UPDATE_ONLINE: (userId) => `/users/${userId}/online`,
    
    // Health
    HEALTH: '/health'
};

export const ERROR_MESSAGES = {
    // Network
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    
    // Auth
    AUTH_FAILED: 'Authentication failed. Please login again.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_EXISTS: 'Email already registered.',
    USERNAME_EXISTS: 'Username already taken.',
    
    // Rooms
    ROOM_NOT_FOUND: 'Room not found.',
    NOT_MEMBER: 'You are not a member of this room.',
    ROOM_CREATION_FAILED: 'Failed to create room.',
    
    // Messages
    MESSAGE_SEND_FAILED: 'Failed to send message.',
    MESSAGE_LOAD_FAILED: 'Failed to load messages.',
    
    // General
    UNKNOWN_ERROR: 'An unexpected error occurred.'
};

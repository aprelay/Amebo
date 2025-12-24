// ============================================
// AMEBO v2.0 - TypeScript Type Definitions
// ============================================

export interface User {
    id: string;
    email: string;
    username: string;
    password_hash: string;
    display_name: string | null;
    avatar: string | null;
    online_status: 'online' | 'offline' | 'away';
    last_seen: string | null;
    is_searchable: number;
    message_privacy: 'anyone' | 'contacts_only' | 'nobody';
    last_seen_privacy: 'everyone' | 'contacts_only' | 'nobody';
    tokens: number;
    token_tier: string;
    total_earned: number;
    created_at: string;
    updated_at: string;
}

export interface ChatRoom {
    id: string;
    room_code: string;
    room_name: string;
    room_type: 'direct' | 'group';
    created_by: string;
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

export interface RoomMember {
    room_id: string;
    user_id: string;
    role: 'member' | 'admin' | 'owner';
    joined_at: string;
}

export interface DirectMessageRoom {
    room_id: string;
    user1_id: string;
    user2_id: string;
    created_at: string;
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    encrypted_content: string;
    iv: string;
    message_type: 'text' | 'file' | 'voice' | 'image';
    created_at: string;
}

export interface UserContact {
    user_id: string;
    contact_user_id: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    updated_at: string;
}

export interface BlockedUser {
    user_id: string;
    blocked_user_id: string;
    reason: string | null;
    created_at: string;
}

export interface TypingStatus {
    room_id: string;
    user_id: string;
    started_at: string;
}

export interface ReadReceipt {
    message_id: string;
    user_id: string;
    read_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string | null;
    data: string | null;
    read: number;
    created_at: string;
}

export interface Attachment {
    id: string;
    message_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    view_once: number;
    viewed: number;
    created_at: string;
}

// API Response Types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: APIError;
}

export interface APIError {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
}

// Request Types
export interface CreateDirectMessageRequest {
    recipient_id: string;
}

export interface SendMessageRequest {
    roomId: string;
    senderId: string;
    encryptedContent: string;
    iv: string;
    messageType?: 'text' | 'file' | 'voice' | 'image';
}

export interface UpdatePrivacyRequest {
    is_searchable?: boolean;
    message_privacy?: 'anyone' | 'contacts_only' | 'nobody';
    last_seen_privacy?: 'everyone' | 'contacts_only' | 'nobody';
}

// Response Types with computed fields
export interface RoomWithDetails extends ChatRoom {
    member_count?: number;
    other_user?: Partial<User>;
    last_message_at?: string;
    last_message_preview?: string;
}

export interface MessageWithSender extends Message {
    sender?: Partial<User>;
}

// Hono Context Bindings
export interface Env {
    DB: D1Database;
    RESEND_API_KEY?: string;
    FROM_EMAIL?: string;
    APP_URL?: string;
}

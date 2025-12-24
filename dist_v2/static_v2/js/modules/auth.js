// ============================================
// AMEBO v2.0 - Authentication Module
// ============================================

import api from '../utils/api.js';
import state from '../utils/state.js';
import crypto from '../utils/crypto.js';
import { UI } from '../utils/ui.js';

export class AuthModule {
    constructor() {
        this.isInitialized = false;
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('[AUTH] Initializing...');
        
        // Check if user is already logged in
        if (state.user) {
            console.log('[AUTH] User already logged in:', state.user.email);
            api.setAuth(state.user.email);
            this.updateOnlineStatus('online');
        }
        
        this.isInitialized = true;
    }
    
    /**
     * Register new user
     */
    async register(email, username, password, displayName) {
        try {
            state.setLoading(true);
            
            console.log('[AUTH] Registering:', email, username);
            
            const result = await api.register(email, username, password, displayName);
            const user = result.user;
            
            // Set auth
            api.setAuth(user.email);
            state.setUser(user);
            
            // Update online status
            await this.updateOnlineStatus('online');
            
            UI.showToast('Registration successful!', 'success');
            console.log('[AUTH] ✅ Registered:', user);
            
            return user;
            
        } catch (error) {
            console.error('[AUTH] ❌ Registration error:', error);
            state.setError(error.message);
            UI.showToast(error.message, 'error');
            throw error;
            
        } finally {
            state.setLoading(false);
        }
    }
    
    /**
     * Login user
     */
    async login(email, password) {
        try {
            state.setLoading(true);
            
            console.log('[AUTH] Logging in:', email);
            
            const result = await api.login(email, password);
            const user = result.user;
            
            // Set auth
            api.setAuth(user.email);
            state.setUser(user);
            
            // Update online status
            await this.updateOnlineStatus('online');
            
            UI.showToast('Login successful!', 'success');
            console.log('[AUTH] ✅ Logged in:', user);
            
            return user;
            
        } catch (error) {
            console.error('[AUTH] ❌ Login error:', error);
            state.setError(error.message);
            UI.showToast(error.message, 'error');
            throw error;
            
        } finally {
            state.setLoading(false);
        }
    }
    
    /**
     * Logout user
     */
    async logout() {
        try {
            if (!state.user) return;
            
            console.log('[AUTH] Logging out:', state.user.email);
            
            // Update online status to offline
            await this.updateOnlineStatus('offline');
            
            // Logout on backend
            await api.logout(state.user.id);
            
            // Clear local state
            api.clearAuth();
            state.clearUser();
            
            UI.showToast('Logged out successfully', 'success');
            console.log('[AUTH] ✅ Logged out');
            
        } catch (error) {
            console.error('[AUTH] ❌ Logout error:', error);
            // Clear anyway
            api.clearAuth();
            state.clearUser();
        }
    }
    
    /**
     * Update online status
     */
    async updateOnlineStatus(status) {
        try {
            if (!state.user) return;
            
            await api.updateOnlineStatus(state.user.id, status);
            console.log('[AUTH] ✅ Online status:', status);
            
        } catch (error) {
            console.error('[AUTH] ❌ Update status error:', error);
        }
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!state.user;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return state.user;
    }
}

// Export singleton
export default new AuthModule();

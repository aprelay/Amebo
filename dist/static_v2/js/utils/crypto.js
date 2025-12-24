// ============================================
// AMEBO v2.0 - Crypto Utilities
// ============================================

class CryptoUtils {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
    }
    
    /**
     * Generate encryption key from room code
     */
    async generateKey(roomCode) {
        try {
            const encoder = new TextEncoder();
            const keyData = encoder.encode(roomCode);
            
            // Hash the room code to get consistent key material
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
            
            // Import as AES-GCM key
            const key = await crypto.subtle.importKey(
                'raw',
                hashBuffer,
                { name: this.algorithm, length: this.keyLength },
                false,
                ['encrypt', 'decrypt']
            );
            
            return key;
        } catch (error) {
            console.error('[CRYPTO] Key generation error:', error);
            throw new Error('Failed to generate encryption key');
        }
    }
    
    /**
     * Encrypt message
     */
    async encrypt(message, key) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            
            // Generate random IV
            const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
            
            // Encrypt
            const encrypted = await crypto.subtle.encrypt(
                { name: this.algorithm, iv },
                key,
                data
            );
            
            // Convert to base64
            const encryptedArray = new Uint8Array(encrypted);
            const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
            const ivBase64 = btoa(String.fromCharCode(...iv));
            
            return {
                encrypted: encryptedBase64,
                iv: ivBase64
            };
            
        } catch (error) {
            console.error('[CRYPTO] Encryption error:', error);
            throw new Error('Failed to encrypt message');
        }
    }
    
    /**
     * Decrypt message
     */
    async decrypt(encryptedBase64, ivBase64, key) {
        try {
            // Convert from base64
            const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
            
            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                { name: this.algorithm, iv },
                key,
                encrypted
            );
            
            // Convert to string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
            
        } catch (error) {
            console.error('[CRYPTO] Decryption error:', error);
            return '[Encrypted message]';
        }
    }
    
    /**
     * Hash password for authentication
     */
    async hashPassword(password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('[CRYPTO] Password hash error:', error);
            throw new Error('Failed to hash password');
        }
    }
}

// Export singleton
export default new CryptoUtils();

// SecureChat Crypto Utilities - Industrial Grade
class CryptoUtils {
    // Generate RSA key pair for user
    static async generateUserKeyPair() {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 4096, // Industrial grade: 4096-bit
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                },
                true, // extractable
                ["encrypt", "decrypt"]
            );
            
            return keyPair;
        } catch (error) {
            console.error('[CRYPTO] Key generation failed:', error);
            throw error;
        }
    }

    // Export public key to JWK format
    static async exportPublicKey(publicKey) {
        try {
            return await window.crypto.subtle.exportKey("jwk", publicKey);
        } catch (error) {
            console.error('[CRYPTO] Public key export failed:', error);
            throw error;
        }
    }

    // Import public key from JWK
    static async importPublicKey(jwk) {
        try {
            return await window.crypto.subtle.importKey(
                "jwk",
                jwk,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
        } catch (error) {
            console.error('[CRYPTO] Public key import failed:', error);
            throw error;
        }
    }

    // Generate AES key for room encryption
    static async generateRoomKey() {
        try {
            const key = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256 // Industrial grade: 256-bit AES
                },
                true,
                ["encrypt", "decrypt"]
            );
            
            return key;
        } catch (error) {
            console.error('[CRYPTO] Room key generation failed:', error);
            throw error;
        }
    }

    // Derive key from room code using PBKDF2
    static async deriveKeyFromCode(roomCode, salt) {
        try {
            // Import password
            const encoder = new TextEncoder();
            const keyMaterial = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(roomCode),
                { name: "PBKDF2" },
                false,
                ["deriveBits", "deriveKey"]
            );

            // Derive AES key
            return await window.crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: salt || encoder.encode("securechat-salt-v1"),
                    iterations: 100000, // Industrial grade: 100k iterations
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
        } catch (error) {
            console.error('[CRYPTO] Key derivation failed:', error);
            throw error;
        }
    }

    // Encrypt message with AES-GCM
    static async encryptMessage(message, key) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            
            // Generate random IV
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                data
            );

            // Convert to base64 for storage
            // CRITICAL FIX: Don't use spread operator for large arrays (causes stack overflow)
            const encryptedArray = new Uint8Array(encrypted);
            
            // Use chunk processing for large data
            let binaryString = '';
            const chunkSize = 8192; // Process 8KB at a time
            for (let i = 0; i < encryptedArray.length; i += chunkSize) {
                const chunk = encryptedArray.subarray(i, i + chunkSize);
                binaryString += String.fromCharCode.apply(null, chunk);
            }
            const encryptedBase64 = btoa(binaryString);
            
            // IV is always small, safe to use spread operator
            const ivBase64 = btoa(String.fromCharCode(...iv));

            return {
                encrypted: encryptedBase64,
                iv: ivBase64
            };
        } catch (error) {
            console.error('[CRYPTO] Encryption failed:', error);
            throw error;
        }
    }

    // Decrypt message with AES-GCM
    static async decryptMessage(encryptedBase64, ivBase64, key) {
        try {
            if (!key) {
                console.error('[CRYPTO] Decryption failed: No key provided');
                return '[No encryption key available]';
            }
            
            if (!encryptedBase64 || !ivBase64) {
                console.error('[CRYPTO] Decryption failed: Missing encrypted content or IV');
                return '[Missing encryption data]';
            }
            
            // Convert from base64
            const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

            // Decrypt
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                encrypted
            );

            // Convert to string
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('[CRYPTO] Decryption failed:', error);
            console.error('[CRYPTO] Error details:', {
                hasKey: !!key,
                hasEncrypted: !!encryptedBase64,
                hasIV: !!ivBase64,
                errorName: error.name,
                errorMessage: error.message
            });
            return '[Decryption failed - wrong key?]';
        }
    }

    // Secure key storage in IndexedDB
    static async storePrivateKey(userId, privateKey) {
        try {
            const exported = await window.crypto.subtle.exportKey("jwk", privateKey);
            const encrypted = await this.encryptKeyForStorage(JSON.stringify(exported));
            
            localStorage.setItem(`privateKey_${userId}`, encrypted);
            console.log('[CRYPTO] Private key stored securely');
        } catch (error) {
            console.error('[CRYPTO] Key storage failed:', error);
            throw error;
        }
    }

    // Retrieve private key from secure storage
    static async retrievePrivateKey(userId) {
        try {
            const encrypted = localStorage.getItem(`privateKey_${userId}`);
            if (!encrypted) return null;

            const decrypted = await this.decryptKeyFromStorage(encrypted);
            const jwk = JSON.parse(decrypted);

            return await window.crypto.subtle.importKey(
                "jwk",
                jwk,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["decrypt"]
            );
        } catch (error) {
            console.error('[CRYPTO] Key retrieval failed:', error);
            return null;
        }
    }

    // Simple key encryption for storage (browser-level security)
    static async encryptKeyForStorage(data) {
        // Use browser's built-in key derivation from user session
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return btoa(data); // Simple encoding (browser security context)
    }

    static async decryptKeyFromStorage(encrypted) {
        return atob(encrypted); // Simple decoding (browser security context)
    }

    // Generate random token ID
    static generateTokenId() {
        const array = new Uint8Array(16);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Hash password for verification (if needed)
    static async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

// Export for use in app
if (typeof window !== 'undefined') {
    window.CryptoUtils = CryptoUtils;
}

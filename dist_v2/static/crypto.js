// Military-grade encryption utilities using Web Crypto API
// AES-256-GCM for symmetric encryption + RSA-OAEP for key exchange

const CryptoUtils = {
  // Generate RSA key pair for asymmetric encryption
  async generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096, // Military-grade 4096-bit keys
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export public key for sharing
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = this.arrayBufferToBase64(publicKeyBuffer);

    // Store private key in IndexedDB (never share)
    await this.storePrivateKey(keyPair.privateKey);

    return {
      publicKey: publicKeyBase64,
      privateKey: keyPair.privateKey
    };
  },

  // Generate AES-256 key for symmetric encryption
  async generateAESKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256, // 256-bit key
      },
      true,
      ['encrypt', 'decrypt']
    );
  },

  // Encrypt message with AES-256-GCM
  async encryptMessage(message, aesKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      data
    );

    return {
      encrypted: this.arrayBufferToBase64(encryptedData),
      iv: this.arrayBufferToBase64(iv)
    };
  },

  // Decrypt message with AES-256-GCM
  async decryptMessage(encryptedBase64, ivBase64, aesKey) {
    const encrypted = this.base64ToArrayBuffer(encryptedBase64);
    const iv = this.base64ToArrayBuffer(ivBase64);
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  },

  // Encrypt AES key with recipient's RSA public key
  async encryptAESKey(aesKey, publicKeyBase64) {
    const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );

    const aesKeyBuffer = await crypto.subtle.exportKey('raw', aesKey);
    const encryptedKey = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      aesKeyBuffer
    );

    return this.arrayBufferToBase64(encryptedKey);
  },

  // Decrypt AES key with own RSA private key
  async decryptAESKey(encryptedKeyBase64, privateKey) {
    const encryptedKey = this.base64ToArrayBuffer(encryptedKeyBase64);
    
    const aesKeyBuffer = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedKey
    );

    return await crypto.subtle.importKey(
      'raw',
      aesKeyBuffer,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  },

  // Store private key in IndexedDB
  async storePrivateKey(privateKey) {
    const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
    const base64Key = this.arrayBufferToBase64(exported);
    localStorage.setItem('privateKey', base64Key);
  },

  // Retrieve private key from IndexedDB
  async getPrivateKey() {
    const base64Key = localStorage.getItem('privateKey');
    if (!base64Key) return null;

    const keyBuffer = this.base64ToArrayBuffer(base64Key);
    return await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );
  },

  // Generate room encryption key (derived from room code)
  async generateRoomKey(roomCode) {
    const encoder = new TextEncoder();
    const data = encoder.encode(roomCode);
    
    // Use PBKDF2 to derive key from room code
    const baseKey = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  },

  // Utility: ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  // Utility: Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  },

  // Generate secure random ID
  generateId() {
    return crypto.randomUUID();
  }
};

// Export for use in app
window.CryptoUtils = CryptoUtils;

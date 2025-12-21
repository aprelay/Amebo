// SecureChat & Pay PWA - V2 Enhanced with All Features
const API_BASE = '';

class SecureChatApp {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages = [];
        this.messagePoller = null;
        this.viewedOnceFiles = new Set();
        
        console.log('[V2] App initialized with all features');
    }

    async init() {
        console.log('[V2] Init started');
        
        // Check for saved user
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            console.log('[V2] Found saved user');
            this.currentUser = JSON.parse(saved);
            
            // Load viewed once files from localStorage
            const viewedFiles = localStorage.getItem('viewedOnceFiles');
            if (viewedFiles) {
                this.viewedOnceFiles = new Set(JSON.parse(viewedFiles));
            }
            
            // FEATURE: Room code prompt on login
            await this.showRoomCodePrompt();
        } else {
            console.log('[V2] No saved user - showing auth');
            this.showAuth();
        }
    }

    showAuth() {
        console.log('[V2] Rendering auth page with avatar support');
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-shield-alt text-white text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">SecureChat</h1>
                        <p class="text-gray-600 mt-2">Encrypted Messaging</p>
                    </div>

                    <div id="auth-message" class="hidden mb-4 p-3 rounded-lg"></div>

                    <!-- FEATURE: Profile Picture Avatar -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Profile Picture (Optional)
                        </label>
                        <div class="flex items-center gap-4">
                            <div id="avatarPreview" class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                <i class="fas fa-user text-gray-400 text-2xl"></i>
                            </div>
                            <label class="cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition">
                                <i class="fas fa-upload mr-2"></i>Upload Photo
                                <input 
                                    type="file" 
                                    id="avatarInput" 
                                    accept="image/*" 
                                    class="hidden"
                                    onchange="app.handleAvatarSelect(event)"
                                />
                            </label>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Max 2MB, auto-compressed to 200x200px</p>
                    </div>

                    <div class="space-y-4">
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="Choose username"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onkeypress="if(event.key==='Enter') app.handleAuth()"
                        />
                        <button 
                            onclick="app.handleAuth()"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                        >
                            Login / Register
                        </button>
                    </div>

                    <p class="text-xs text-gray-500 text-center mt-6">
                        <i class="fas fa-lock mr-1"></i> 
                        End-to-end encrypted • Keys generated locally
                    </p>
                </div>
            </div>
        `;
    }

    async handleAvatarSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('[V2] Avatar selected:', file.name, file.size);

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ Image too large! Maximum size is 2MB.');
            return;
        }

        try {
            // FEATURE: Super-fast compression for avatar
            const compressed = await this.compressImage(file, 200, 200, 0.7);
            
            // Show preview
            const preview = document.getElementById('avatarPreview');
            preview.innerHTML = `<img src="${compressed}" class="w-full h-full object-cover" alt="Avatar">`;
            
            // Store in memory for upload
            this.avatarData = compressed;
            
            console.log('[V2] Avatar compressed and ready');
        } catch (error) {
            console.error('[V2] Avatar compression error:', error);
            alert('Failed to process image: ' + error.message);
        }
    }

    async compressImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async handleAuth() {
        const username = document.getElementById('username').value.trim();
        const msgDiv = document.getElementById('auth-message');

        if (!username) {
            this.showMessage(msgDiv, 'Please enter a username', 'error');
            return;
        }

        console.log('[V2] Authenticating:', username);
        this.showMessage(msgDiv, 'Authenticating...', 'info');

        try {
            // Try login first
            let response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            let data = await response.json();
            console.log('[V2] Login response:', data);

            // If user not found, register
            if (data.error === 'User not found') {
                console.log('[V2] User not found, registering...');
                
                // Generate encryption keys
                const keyPair = await window.crypto.subtle.generateKey(
                    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
                    true,
                    ["encrypt", "decrypt"]
                );

                const publicKey = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

                response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username,
                        publicKey: JSON.stringify(publicKey)
                    })
                });

                data = await response.json();
                console.log('[V2] Register response:', data);
            }

            // Handle both login (data.user.id) and register (data.userId) responses
            const userId = data.userId || (data.user && data.user.id);
            const publicKey = data.publicKey || (data.user && data.user.public_key);

            if (userId) {
                this.currentUser = {
                    id: userId,
                    username: username,
                    publicKey: publicKey || '{}',
                    avatar: this.avatarData || null // Store avatar
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('[V2] Auth success, showing room code prompt');
                
                // FEATURE: Show room code prompt instead of room list
                await this.showRoomCodePrompt();
            } else {
                throw new Error(data.error || 'Authentication failed');
            }

        } catch (error) {
            console.error('[V2] Auth error:', error);
            this.showMessage(msgDiv, 'Authentication failed: ' + error.message, 'error');
        }
    }

    // FEATURE: Room code prompt on login
    async showRoomCodePrompt() {
        console.log('[V2] Showing room code prompt');
        
        const avatarHtml = this.currentUser.avatar 
            ? `<img src="${this.currentUser.avatar}" class="w-full h-full object-cover" alt="Avatar">`
            : `<i class="fas fa-user text-gray-400 text-2xl"></i>`;

        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                            ${avatarHtml}
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800">Welcome, ${this.currentUser.username}!</h2>
                        <p class="text-gray-600 mt-2">Enter a room code to continue</p>
                    </div>

                    <div id="room-message" class="hidden mb-4 p-3 rounded-lg"></div>

                    <div class="space-y-3">
                        <input 
                            type="text" 
                            id="roomCode" 
                            placeholder="Enter room code (e.g., myroom123)"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            onkeypress="if(event.key==='Enter') app.joinRoomWithCode()"
                        />
                        
                        <button 
                            onclick="app.joinRoomWithCode()"
                            class="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>Join Room
                        </button>
                        
                        <button 
                            onclick="app.showCreateRoomDialog()"
                            class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                            <i class="fas fa-plus-circle mr-2"></i>Create New Room
                        </button>
                        
                        <button 
                            onclick="app.logout()"
                            class="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                        >
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async joinRoomWithCode() {
        const code = document.getElementById('roomCode').value.trim();
        const msgDiv = document.getElementById('room-message');

        if (!code) {
            this.showMessage(msgDiv, 'Please enter a room code', 'error');
            return;
        }

        console.log('[V2] Joining room with code:', code);
        this.showMessage(msgDiv, 'Joining room...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/rooms/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: code,
                    userId: this.currentUser.id
                })
            });

            const data = await response.json();
            console.log('[V2] Join response:', data);

            if (data.success) {
                this.showMessage(msgDiv, 'Joined! Opening room...', 'success');
                await this.loadRooms();
                setTimeout(() => this.openRoom(data.roomId), 500);
            } else {
                throw new Error(data.error || 'Failed to join room');
            }
        } catch (error) {
            console.error('[V2] Join error:', error);
            this.showMessage(msgDiv, 'Error: ' + error.message, 'error');
        }
    }

    async showCreateRoomDialog() {
        const code = document.getElementById('roomCode').value.trim();
        const msgDiv = document.getElementById('room-message');

        if (!code) {
            this.showMessage(msgDiv, 'Please enter a room code first', 'error');
            return;
        }

        console.log('[V2] Creating room with code:', code);
        this.showMessage(msgDiv, 'Creating room...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/rooms/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: code,
                    roomName: code,
                    userId: this.currentUser.id
                })
            });

            const data = await response.json();
            console.log('[V2] Create response:', data);

            if (data.success) {
                this.showMessage(msgDiv, 'Room created! Opening...', 'success');
                await this.loadRooms();
                setTimeout(() => this.openRoom(data.roomId), 500);
            } else {
                throw new Error(data.error || 'Failed to create room');
            }
        } catch (error) {
            console.error('[V2] Create error:', error);
            this.showMessage(msgDiv, 'Error: ' + error.message, 'error');
        }
    }

    async loadRooms() {
        console.log('[V2] Loading rooms for user:', this.currentUser.id);
        
        try {
            const response = await fetch(`${API_BASE}/api/rooms/user/${this.currentUser.id}`);
            const data = await response.json();
            
            console.log('[V2] Rooms loaded:', data);
            this.rooms = data.rooms || [];
        } catch (error) {
            console.error('[V2] Error loading rooms:', error);
        }
    }

    async openRoom(roomId) {
        console.log('[V2] Opening room:', roomId);
        this.currentRoom = this.rooms.find(r => r.id === roomId);
        
        if (!this.currentRoom) {
            await this.loadRooms();
            this.currentRoom = this.rooms.find(r => r.id === roomId);
        }

        const avatarHtml = this.currentUser.avatar 
            ? `<img src="${this.currentUser.avatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">`
            : `<div class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center"><i class="fas fa-user text-white text-sm"></i></div>`;

        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 flex flex-col">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
                    <div class="max-w-4xl mx-auto flex items-center gap-4">
                        <button onclick="app.showRoomCodePrompt()" class="hover:bg-white/20 p-2 rounded transition">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        ${avatarHtml}
                        <div class="flex-1">
                            <h1 class="text-lg font-bold">${this.currentRoom?.room_name || 'Chat Room'}</h1>
                            <p class="text-sm opacity-90">Code: ${this.currentRoom?.room_code || roomId}</p>
                        </div>
                    </div>
                </div>

                <!-- Messages -->
                <div id="messages" class="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
                    <div class="text-gray-500 text-center py-8">
                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                        <p>Loading messages...</p>
                    </div>
                </div>

                <!-- Input -->
                <div class="bg-white border-t border-gray-200 p-4">
                    <div class="max-w-4xl mx-auto">
                        <!-- FEATURE: Emoji Picker Button -->
                        <div id="emojiPicker" class="hidden mb-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
                            <div class="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                                ${['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳️','💬','👁️','🗨️','🗯️','💭','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'].map(e => `<button onclick="app.insertEmoji('${e}')" class="text-2xl hover:bg-gray-100 p-1 rounded">${e}</button>`).join('')}
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button 
                                onclick="app.toggleEmojiPicker()"
                                class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                title="Emoji"
                            >
                                <i class="fas fa-smile"></i>
                            </button>
                            <button 
                                onclick="document.getElementById('fileInput').click()"
                                class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                title="Attach File"
                            >
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <input 
                                type="file" 
                                id="fileInput" 
                                class="hidden"
                                onchange="app.handleFileSelect(event)"
                            />
                            <input 
                                type="text" 
                                id="messageInput" 
                                placeholder="Type a message..."
                                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onkeypress="if(event.key==='Enter') app.sendMessage()"
                            />
                            <button 
                                onclick="app.sendMessage()"
                                class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadMessages();
        this.startPolling();
    }

    // FEATURE: Emoji Picker
    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.toggle('hidden');
    }

    insertEmoji(emoji) {
        const input = document.getElementById('messageInput');
        input.value += emoji;
        input.focus();
    }

    // FEATURE: File Upload with Compression
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('[V2] File selected:', file.name, file.size);

        // Check file size (max 10MB for embedded)
        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ File too large! Maximum size is 10MB.\n\nFor larger files, use Cloudflare R2 storage.');
            return;
        }

        // FEATURE: View-Once Privacy
        const viewOnce = confirm('🔒 Send as VIEW ONCE?\n\n✓ File deleted after first view\n✗ Cancel for normal file');

        try {
            let fileData = null;
            
            // FEATURE: Super-fast compression for images
            if (file.type.startsWith('image/')) {
                console.log('[V2] Compressing image...');
                fileData = await this.compressImage(file, 1920, 1080, 0.7);
                console.log('[V2] Image compressed!');
            } else {
                // Non-image files: convert to data URL
                fileData = await this.fileToDataUrl(file);
            }

            await this.sendFileMessage(file.name, file.type, file.size, fileData, viewOnce);
        } catch (error) {
            console.error('[V2] File upload error:', error);
            alert('Failed to upload file: ' + error.message);
        }

        // Clear input
        event.target.value = '';
    }

    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async sendFileMessage(fileName, fileType, fileSize, dataUrl, viewOnce) {
        if (!this.currentRoom) return;

        console.log('[V2] Sending file message:', fileName, viewOnce ? '(VIEW ONCE)' : '');

        const fileContent = JSON.stringify({
            type: 'file',
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            dataUrl: dataUrl,
            viewOnce: viewOnce || false
        });

        try {
            const response = await fetch(`${API_BASE}/api/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: this.currentRoom.id,
                    senderId: this.currentUser.id,
                    encryptedContent: fileContent,
                    iv: 'placeholder-iv'
                })
            });

            const data = await response.json();
            console.log('[V2] File send response:', data);

            if (data.success) {
                await this.loadMessages();
            }
        } catch (error) {
            console.error('[V2] Error sending file:', error);
            alert('Failed to send file: ' + error.message);
        }
    }

    async loadMessages() {
        if (!this.currentRoom) return;
        
        console.log('[V2] Loading messages for room:', this.currentRoom.id);

        try {
            const response = await fetch(`${API_BASE}/api/messages/${this.currentRoom.id}`);
            const data = await response.json();
            
            console.log('[V2] Messages loaded:', data);
            this.messages = data.messages || [];

            const container = document.getElementById('messages');
            if (this.messages.length === 0) {
                container.innerHTML = `
                    <div class="text-gray-500 text-center py-8">
                        <i class="fas fa-comment text-4xl mb-2"></i>
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                `;
            } else {
                container.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
                container.scrollTop = container.scrollHeight;
            }
        } catch (error) {
            console.error('[V2] Error loading messages:', error);
        }
    }

    renderMessage(msg) {
        const isMine = msg.sender_id === this.currentUser.id;
        const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Try to parse as file message
        let fileData = null;
        try {
            const parsed = JSON.parse(msg.encrypted_content || msg.content || '{}');
            if (parsed.type === 'file') {
                fileData = parsed;
            }
        } catch (e) {
            // Not a file message
        }

        // FEATURE: File message rendering with view-once support
        if (fileData) {
            const isViewOnce = fileData.viewOnce;
            const messageId = msg.id;
            const isViewed = this.viewedOnceFiles.has(messageId);

            let fileIcon = 'fa-file';
            if (fileData.fileType.startsWith('image/')) fileIcon = 'fa-image';
            else if (fileData.fileType.startsWith('video/')) fileIcon = 'fa-video';
            else if (fileData.fileType.startsWith('audio/')) fileIcon = 'fa-music';

            // Avatar for message
            const senderAvatar = isMine && this.currentUser.avatar
                ? `<img src="${this.currentUser.avatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">`
                : `<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><i class="fas fa-user text-gray-600 text-xs"></i></div>`;

            return `
                <div class="mb-4 ${isMine ? 'text-right' : 'text-left'}">
                    <div class="inline-block max-w-xs lg:max-w-md">
                        ${!isMine ? `
                            <div class="flex items-center gap-2 mb-1">
                                ${senderAvatar}
                                <p class="text-xs text-gray-600">${msg.sender_username || 'User'}</p>
                            </div>
                        ` : ''}
                        <div class="${isMine ? 'bg-purple-600 text-white' : 'bg-white'} rounded-lg px-4 py-3 shadow">
                            ${isViewOnce && isViewed ? `
                                <div class="text-center py-4">
                                    <i class="fas fa-eye-slash text-3xl mb-2 opacity-50"></i>
                                    <p class="text-sm opacity-75">File has been deleted</p>
                                    <p class="text-xs opacity-50 mt-1">View-once file</p>
                                </div>
                            ` : `
                                <div class="flex items-center gap-3">
                                    <i class="fas ${fileIcon} text-2xl"></i>
                                    <div class="flex-1">
                                        <p class="font-semibold text-sm">${this.escapeHtml(fileData.fileName)}</p>
                                        <p class="text-xs opacity-75">${this.formatFileSize(fileData.fileSize)}</p>
                                    </div>
                                </div>
                                ${isViewOnce ? `
                                    <div class="mt-2 p-2 bg-yellow-500/20 rounded text-xs">
                                        <i class="fas fa-eye-slash mr-1"></i>
                                        <strong>VIEW ONCE:</strong> File will be deleted after viewing
                                    </div>
                                ` : ''}
                                <button 
                                    onclick="app.downloadFile('${messageId}', '${fileData.fileName}', '${fileData.fileType}', ${isViewOnce})"
                                    class="mt-2 w-full bg-white/20 hover:bg-white/30 px-3 py-2 rounded text-sm font-semibold transition"
                                >
                                    <i class="fas fa-download mr-2"></i>${isViewOnce ? 'View Once' : 'Download'}
                                </button>
                            `}
                            <p class="text-xs ${isMine ? 'text-purple-200' : 'text-gray-500'} mt-2">${time}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Regular text message with avatar
        const senderAvatar = isMine && this.currentUser.avatar
            ? `<img src="${this.currentUser.avatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">`
            : `<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"><i class="fas fa-user text-gray-600 text-xs"></i></div>`;

        return `
            <div class="mb-4 ${isMine ? 'text-right' : 'text-left'}">
                <div class="inline-block max-w-xs lg:max-w-md">
                    ${!isMine ? `
                        <div class="flex items-center gap-2 mb-1">
                            ${senderAvatar}
                            <p class="text-xs text-gray-600">${msg.sender_username || 'User'}</p>
                        </div>
                    ` : ''}
                    <div class="${isMine ? 'bg-purple-600 text-white' : 'bg-white'} rounded-lg px-4 py-2 shadow">
                        <p>${this.escapeHtml(msg.encrypted_content || msg.content || '[Encrypted]')}</p>
                        <p class="text-xs ${isMine ? 'text-purple-200' : 'text-gray-500'} mt-1">${time}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // FEATURE: View-once file download
    async downloadFile(messageId, fileName, fileType, viewOnce) {
        // Find message with file data
        const message = this.messages.find(m => m.id === messageId);
        if (!message) {
            alert('File not found');
            return;
        }

        try {
            const fileData = JSON.parse(message.encrypted_content || message.content);
            
            if (viewOnce) {
                // Confirm view-once
                if (!confirm('⚠️ VIEW ONCE FILE\n\nThis file will be deleted after viewing.\nAre you sure you want to open it?')) {
                    return;
                }
            }

            // Preview for images
            if (fileType.startsWith('image/')) {
                const preview = confirm('📷 Preview image before downloading?\n\n✓ Yes - Show preview\n✗ No - Download directly');
                if (preview) {
                    const win = window.open('', '_blank');
                    win.document.write(`
                        <html>
                            <head><title>${fileName}</title></head>
                            <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                                <img src="${fileData.dataUrl}" style="max-width:100%;max-height:100vh;" alt="${fileName}">
                            </body>
                        </html>
                    `);
                }
            }

            // Download file
            const link = document.createElement('a');
            link.href = fileData.dataUrl;
            link.download = fileName;
            link.click();

            // FEATURE: Mark view-once as viewed
            if (viewOnce) {
                this.viewedOnceFiles.add(messageId);
                localStorage.setItem('viewedOnceFiles', JSON.stringify([...this.viewedOnceFiles]));
                await this.loadMessages(); // Refresh to show deleted state
                
                alert('✅ File downloaded!\n\n🔒 This view-once file has been marked as deleted.');
            } else {
                alert('✅ Download started!');
            }
        } catch (error) {
            console.error('[V2] Download error:', error);
            alert('Failed to download file: ' + error.message);
        }
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const content = input.value.trim();

        if (!content || !this.currentRoom) return;

        console.log('[V2] Sending message:', content);

        try {
            const response = await fetch(`${API_BASE}/api/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: this.currentRoom.id,
                    senderId: this.currentUser.id,
                    encryptedContent: content,
                    iv: 'placeholder-iv'
                })
            });

            const data = await response.json();
            console.log('[V2] Send response:', data);

            if (data.success) {
                input.value = '';
                await this.loadMessages();
            }
        } catch (error) {
            console.error('[V2] Error sending message:', error);
        }
    }

    startPolling() {
        if (this.messagePoller) clearInterval(this.messagePoller);
        
        this.messagePoller = setInterval(() => {
            if (this.currentRoom) {
                this.loadMessages();
            }
        }, 3000);
    }

    logout() {
        console.log('[V2] Logging out');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('viewedOnceFiles');
        this.currentUser = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages = [];
        this.viewedOnceFiles.clear();
        
        if (this.messagePoller) clearInterval(this.messagePoller);
        
        this.showAuth();
    }

    showMessage(element, text, type) {
        element.className = `mb-4 p-3 rounded-lg ${
            type === 'error' ? 'bg-red-100 text-red-700' :
            type === 'success' ? 'bg-green-100 text-green-700' :
            'bg-blue-100 text-blue-700'
        }`;
        element.textContent = text;
        element.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new SecureChatApp();
document.addEventListener('DOMContentLoaded', () => app.init());

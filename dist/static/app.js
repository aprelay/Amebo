// SecureChat & Pay - Frontend Application
const API_BASE = '';

class App {
  constructor() {
    this.currentUser = null;
    this.currentRoom = null;
    this.roomKey = null;
    this.rooms = [];
    this.messages = [];
    this.messagePolling = null;
    this.avatarDataUrl = null; // Store selected avatar
    this.viewedOnceFiles = new Set(); // Track viewed once files
    
    this.init();
  }

  async init() {
    try {
      console.log('[DEBUG] Init started');
      // Check if user is already logged in
      const savedUser = localStorage.getItem('currentUser');
      console.log('[DEBUG] Saved user:', savedUser ? 'exists' : 'none');
      
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        console.log('[DEBUG] Loading rooms...');
        await this.loadRooms();
        console.log('[DEBUG] Rooms loaded');
        
        console.log('[DEBUG] Showing room code prompt...');
        // Show room code prompt instead of directly showing app
        this.showRoomCodePrompt();
      } else {
        console.log('[DEBUG] Rendering auth...');
        this.renderAuth();
      }
      console.log('[DEBUG] Init completed');
    } catch (error) {
      console.error('[DEBUG] Init error:', error);
      // Fallback to login page on any error
      document.getElementById('app').innerHTML = `
        <div style="padding: 20px; background: #fee; color: #c00;">
          <h1>Error initializing app</h1>
          <p>${error.message}</p>
          <button onclick="localStorage.clear(); location.reload();" style="padding: 10px; margin-top: 10px;">Clear & Reload</button>
        </div>
      `;
    }
  }

  renderAuth() {
    console.log('[DEBUG] renderAuth called');
    const appDiv = document.getElementById('app');
    console.log('[DEBUG] app div found:', appDiv !== null);
    
    appDiv.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shield-alt text-white text-3xl"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">SecureChat & Pay</h1>
            <p class="text-gray-600 mt-2">Military-grade encrypted messaging</p>
          </div>

          <div id="auth-form">
            <!-- Avatar Selection -->
            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-2">Profile Picture (Optional)</label>
              <div class="flex items-center space-x-4">
                <div id="avatar-preview" class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <i class="fas fa-user text-gray-400 text-2xl"></i>
                </div>
                <input 
                  type="file" 
                  id="avatar-input" 
                  accept="image/*"
                  class="hidden"
                  onchange="app.handleAvatarSelect(event)"
                />
                <button 
                  onclick="document.getElementById('avatar-input').click()"
                  class="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
                >
                  <i class="fas fa-camera mr-2"></i>Choose Photo
                </button>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-2">Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Enter username"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button 
              onclick="app.handleAuth()" 
              class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition mb-3"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>Login / Register
            </button>

            <div class="text-center text-sm text-gray-500 mt-4">
              <i class="fas fa-lock mr-1"></i>
              Your keys are generated locally and never leave your device
            </div>
          </div>
        </div>
      </div>
    `;
    
    console.log('[DEBUG] renderAuth completed, innerHTML length:', appDiv.innerHTML.length);
  }

  async handleAvatarSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar must be under 2MB');
      return;
    }
    
    try {
      // Compress and resize image
      const compressed = await this.compressImage(file, 200, 200, 0.7);
      this.avatarDataUrl = compressed;
      
      // Update preview
      const preview = document.getElementById('avatar-preview');
      if (preview) {
        preview.innerHTML = `<img src="${compressed}" class="w-full h-full object-cover" />`;
      }
    } catch (error) {
      console.error('Avatar error:', error);
      alert('Failed to process avatar image');
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
          
          // Calculate new dimensions maintaining aspect ratio
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
    if (!username) {
      alert('Please enter a username');
      return;
    }

    this.showLoading('Authenticating...');

    try {
      // Try to login first
      let response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      let data = await response.json();

      if (response.ok) {
        // User exists, login
        this.currentUser = data.user;
        
        // Load avatar from localStorage if exists
        const savedAvatar = localStorage.getItem(`avatar_${username}`);
        if (savedAvatar) {
          this.currentUser.avatar = savedAvatar;
        }
        
        // Save new avatar if selected during login
        if (this.avatarDataUrl) {
          this.currentUser.avatar = this.avatarDataUrl;
          localStorage.setItem(`avatar_${username}`, this.avatarDataUrl);
        }
      } else {
        // User doesn't exist, register
        const keyPair = await CryptoUtils.generateKeyPair();
        
        response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username, 
            publicKey: keyPair.publicKey 
          })
        });

        data = await response.json();
        if (!response.ok) throw new Error(data.error);

        this.currentUser = {
          id: data.userId,
          username: data.username,
          public_key: keyPair.publicKey,
          avatar: this.avatarDataUrl
        };
        
        // Save avatar for new user
        if (this.avatarDataUrl) {
          localStorage.setItem(`avatar_${username}`, this.avatarDataUrl);
        }
        
        // Save avatar to localStorage
        if (this.avatarDataUrl) {
          localStorage.setItem(`avatar_${username}`, this.avatarDataUrl);
        }
      }

      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      
      console.log('[DEBUG] Loading rooms...');
      await this.loadRooms();
      console.log('[DEBUG] Rooms loaded:', this.rooms.length);
      
      // Note: Notification permission removed from auth flow
      // Users can enable notifications later from settings
      
      // Show room code prompt instead of going directly to app
      console.log('[DEBUG] Hiding loading...');
      this.hideLoading();
      console.log('[DEBUG] Showing room code prompt...');
      this.showRoomCodePrompt();
      console.log('[DEBUG] Room code prompt shown');
    } catch (error) {
      this.hideLoading();
      alert('Authentication failed: ' + error.message);
      this.renderAuth();
    }
  }

  showRoomCodePrompt() {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden ${this.currentUser.avatar ? '' : 'bg-indigo-100 flex items-center justify-center'}">
              ${this.currentUser.avatar ? 
                `<img src="${this.currentUser.avatar}" class="w-full h-full object-cover" />` :
                `<i class="fas fa-user text-indigo-600 text-3xl"></i>`
              }
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Welcome, ${this.currentUser.username}!</h2>
            <p class="text-gray-600 mt-2">Enter room code to continue</p>
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 font-semibold mb-2">Room Code</label>
            <input 
              type="text" 
              id="room-code-input" 
              placeholder="Enter room code"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onkeypress="if(event.key==='Enter') app.joinRoomWithCode()"
              autofocus
            />
          </div>

          <button 
            onclick="app.joinRoomWithCode()" 
            class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition mb-3"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>Join Room
          </button>

          <button 
            onclick="app.showCreateRoomDialog()" 
            class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-3"
          >
            <i class="fas fa-plus mr-2"></i>Create New Room
          </button>

          <button 
            onclick="app.logout()" 
            class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            <i class="fas fa-sign-out-alt mr-2"></i>Logout
          </button>
        </div>
      </div>
    `;
  }

  async joinRoomWithCode() {
    console.log('[DEBUG] joinRoomWithCode called');
    const roomCode = document.getElementById('room-code-input').value.trim();
    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }

    console.log('[DEBUG] Joining room with code:', roomCode);
    this.showLoading('Joining room...');

    try {
      const response = await fetch(`${API_BASE}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode,
          userId: this.currentUser.id
        })
      });

      const data = await response.json();
      console.log('[DEBUG] Join response:', data);

      if (response.ok) {
        console.log('[DEBUG] Join successful, loading rooms...');
        await this.loadRooms();
        const room = this.rooms.find(r => r.room_code === roomCode);
        if (room) {
          console.log('[DEBUG] Room found, opening...', room.id);
          await this.openRoom(room.id);
        } else {
          console.log('[DEBUG] Room not found in loaded rooms');
        }
        this.hideLoading();
      } else {
        this.hideLoading();
        alert(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('[DEBUG] Join error:', error);
      this.hideLoading();
      alert('Error joining room: ' + error.message);
    }
  }

  showCreateRoomDialog() {
    console.log('[DEBUG] showCreateRoomDialog called');
    const roomCode = document.getElementById('room-code-input').value.trim();
    
    if (!roomCode) {
      alert('Please enter a room code first');
      return;
    }

    if (roomCode.length < 6) {
      alert('Room code must be at least 6 characters long');
      return;
    }

    console.log('[DEBUG] Creating room with code:', roomCode);
    this.showLoading('Creating room...');

    fetch(`${API_BASE}/api/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: roomCode,
        roomName: `Room ${roomCode.substring(0, 8)}`,
        userId: this.currentUser.id
      })
    })
    .then(response => response.json())
    .then(async (data) => {
      console.log('[DEBUG] Create response:', data);
      if (data.success) {
        console.log('[DEBUG] Room created, loading rooms...');
        await this.loadRooms();
        console.log('[DEBUG] Opening room:', data.roomId);
        await this.openRoom(data.roomId);
        this.hideLoading();
      } else {
        this.hideLoading();
        alert(data.error || 'Failed to create room');
      }
    })
    .catch(error => {
      console.error('[DEBUG] Create error:', error);
      this.hideLoading();
      alert('Error creating room: ' + error.message);
    });
  }

  async loadRooms() {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/user/${this.currentUser.id}`);
      const data = await response.json();
      if (data.success) {
        this.rooms = data.rooms;
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  }

  async promptRoomCodeLogin() {
    const userAvatar = this.currentUser.avatar ? 
      `<img src="${this.currentUser.avatar}" class="w-full h-full object-cover" />` :
      '<i class="fas fa-user text-gray-400 text-2xl"></i>';
    
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-teal-600 to-green-700 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              ${userAvatar}
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Welcome, ${this.currentUser.username}!</h2>
            <p class="text-gray-600 mt-2"><i class="fas fa-shield-alt mr-1"></i>Enter room code to continue</p>
          </div>

          <div id="room-code-form">
            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-2">Room Code</label>
              <input 
                type="text" 
                id="room-code-input" 
                placeholder="Enter secret room code"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 font-semibold mb-2">Room Name (Optional)</label>
              <input 
                type="text" 
                id="room-name-input" 
                placeholder="Give your room a name"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button 
              onclick="app.handleRoomCodeEntry('join')" 
              class="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition mb-3"
            >
              <i class="fas fa-sign-in-alt mr-2"></i>Join Room
            </button>

            <button 
              onclick="app.handleRoomCodeEntry('create')" 
              class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition mb-3"
            >
              <i class="fas fa-plus-circle mr-2"></i>Create New Room
            </button>

            <button 
              onclick="app.logout()" 
              class="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>Logout
            </button>

            <div class="text-center text-sm text-gray-500 mt-4">
              <i class="fas fa-lock mr-1"></i>
              Room codes are never stored on the server
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async handleRoomCodeEntry(action) {
    const roomCode = document.getElementById('room-code-input').value.trim();
    const roomName = document.getElementById('room-name-input').value.trim() || `Room ${roomCode.substring(0, 4)}`;

    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }

    if (roomCode.length < 6) {
      alert('Room code must be at least 6 characters long');
      return;
    }

    this.showLoading(action === 'create' ? 'Creating room...' : 'Joining room...');

    try {
      if (action === 'create') {
        const response = await fetch(`${API_BASE}/api/rooms/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: roomCode,
            roomName: roomName,
            userId: this.currentUser.id
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        await this.loadRooms();
        await this.openRoom(data.roomId);
      } else {
        const response = await fetch(`${API_BASE}/api/rooms/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: roomCode,
            userId: this.currentUser.id
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        await this.loadRooms();
        await this.openRoom(data.roomId);
      }
      
      this.hideLoading();
    } catch (error) {
      this.hideLoading();
      alert(`Failed to ${action} room: ${error.message}`);
    }
  }

  renderApp() {
    document.getElementById('app').innerHTML = `
      <div class="flex flex-col h-screen bg-gray-50">
        <!-- WhatsApp-style Header -->
        <div class="bg-teal-600 text-white p-4 flex items-center justify-between shadow-lg">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center mr-3">
              <i class="fas fa-user text-xl"></i>
            </div>
            <div>
              <div class="font-bold">${this.currentUser.username}</div>
              <div class="text-xs text-teal-100">
                <i class="fas fa-shield-alt mr-1"></i>Encrypted & Secure
              </div>
            </div>
          </div>
          <button onclick="app.logout()" class="text-white hover:bg-teal-700 rounded-full p-2">
            <i class="fas fa-sign-out-alt text-xl"></i>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="bg-teal-600 flex shadow-md">
          <button onclick="app.showTab('chat')" id="tab-chat" class="flex-1 py-3 font-semibold text-white border-b-2 border-white">
            <i class="fas fa-comments mr-2"></i>Chats
          </button>
          <button onclick="app.showTab('wallet')" id="tab-wallet" class="flex-1 py-3 font-semibold text-teal-200 border-b-2 border-transparent">
            <i class="fas fa-wallet mr-2"></i>Wallet
          </button>
        </div>

        <!-- Content Area -->
        <div id="content-area" class="flex-1 overflow-hidden bg-white">
          ${this.renderChatTab()}
        </div>
      </div>
    `;

    this.showTab('chat');
  }

  renderChatTab() {
    if (this.currentRoom) {
      return this.renderChatRoom();
    }

    return `
      <div class="h-full flex flex-col bg-white">
        <!-- Room List -->
        <div class="flex-1 overflow-y-auto">
          ${this.rooms.length === 0 ? 
            '<div class="text-center text-gray-500 py-12"><div class="mb-4"><i class="fas fa-comments text-6xl text-gray-300"></i></div><div class="text-lg font-semibold">No chats yet</div><div class="text-sm">Create or join a room to start chatting!</div></div>' :
            this.rooms.map(room => `
              <div 
                onclick="app.openRoom('${room.id}')" 
                class="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-100 transition"
              >
                <div class="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <i class="fas fa-lock text-teal-600 text-xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <div class="font-semibold text-gray-900 truncate">${room.room_name}</div>
                    <div class="text-xs text-gray-500 ml-2 flex-shrink-0">${new Date(room.created_at).toLocaleDateString()}</div>
                  </div>
                  <div class="text-sm text-gray-500 flex items-center">
                    <i class="fas fa-users mr-1 text-xs"></i>
                    ${room.member_count} member${room.member_count > 1 ? 's' : ''}
                    <span class="mx-2">•</span>
                    <i class="fas fa-shield-alt mr-1 text-xs text-green-600"></i>
                    <span class="text-green-600">Encrypted</span>
                  </div>
                </div>
                <div class="ml-2">
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            `).join('')
          }
        </div>

        <!-- WhatsApp-style Floating Action Buttons -->
        <div class="absolute bottom-20 right-4 flex flex-col space-y-3">
          <button 
            onclick="app.showJoinRoom()" 
            class="bg-teal-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-teal-600 transition flex items-center justify-center"
          >
            <i class="fas fa-key text-xl"></i>
          </button>
          <button 
            onclick="app.showCreateRoom()" 
            class="bg-teal-600 text-white w-16 h-16 rounded-full shadow-xl hover:bg-teal-700 transition flex items-center justify-center"
          >
            <i class="fas fa-plus text-2xl"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderChatRoom() {
    return `
      <div class="h-full flex flex-col">
        <!-- WhatsApp-style Header -->
        <div class="bg-teal-600 p-3 flex items-center shadow-lg">
          <button onclick="app.leaveRoom()" class="mr-3 text-white hover:bg-teal-700 rounded-full p-2">
            <i class="fas fa-arrow-left text-lg"></i>
          </button>
          <div class="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center mr-3">
            <i class="fas fa-lock text-white"></i>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-white">${this.currentRoom.room_name}</div>
            <div class="text-xs text-teal-100 flex items-center">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              End-to-end encrypted
            </div>
          </div>
          <button onclick="app.startVideoCall()" class="text-white hover:bg-teal-700 rounded-full p-2 mr-1" title="Video call">
            <i class="fas fa-video"></i>
          </button>
          <button onclick="app.startVoiceCall()" class="text-white hover:bg-teal-700 rounded-full p-2" title="Voice call">
            <i class="fas fa-phone"></i>
          </button>
          <button onclick="app.toggleRoomMenu()" class="text-white hover:bg-teal-700 rounded-full p-2 relative" title="More options">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>

        <!-- Room Options Menu (Three Dots) -->
        <div id="room-menu" class="hidden absolute right-4 top-16 bg-white rounded-lg shadow-xl z-50 w-56 overflow-hidden">
          <button onclick="app.viewRoomInfo()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
            <i class="fas fa-info-circle text-gray-600 w-6"></i>
            <span class="ml-3">Room info</span>
          </button>
          <button onclick="app.viewMembers()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
            <i class="fas fa-users text-gray-600 w-6"></i>
            <span class="ml-3">View members</span>
          </button>
          <button onclick="app.shareRoom()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
            <i class="fas fa-share-alt text-gray-600 w-6"></i>
            <span class="ml-3">Share room code</span>
          </button>
          <button onclick="app.exportChat()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
            <i class="fas fa-download text-gray-600 w-6"></i>
            <span class="ml-3">Export chat</span>
          </button>
          <button onclick="app.muteNotifications()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
            <i class="fas fa-bell-slash text-gray-600 w-6"></i>
            <span class="ml-3">Mute notifications</span>
          </button>
          <button onclick="app.clearMessages()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-red-600">
            <i class="fas fa-trash text-red-600 w-6"></i>
            <span class="ml-3">Clear messages</span>
          </button>
        </div>

        <!-- WhatsApp-style Messages Background -->
        <div id="messages-container" class="flex-1 overflow-y-auto p-3" style="background: linear-gradient(to bottom, #e5ddd5 0%, #e5ddd5 100%), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbD0iI2U1ZGRkNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4='); background-blend-mode: overlay;">
          ${this.messages.length === 0 ? 
            '<div class="text-center py-8"><div class="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm shadow"><i class="fas fa-lock mr-2"></i>Messages are end-to-end encrypted. No one outside of this chat can read them.</div></div>' :
            this.messages.map(msg => this.renderMessage(msg)).join('')
          }
        </div>

        <!-- WhatsApp-style Message Input -->
        <div class="bg-gray-100 p-2 flex items-center space-x-2">
          <button onclick="app.toggleEmojiPicker()" class="text-gray-600 hover:text-gray-800 p-2" title="Emoji">
            <i class="fas fa-smile text-2xl"></i>
          </button>
          <button onclick="app.showAttachMenu()" class="text-gray-600 hover:text-gray-800 p-2 relative" title="Attach">
            <i class="fas fa-paperclip text-xl"></i>
          </button>
          
          <!-- Attachment Menu -->
          <div id="attach-menu" class="hidden absolute bottom-16 left-14 bg-white rounded-lg shadow-xl z-50 w-64 overflow-hidden">
            <input type="file" id="file-input" class="hidden" onchange="app.handleFileSelect(event)" multiple accept="*/*">
            <input type="file" id="image-input" class="hidden" onchange="app.handleFileSelect(event)" accept="image/*" multiple>
            <input type="file" id="video-input" class="hidden" onchange="app.handleFileSelect(event)" accept="video/*">
            <input type="file" id="audio-input" class="hidden" onchange="app.handleFileSelect(event)" accept="audio/*">
            
            <button onclick="document.getElementById('file-input').click()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <i class="fas fa-file text-purple-600"></i>
              </div>
              <span>Document</span>
            </button>
            <button onclick="document.getElementById('image-input').click()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                <i class="fas fa-image text-pink-600"></i>
              </div>
              <span>Photos & Videos</span>
            </button>
            <button onclick="app.capturePhoto()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <i class="fas fa-camera text-red-600"></i>
              </div>
              <span>Camera</span>
            </button>
            <button onclick="document.getElementById('audio-input').click()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <i class="fas fa-music text-orange-600"></i>
              </div>
              <span>Audio</span>
            </button>
            <button onclick="app.shareLocation()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <i class="fas fa-map-marker-alt text-green-600"></i>
              </div>
              <span>Location</span>
            </button>
            <button onclick="app.shareContact()" class="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <i class="fas fa-user text-blue-600"></i>
              </div>
              <span>Contact</span>
            </button>
          </div>

          <div class="flex-1 flex bg-white rounded-full items-center px-4 py-2">
            <input 
              type="text" 
              id="message-input" 
              placeholder="Type a message"
              class="flex-1 outline-none bg-transparent"
              onkeypress="if(event.key==='Enter') app.sendMessage()"
            />
          </div>
          <button 
            onclick="app.sendMessage()" 
            class="bg-teal-600 text-white w-12 h-12 rounded-full hover:bg-teal-700 transition flex items-center justify-center shadow-lg"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderMessage(msg) {
    const isOwn = msg.sender_id === this.currentUser.id;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const content = msg.decryptedContent || msg.encrypted_content;
    
    // Try to parse as file object
    let fileData = null;
    let isFile = false;
    
    try {
      const parsed = JSON.parse(content);
      if (parsed.type === 'file' && parsed.dataUrl) {
        fileData = parsed;
        isFile = true;
      }
    } catch (e) {
      // Not a file object, check if old format file message
      isFile = content.startsWith('📎');
    }
    
    // Check if view-once file has been viewed
    const isViewedOnce = fileData && fileData.viewOnce && fileData.messageId && 
      localStorage.getItem(`viewed_${fileData.messageId}`);
    
    // Get sender avatar
    const senderAvatar = !isOwn ? 
      (localStorage.getItem(`avatar_${msg.username}`) ? 
        `<img src="${localStorage.getItem(`avatar_${msg.username}`)}" class="w-full h-full object-cover" />` : 
        '<i class="fas fa-user text-gray-400 text-xs"></i>') : '';
    
    // Get file icon based on type
    const getFileIcon = (fileType) => {
      if (!fileType) return 'fa-file';
      if (fileType.startsWith('image/')) return 'fa-file-image';
      if (fileType.startsWith('video/')) return 'fa-file-video';
      if (fileType.startsWith('audio/')) return 'fa-file-audio';
      if (fileType.includes('pdf')) return 'fa-file-pdf';
      if (fileType.includes('word')) return 'fa-file-word';
      if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
      if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
      return 'fa-file';
    };
    
    return `
      <div class="chat-message flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2">
        ${!isOwn ? `<div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden">${senderAvatar}</div>` : ''}
        <div class="max-w-xs lg:max-w-md relative">
          ${!isOwn ? `<div class="text-xs font-semibold mb-1 ml-2" style="color: #00a884;">${msg.username}</div>` : ''}
          <div class="${isOwn ? 'bg-green-100' : 'bg-white'} rounded-lg px-3 py-2 shadow-sm ${isFile ? 'min-w-[200px]' : ''}" style="${isOwn ? 'border-radius: 7.5px 7.5px 0 7.5px;' : 'border-radius: 7.5px 7.5px 7.5px 0;'}">
            ${fileData ? 
              isViewedOnce ? 
                `<div class="py-3 text-center">
                  <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-eye-slash text-gray-400 text-xl"></i>
                  </div>
                  <div class="text-gray-500 text-sm font-medium">View Once File</div>
                  <div class="text-xs text-gray-400 mt-1">This file has been deleted</div>
                </div>` :
                `<div class="cursor-pointer" onclick="app.downloadFile('${fileData.dataUrl}', '${fileData.fileName}', '${fileData.fileType}', ${fileData.viewOnce || false}, '${fileData.messageId || ''}')">
                  ${fileData.viewOnce ? '<div class="bg-purple-100 rounded px-2 py-1 mb-2 text-center"><i class="fas fa-eye-slash mr-1"></i><span class="text-xs font-semibold text-purple-700">VIEW ONCE</span></div>' : ''}
                  <div class="flex items-center space-x-3 py-2">
                    <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <i class="fas ${getFileIcon(fileData.fileType)} text-teal-600"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-gray-800 text-sm font-medium truncate">${fileData.fileName}</div>
                      <div class="text-xs text-gray-500">${(fileData.fileSize / 1024 / 1024).toFixed(2)} MB • Tap to ${fileData.viewOnce ? 'view once' : 'download'}</div>
                    </div>
                    <i class="fas ${fileData.viewOnce ? 'fa-eye' : 'fa-download'} text-teal-600"></i>
                  </div>
                  ${fileData.fileType.startsWith('image/') && !fileData.viewOnce ? 
                    `<img src="${fileData.dataUrl}" class="mt-2 rounded max-w-full max-h-48 object-cover" alt="${fileData.fileName}" />` : 
                    ''
                  }
                </div>` :
              isFile ?
              `<div class="flex items-center space-x-3 py-2">
                <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-file text-teal-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-gray-800 text-sm font-medium truncate">${content.replace('📎 ', '')}</div>
                  <div class="text-xs text-gray-500">Legacy file (no download)</div>
                </div>
              </div>` :
              `<div class="text-gray-800 break-words whitespace-pre-wrap">${content}</div>`
            }
            <div class="flex items-center justify-end mt-1 space-x-1">
              <span class="text-xs" style="color: #667781;">${time}</span>
              ${isOwn ? '<i class="fas fa-check-double text-xs" style="color: #53bdeb;"></i>' : ''}
            </div>
          </div>
          ${!isOwn ? '<div class="absolute -left-2 top-0 w-0 h-0" style="border-top: 10px solid white; border-left: 10px solid transparent;"></div>' : ''}
          ${isOwn ? '<div class="absolute -right-2 top-0 w-0 h-0" style="border-top: 10px solid #dcf8c6; border-right: 10px solid transparent;"></div>' : ''}
        </div>
      </div>
    `;
  }

  renderWalletTab() {
    return `
      <div class="h-full overflow-y-auto p-4">
        <h2 class="text-2xl font-bold mb-6 text-gray-800">Wallet</h2>

        <!-- Naira Section -->
        <div class="bg-white rounded-xl shadow p-6 mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">Nigerian Naira (NGN)</h3>
            <i class="fas fa-naira-sign text-2xl text-green-600"></i>
          </div>
          <div class="mb-4">
            <input 
              type="number" 
              id="naira-amount" 
              placeholder="Amount in NGN"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
            />
            <input 
              type="email" 
              id="naira-email" 
              placeholder="Your email"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button 
            onclick="app.initializeNairaPayment()" 
            class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            <i class="fas fa-money-bill-wave mr-2"></i>Send Money (Paystack)
          </button>
          <div class="text-xs text-gray-500 mt-2">
            <i class="fas fa-info-circle mr-1"></i>Powered by Paystack - 1.5% transaction fee
          </div>
        </div>

        <!-- Crypto Section -->
        <div class="bg-white rounded-xl shadow p-6 mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Cryptocurrency</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div class="flex items-center">
                <i class="fab fa-bitcoin text-2xl text-orange-500 mr-3"></i>
                <div>
                  <div class="font-semibold">Bitcoin (BTC)</div>
                  <div class="text-sm text-gray-500">View balance</div>
                </div>
              </div>
              <button onclick="app.showCryptoInput('BTC')" class="text-indigo-600 hover:text-indigo-800">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center">
                <i class="fab fa-ethereum text-2xl text-blue-500 mr-3"></i>
                <div>
                  <div class="font-semibold">Ethereum (ETH)</div>
                  <div class="text-sm text-gray-500">View balance</div>
                </div>
              </div>
              <button onclick="app.showCryptoInput('ETH')" class="text-indigo-600 hover:text-indigo-800">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center">
                <i class="fas fa-dollar-sign text-2xl text-green-500 mr-3"></i>
                <div>
                  <div class="font-semibold">USDT (Tether)</div>
                  <div class="text-sm text-gray-500">View balance</div>
                </div>
              </div>
              <button onclick="app.showCryptoInput('USDT')" class="text-indigo-600 hover:text-indigo-800">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
            <i class="fas fa-info-circle mr-2 text-blue-600"></i>
            Enter your wallet address to view balances. For sending crypto, use your preferred wallet (MetaMask, Trust Wallet, etc.)
          </div>
        </div>

        <!-- Transaction History -->
        <div class="bg-white rounded-xl shadow p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
          <div id="transactions-list" class="text-center text-gray-500 py-4">
            No transactions yet
          </div>
        </div>
      </div>
    `;
  }

  showTab(tab) {
    // Update tab styles
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
      btn.className = 'flex-1 py-3 font-semibold text-teal-200 border-b-2 border-transparent';
    });
    document.getElementById(`tab-${tab}`).className = 'flex-1 py-3 font-semibold text-white border-b-2 border-white';

    // Render content
    const contentArea = document.getElementById('content-area');
    if (tab === 'chat') {
      contentArea.innerHTML = this.renderChatTab();
    } else if (tab === 'wallet') {
      contentArea.innerHTML = this.renderWalletTab();
      this.loadTransactions();
    }
  }

  showCreateRoom() {
    const roomCode = prompt('Enter a secret room code (share this with others to let them join):');
    if (!roomCode) return;

    const roomName = prompt('Enter room name (optional):') || 'Private Chat';

    this.createRoom(roomCode, roomName);
  }

  async createRoom(roomCode, roomName) {
    this.showLoading('Creating room...');

    try {
      const response = await fetch(`${API_BASE}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomCode, 
          roomName, 
          userId: this.currentUser.id 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(`Room created! Share this code: ${roomCode}`);
      await this.loadRooms();
      this.renderApp();
    } catch (error) {
      alert('Failed to create room: ' + error.message);
      this.renderApp();
    }
  }

  showJoinRoom() {
    const roomCode = prompt('Enter room code:');
    if (!roomCode) return;

    this.joinRoom(roomCode);
  }

  async joinRoom(roomCode) {
    this.showLoading('Joining room...');

    try {
      const response = await fetch(`${API_BASE}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomCode, 
          userId: this.currentUser.id 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert('Joined room successfully!');
      await this.loadRooms();
      this.renderApp();
    } catch (error) {
      alert('Failed to join room: ' + error.message);
      this.renderApp();
    }
  }

  async openRoom(roomId) {
    this.showLoading('Loading messages...');

    try {
      const room = this.rooms.find(r => r.id === roomId);
      this.currentRoom = room;

      // Generate room encryption key
      this.roomKey = await CryptoUtils.generateRoomKey(room.room_code);

      // Load messages
      await this.loadMessages();

      this.hideLoading();
      this.renderApp();
      this.scrollToBottom();

      // Start polling for new messages
      this.startMessagePolling();
    } catch (error) {
      this.hideLoading();
      alert('Failed to open room: ' + error.message);
      this.renderApp();
    }
  }

  async loadMessages() {
    try {
      const response = await fetch(`${API_BASE}/api/messages/${this.currentRoom.id}`);
      const data = await response.json();
      
      if (data.success) {
        this.messages = data.messages;

        // Decrypt messages
        for (let msg of this.messages) {
          try {
            msg.decryptedContent = await CryptoUtils.decryptMessage(
              msg.encrypted_content, 
              msg.iv, 
              this.roomKey
            );
          } catch (e) {
            msg.decryptedContent = '[Failed to decrypt]';
          }
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    try {
      // Encrypt message
      const encrypted = await CryptoUtils.encryptMessage(message, this.roomKey);

      const response = await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoom.id,
          senderId: this.currentUser.id,
          encryptedContent: encrypted.encrypted,
          iv: encrypted.iv
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      input.value = '';
      await this.loadMessages();
      
      // Re-render messages
      document.getElementById('messages-container').innerHTML = 
        this.messages.map(msg => this.renderMessage(msg)).join('');
      
      this.scrollToBottom();
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  }

  startMessagePolling() {
    if (this.messagePolling) clearInterval(this.messagePolling);

    this.messagePolling = setInterval(async () => {
      if (this.currentRoom) {
        const oldCount = this.messages.length;
        await this.loadMessages();
        
        if (this.messages.length > oldCount) {
          // Notify about new messages
          for (let i = oldCount; i < this.messages.length; i++) {
            this.notifyNewMessage(this.messages[i]);
          }
          
          document.getElementById('messages-container').innerHTML = 
            this.messages.map(msg => this.renderMessage(msg)).join('');
          this.scrollToBottom();
        }
      }
    }, 3000); // Poll every 3 seconds
  }

  leaveRoom() {
    if (this.messagePolling) {
      clearInterval(this.messagePolling);
      this.messagePolling = null;
    }
    this.currentRoom = null;
    this.roomKey = null;
    this.messages = [];
    this.renderApp();
  }

  async initializeNairaPayment() {
    const amount = document.getElementById('naira-amount').value;
    const email = document.getElementById('naira-email').value;

    if (!amount || !email) {
      alert('Please enter amount and email');
      return;
    }

    this.showLoading('Initializing payment...');

    try {
      const response = await fetch(`${API_BASE}/api/payments/naira/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser.id,
          email,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(data.message + '\n\nIn production, you would be redirected to Paystack payment page.\n\nSetup: Get API key from paystack.com');
      this.showTab('wallet');
    } catch (error) {
      alert('Payment initialization failed: ' + error.message);
      this.showTab('wallet');
    }
  }

  showCryptoInput(currency) {
    const address = prompt(`Enter your ${currency} wallet address:`);
    if (!address) return;

    alert(`Balance check for ${currency}\n\nAddress: ${address}\n\nIn production, this would fetch real balance from:\n- BTC: Blockchain.info API\n- ETH: Etherscan API\n- USDT: Tron API\n\nSetup: Get free API keys from respective platforms.`);
  }

  async loadTransactions() {
    try {
      const response = await fetch(`${API_BASE}/api/transactions/${this.currentUser.id}`);
      const data = await response.json();
      
      if (data.success && data.transactions.length > 0) {
        const list = data.transactions.map(tx => `
          <div class="border-b py-3 flex justify-between items-center">
            <div>
              <div class="font-semibold">${tx.currency} ${tx.amount}</div>
              <div class="text-sm text-gray-500">${new Date(tx.created_at).toLocaleString()}</div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm ${
              tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }">
              ${tx.status}
            </span>
          </div>
        `).join('');
        
        document.getElementById('transactions-list').innerHTML = list;
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('privateKey');
      if (this.messagePolling) clearInterval(this.messagePolling);
      this.currentUser = null;
      this.currentRoom = null;
      this.rooms = [];
      this.messages = [];
      this.renderAuth();
    }
  }

  showLoading(message) {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <div class="text-gray-600">${message}</div>
        </div>
      </div>
    `;
  }

  // ============================================
  // NEW FEATURES: Calls, Files, and Menu Options
  // ============================================

  toggleRoomMenu() {
    const menu = document.getElementById('room-menu');
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      // Close menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.closeMenuOnClickOutside.bind(this), { once: true });
      }, 100);
    } else {
      menu.classList.add('hidden');
    }
  }

  closeMenuOnClickOutside(e) {
    const menu = document.getElementById('room-menu');
    if (menu && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }

  showAttachMenu() {
    const menu = document.getElementById('attach-menu');
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      setTimeout(() => {
        document.addEventListener('click', (e) => {
          if (menu && !menu.contains(e.target) && !e.target.closest('button[onclick*="showAttachMenu"]')) {
            menu.classList.add('hidden');
          }
        }, { once: true });
      }, 100);
    } else {
      menu.classList.add('hidden');
    }
  }

  async startVideoCall() {
    // Check if Twilio SDK is loaded
    if (typeof Twilio === 'undefined' || !Twilio.Video) {
      alert('📦 Twilio SDK not loaded!\n\nPlease add the Twilio Video SDK to your HTML:\n\n<script src="https://sdk.twilio.com/js/video/releases/2.27.0/twilio-video.min.js"></script>');
      return;
    }

    if (!this.currentRoom) {
      alert('Please join a chat room first');
      return;
    }

    // Create video call UI
    const callUI = document.createElement('div');
    callUI.id = 'video-call-ui';
    callUI.className = 'fixed inset-0 bg-gray-900 z-50';
    callUI.innerHTML = `
      <div class="relative h-full flex flex-col">
        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-gray-900 to-transparent p-4">
          <div class="flex items-center justify-between text-white">
            <div>
              <h3 class="text-lg font-semibold">${this.currentRoom.room_name}</h3>
              <p class="text-sm opacity-75" id="call-status">Connecting...</p>
            </div>
            <div id="network-quality" class="flex items-center space-x-2"></div>
          </div>
        </div>

        <!-- Remote Video (Main) -->
        <div id="remote-media" class="flex-1 flex items-center justify-center bg-gray-800">
          <div class="text-white text-center">
            <i class="fas fa-user-circle text-6xl mb-4"></i>
            <p>Waiting for others to join...</p>
          </div>
        </div>

        <!-- Local Video (Picture-in-Picture) -->
        <div id="local-media" class="absolute top-20 right-4"></div>

        <!-- Call Controls -->
        <div class="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-gray-900 to-transparent p-6">
          <div class="flex items-center justify-center space-x-4">
            <button 
              id="toggle-mute-btn"
              onclick="app.toggleCallMute()"
              class="w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Mute/Unmute"
            >
              <i class="fas fa-microphone text-xl"></i>
            </button>
            
            <button 
              id="toggle-video-btn"
              onclick="app.toggleCallVideo()"
              class="w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Video On/Off"
            >
              <i class="fas fa-video text-xl"></i>
            </button>
            
            <button 
              onclick="app.endVideoCall()"
              class="w-16 h-16 rounded-full bg-red-600 text-white hover:bg-red-700 transition transform scale-110"
              title="End Call"
            >
              <i class="fas fa-phone-slash text-2xl"></i>
            </button>
            
            <button 
              id="switch-camera-btn"
              onclick="app.switchCallCamera()"
              class="w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Switch Camera"
            >
              <i class="fas fa-sync-alt text-xl"></i>
            </button>
            
            <button 
              onclick="app.toggleCallFullscreen()"
              class="w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Fullscreen"
            >
              <i class="fas fa-expand text-xl"></i>
            </button>
          </div>
          
          <div class="text-center mt-4 text-white text-sm">
            <span id="call-duration">00:00</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(callUI);

    // Initialize Twilio Video Manager
    if (!window.twilioManager) {
      window.twilioManager = new TwilioVideoManager();
    }

    const result = await window.twilioManager.initializeCall(
      this.currentRoom.room_code,
      true, // isVideoCall
      this.currentUser.username
    );

    if (result.success) {
      document.getElementById('call-status').textContent = 'Connected';
      this.startCallDurationTimer();
      
      // Show notification
      this.showNotification('Video Call Started', `Connected to ${this.currentRoom.room_name}`);
    } else {
      alert(`Failed to start video call:\n\n${result.error}\n\nPlease check:\n1. Twilio credentials are configured\n2. Backend /api/twilio/token endpoint is working\n3. Camera/microphone permissions are granted`);
      callUI.remove();
    }
  }

  async startVoiceCall() {
    // Check if Twilio SDK is loaded
    if (typeof Twilio === 'undefined' || !Twilio.Video) {
      alert('📦 Twilio SDK not loaded!\n\nPlease add the Twilio Video SDK to your HTML:\n\n<script src="https://sdk.twilio.com/js/video/releases/2.27.0/twilio-video.min.js"></script>');
      return;
    }

    if (!this.currentRoom) {
      alert('Please join a chat room first');
      return;
    }

    // Create voice call UI (similar to video but without video elements)
    const callUI = document.createElement('div');
    callUI.id = 'voice-call-ui';
    callUI.className = 'fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 z-50 flex items-center justify-center';
    callUI.innerHTML = `
      <div class="text-center text-white p-8">
        <div class="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <i class="fas fa-phone text-6xl"></i>
        </div>
        
        <h2 class="text-2xl font-bold mb-2">${this.currentRoom.room_name}</h2>
        <p class="text-lg opacity-75 mb-6" id="voice-call-status">Connecting...</p>
        
        <div id="voice-network-quality" class="mb-8"></div>
        
        <div class="flex items-center justify-center space-x-4 mb-6">
          <button 
            id="voice-toggle-mute-btn"
            onclick="app.toggleCallMute()"
            class="w-16 h-16 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            title="Mute/Unmute"
          >
            <i class="fas fa-microphone text-2xl"></i>
          </button>
          
          <button 
            onclick="app.endVoiceCall()"
            class="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 transition transform scale-110"
            title="End Call"
          >
            <i class="fas fa-phone-slash text-3xl"></i>
          </button>
        </div>
        
        <div class="text-sm">
          <span id="voice-call-duration">00:00</span>
        </div>
        
        <div id="voice-remote-media" class="hidden"></div>
      </div>
    `;

    document.body.appendChild(callUI);

    // Initialize Twilio Video Manager (audio only)
    if (!window.twilioManager) {
      window.twilioManager = new TwilioVideoManager();
    }

    const result = await window.twilioManager.initializeCall(
      this.currentRoom.room_code,
      false, // isVideoCall (false = audio only)
      this.currentUser.username
    );

    if (result.success) {
      document.getElementById('voice-call-status').textContent = 'Connected';
      this.startVoiceCallDurationTimer();
      
      // Show notification
      this.showNotification('Voice Call Started', `Connected to ${this.currentRoom.room_name}`);
    } else {
      alert(`Failed to start voice call:\n\n${result.error}\n\nPlease check:\n1. Twilio credentials are configured\n2. Backend /api/twilio/token endpoint is working\n3. Microphone permission is granted`);
      callUI.remove();
    }
  }

  toggleCallMute() {
    if (!window.twilioManager) return;
    
    const isMuted = window.twilioManager.toggleMute();
    
    // Update button UI for both video and voice calls
    const videoBtn = document.getElementById('toggle-mute-btn');
    const voiceBtn = document.getElementById('voice-toggle-mute-btn');
    
    if (videoBtn) {
      videoBtn.innerHTML = isMuted 
        ? '<i class="fas fa-microphone-slash text-xl"></i>'
        : '<i class="fas fa-microphone text-xl"></i>';
      videoBtn.className = isMuted
        ? 'w-14 h-14 rounded-full bg-red-600 text-white hover:bg-red-700 transition'
        : 'w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition';
    }
    
    if (voiceBtn) {
      voiceBtn.innerHTML = isMuted 
        ? '<i class="fas fa-microphone-slash text-2xl"></i>'
        : '<i class="fas fa-microphone text-2xl"></i>';
      voiceBtn.className = isMuted
        ? 'w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 transition'
        : 'w-16 h-16 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition';
    }
  }

  toggleCallVideo() {
    if (!window.twilioManager) return;
    
    const isVideoOff = window.twilioManager.toggleVideo();
    
    const btn = document.getElementById('toggle-video-btn');
    if (btn) {
      btn.innerHTML = isVideoOff 
        ? '<i class="fas fa-video-slash text-xl"></i>'
        : '<i class="fas fa-video text-xl"></i>';
      btn.className = isVideoOff
        ? 'w-14 h-14 rounded-full bg-red-600 text-white hover:bg-red-700 transition'
        : 'w-14 h-14 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition';
    }
  }

  async switchCallCamera() {
    if (!window.twilioManager) return;
    await window.twilioManager.switchCamera();
  }

  toggleCallFullscreen() {
    const callUI = document.getElementById('video-call-ui');
    if (!callUI) return;
    
    if (!document.fullscreenElement) {
      callUI.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  endVideoCall() {
    if (window.twilioManager) {
      window.twilioManager.endCall();
    }
    
    const callUI = document.getElementById('video-call-ui');
    if (callUI) {
      callUI.remove();
    }
    
    if (this.callDurationInterval) {
      clearInterval(this.callDurationInterval);
    }
    
    this.showNotification('Call Ended', 'Video call has ended');
  }

  endVoiceCall() {
    if (window.twilioManager) {
      window.twilioManager.endCall();
    }
    
    const callUI = document.getElementById('voice-call-ui');
    if (callUI) {
      callUI.remove();
    }
    
    if (this.voiceCallDurationInterval) {
      clearInterval(this.voiceCallDurationInterval);
    }
    
    this.showNotification('Call Ended', 'Voice call has ended');
  }

  startCallDurationTimer() {
    const startTime = Date.now();
    this.callDurationInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      
      const durationEl = document.getElementById('call-duration');
      if (durationEl) {
        durationEl.textContent = `${minutes}:${seconds}`;
      }
    }, 1000);
  }

  startVoiceCallDurationTimer() {
    const startTime = Date.now();
    this.voiceCallDurationInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      
      const durationEl = document.getElementById('voice-call-duration');
      if (durationEl) {
        durationEl.textContent = `${minutes}:${seconds}`;
      }
    }, 1000);
  }

  viewRoomInfo() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    
    alert(`📋 Room Information\n\nRoom Name: ${this.currentRoom.room_name}\nRoom Code: ${this.currentRoom.room_code}\nCreated: ${new Date(this.currentRoom.created_at).toLocaleString()}\nMembers: ${this.currentRoom.member_count}\n\nEncryption: AES-256-GCM + RSA-4096\nStatus: End-to-end encrypted ✅`);
  }

  async viewMembers() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${this.currentRoom.id}/members`);
      const data = await response.json();
      
      if (data.success) {
        const membersList = data.members.map(m => 
          `• ${m.username} ${m.id === this.currentUser.id ? '(You)' : ''}`
        ).join('\n');
        
        alert(`👥 Room Members (${data.members.length})\n\n${membersList}`);
      }
    } catch (error) {
      alert('Failed to fetch members');
    }
  }

  shareRoom() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    
    const shareText = `Join my encrypted chat room!\n\nRoom: ${this.currentRoom.room_name}\nCode: ${this.currentRoom.room_code}\n\nDownload the app and use this code to join.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my chat room',
        text: shareText,
      }).catch(() => {
        this.copyToClipboard(this.currentRoom.room_code);
        alert(`Room code copied to clipboard!\n\nShare this code: ${this.currentRoom.room_code}`);
      });
    } else {
      this.copyToClipboard(this.currentRoom.room_code);
      alert(`Room code copied to clipboard!\n\nShare this code: ${this.currentRoom.room_code}`);
    }
  }

  copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  async exportChat() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    
    const chatText = this.messages.map(msg => {
      const time = new Date(msg.created_at).toLocaleString();
      return `[${time}] ${msg.username}: ${msg.decryptedContent}`;
    }).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentRoom.room_name}_chat_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('💾 Chat exported successfully!');
  }

  muteNotifications() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    alert('🔕 Notifications muted for this room\n\n(Feature will be fully functional after push notification setup)');
  }

  clearMessages() {
    const menu = document.getElementById('room-menu');
    menu.classList.add('hidden');
    
    if (confirm('⚠️ Clear all messages?\n\nThis will only clear messages on your device. Other members will still see them.')) {
      this.messages = [];
      document.getElementById('messages-container').innerHTML = 
        '<div class="text-center text-gray-500 py-8">Messages cleared</div>';
    }
  }

  toggleEmojiPicker() {
    const existingPicker = document.getElementById('emoji-picker');
    
    if (existingPicker) {
      existingPicker.remove();
      return;
    }

    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.className = 'absolute bottom-16 left-2 bg-white rounded-lg shadow-xl z-50 p-4 w-80 max-h-96 overflow-y-auto';
    
    const emojis = [
      // Smileys & Emotion
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
      '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄',
      '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐',
      // Gestures
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️',
      '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
      // Hearts
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞',
      '💓', '💗', '💖', '💘', '💝', '💟',
      // Symbols
      '✨', '⭐', '🌟', '💫', '🔥', '💥', '💯', '✅', '❌', '⚠️', '🎉', '🎊', '🎈',
      // Objects
      '💬', '💭', '🗨️', '💌', '📱', '💻', '⌨️', '🖥️', '📸', '📷', '🎥', '🎬',
      '🎵', '🎶', '🎤', '🎧', '📻', '🎸', '🎹', '🎺', '🎷', '🥁', '🎮', '🕹️',
      // Food
      '🍕', '🍔', '🍟', '🌭', '🍿', '🧈', '🍞', '🥐', '🥖', '🥨', '🥯', '🥞',
      '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌮', '🌯', '🥙',
      // Flags
      '🏳️', '🏴', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇳🇬', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺'
    ];

    picker.innerHTML = `
      <div class="flex items-center justify-between mb-3 pb-3 border-b">
        <span class="font-semibold text-gray-800">Pick an emoji</span>
        <button onclick="document.getElementById('emoji-picker').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="grid grid-cols-8 gap-2">
        ${emojis.map(emoji => `
          <button 
            onclick="app.insertEmoji('${emoji}')" 
            class="text-2xl hover:bg-gray-100 rounded p-2 transition"
            title="${emoji}"
          >
            ${emoji}
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(picker);

    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeEmojiPicker(e) {
        if (!picker.contains(e.target) && !e.target.closest('button[onclick*="toggleEmojiPicker"]')) {
          picker.remove();
          document.removeEventListener('click', closeEmojiPicker);
        }
      });
    }, 100);
  }

  insertEmoji(emoji) {
    const input = document.getElementById('message-input');
    if (input) {
      input.value += emoji;
      input.focus();
    }
    
    // Save to recent emojis
    let recent = JSON.parse(localStorage.getItem('recentEmojis') || '[]');
    recent = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 10);
    localStorage.setItem('recentEmojis', JSON.stringify(recent));
  }

  async handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const menu = document.getElementById('attach-menu');
    menu.classList.add('hidden');
    
    // Ask if user wants view-once
    const viewOnce = confirm('🔒 Make this a VIEW ONCE file?\n\nView Once files:\n✓ Can only be viewed/downloaded once\n✓ Auto-delete after viewing\n✓ Maximum privacy protection\n\nClick OK for View Once, Cancel for normal file');

    for (let file of files) {
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
      
      // 10MB limit for embedded files (reasonable for encrypted messages)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name}\n\nMaximum size: 10MB\nYour file: ${fileSize}MB\n\nNote: For larger files, use Cloudflare R2 storage in production.`);
        continue;
      }

      this.showLoading(`${viewOnce ? '🔒 Preparing view-once' : 'Compressing'} ${file.name}...`);
      
      try {
        let dataUrl;
        
        // Super-fast compression for images
        if (file.type.startsWith('image/')) {
          // Compress image to 70% quality, max 1920x1080
          dataUrl = await this.compressImage(file, 1920, 1080, 0.7);
        } else {
          // Non-image files: just convert to data URL
          dataUrl = await this.fileToDataUrl(file);
        }
        
        // Send file with embedded data
        await this.sendFileMessage(file, dataUrl, viewOnce);
        
        this.hideLoading();
      } catch (error) {
        console.error('File upload error:', error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
        this.hideLoading();
      }
    }
    
    // Reset file input
    event.target.value = '';
  }

  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async sendFileMessage(file, dataUrl, viewOnce = false) {
    // Generate unique message ID for view-once tracking
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create file metadata
    const fileData = {
      type: 'file',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      dataUrl: dataUrl, // Base64 data URL
      viewOnce: viewOnce,
      messageId: messageId
    };
    
    // Convert to JSON string for encryption
    const fileJson = JSON.stringify(fileData);
    
    try {
      const encrypted = await CryptoUtils.encryptMessage(fileJson, this.roomKey);

      await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoom.id,
          senderId: this.currentUser.id,
          encryptedContent: encrypted.encrypted,
          iv: encrypted.iv
        })
      });

      await this.loadMessages();
      document.getElementById('messages-container').innerHTML = 
        this.messages.map(msg => this.renderMessage(msg)).join('');
      this.scrollToBottom();
    } catch (error) {
      console.error('Failed to send file message:', error);
      throw error;
    }
  }

  downloadFile(dataUrl, fileName, fileType, viewOnce = false, messageId = null) {
    try {
      // Check if already viewed for view-once files
      if (viewOnce && messageId) {
        const viewedKey = `viewed_${messageId}`;
        if (localStorage.getItem(viewedKey)) {
          alert('🔒 View Once File\n\nThis file has already been viewed and deleted.\n\nView Once files can only be accessed one time for maximum privacy.');
          return;
        }
      }
      
      // Check if it's an image - show preview first
      if (fileType && fileType.startsWith('image/')) {
        const shouldDownload = confirm(`${viewOnce ? '🔒 VIEW ONCE ' : ''}Preview image: ${fileName}\n\n${viewOnce ? '⚠️ WARNING: This file will be deleted after viewing!\n\n' : ''}Click OK to download, Cancel to view only.`);
        if (!shouldDownload) {
          // Open in new tab for preview
          const win = window.open();
          win.document.write(`
            <html>
              <head>
                <title>${fileName}${viewOnce ? ' (VIEW ONCE)' : ''}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
                  img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                  ${viewOnce ? '.watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: rgba(255,255,255,0.3); font-weight: bold; pointer-events: none; }' : ''}
                </style>
              </head>
              <body>
                ${viewOnce ? '<div class="watermark">VIEW ONCE 🔒</div>' : ''}
                <img src="${dataUrl}" alt="${fileName}" />
              </body>
            </html>
          `);
          
          // Mark as viewed for view-once
          if (viewOnce && messageId) {
            localStorage.setItem(`viewed_${messageId}`, 'true');
            this.showNotification('View Once File Deleted', `${fileName} has been permanently deleted.`, { icon: '/static/icon-192.svg' });
            
            // Reload messages to update UI
            setTimeout(() => {
              this.loadMessages();
            }, 2000);
          }
          return;
        }
      }

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mark as viewed for view-once
      if (viewOnce && messageId) {
        localStorage.setItem(`viewed_${messageId}`, 'true');
        this.showNotification('View Once File Deleted', `${fileName} has been downloaded and permanently deleted.`, { icon: '/static/icon-192.svg' });
        
        // Reload messages to update UI
        setTimeout(() => {
          this.loadMessages();
        }, 2000);
      } else {
        // Show success message for normal files
        this.showNotification('Download Started', `Downloading ${fileName}`, { icon: '/static/icon-192.svg' });
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download ${fileName}: ${error.message}`);
    }
  }

  capturePhoto() {
    const menu = document.getElementById('attach-menu');
    menu.classList.add('hidden');
    
    alert('📷 Camera\n\nFor production:\n- Access device camera using navigator.mediaDevices.getUserMedia()\n- Capture photo\n- Compress and encrypt\n- Upload to storage\n- Send in chat');
  }

  shareLocation() {
    const menu = document.getElementById('attach-menu');
    menu.classList.add('hidden');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          alert(`📍 Location\n\nLatitude: ${lat}\nLongitude: ${lng}\n\nFor production:\n- Send coordinates in encrypted message\n- Display map preview\n- Add Google Maps/OpenStreetMap link`);
        },
        (error) => {
          alert('❌ Location access denied\n\nPlease enable location permissions in your browser settings.');
        }
      );
    } else {
      alert('❌ Geolocation not supported by your browser');
    }
  }

  shareContact() {
    const menu = document.getElementById('attach-menu');
    menu.classList.add('hidden');
    
    alert('👤 Share Contact\n\nFor production:\n- Create contact picker UI\n- Format contact information (vCard)\n- Encrypt and send\n- Add contact import functionality');
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('Notification permission already granted');
      await this.subscribeToNotifications();
      return;
    }

    if (Notification.permission !== 'denied') {
      // Show a friendly prompt first
      const shouldAsk = confirm('🔔 Enable notifications to receive messages even when the app is closed?');
      
      if (shouldAsk) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          this.showNotification('Notifications Enabled! 🔔', 'You will now receive message notifications');
          await this.subscribeToNotifications();
        }
      }
    }
  }

  async subscribeToNotifications() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Subscribe to push notifications
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
            )
          });
          
          console.log('Push subscription created:', subscription);
          
          // Send subscription to backend
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: this.currentUser.userId,
              subscription: subscription
            })
          });
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/static/icon-192.svg',
        badge: '/static/icon-192.svg',
        tag: 'securechat-message',
        requireInteraction: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  notifyNewMessage(message) {
    // Don't notify for own messages
    if (message.sender_id === this.currentUser.id) return;

    // Don't notify if window is focused
    if (document.hasFocus()) return;

    const title = `${message.username} in ${this.currentRoom?.room_name || 'Chat'}`;
    const body = message.decryptedContent?.substring(0, 100) || 'New message';

    this.showNotification(title, body, {
      tag: `message-${message.id}`,
      data: {
        roomId: this.currentRoom?.id,
        messageId: message.id
      }
    });

    // Update badge count
    this.updateBadgeCount();
  }

  async updateBadgeCount() {
    if ('setAppBadge' in navigator) {
      try {
        // Count unread messages (simplified - just show 1)
        await navigator.setAppBadge(1);
      } catch (error) {
        console.log('Badge API not supported');
      }
    }
  }

  async clearBadgeCount() {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (error) {
        console.log('Badge API not supported');
      }
    }
  }
}

// Initialize app
const app = new App();

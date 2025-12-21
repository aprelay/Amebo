// Add these methods to the App class in app.js

// Avatar handling
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

// Compress image for faster upload/download
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

// Updated handleAuth to include avatar
async handleAuthWithAvatar() {
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
      
      // Save avatar to localStorage
      if (this.avatarDataUrl) {
        localStorage.setItem(`avatar_${username}`, this.avatarDataUrl);
      }
    }

    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    
    // Show room code prompt
    this.showRoomCodePrompt();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Show room code prompt on login
showRoomCodePrompt() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            ${this.currentUser.avatar ? 
              `<img src="${this.currentUser.avatar}" class="w-full h-full rounded-full object-cover" />` :
              `<i class="fas fa-lock text-indigo-600 text-2xl"></i>`
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

// Join room with code
async joinRoomWithCode() {
  const roomCode = document.getElementById('room-code-input').value.trim();
  if (!roomCode) {
    alert('Please enter a room code');
    return;
  }

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

    if (response.ok) {
      await this.loadRooms();
      const room = this.rooms.find(r => r.room_code === roomCode);
      if (room) {
        await this.enterRoom(room);
      }
    } else {
      alert(data.error || 'Failed to join room');
    }
  } catch (error) {
    alert('Error joining room: ' + error.message);
  }
}

// View-once file handling
async sendFileMessage(file, dataUrl, viewOnce = false) {
  // Compress file for faster upload
  let finalDataUrl = dataUrl;
  
  if (file.type.startsWith('image/')) {
    // Compress images to max 1920px width, 0.85 quality
    finalDataUrl = await this.compressImage(file, 1920, 1920, 0.85);
  }
  
  // Create file metadata
  const fileData = {
    type: 'file',
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    dataUrl: finalDataUrl,
    viewOnce: viewOnce, // Privacy feature
    messageId: crypto.randomUUID() // Unique ID for tracking
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

// Download file with view-once support
downloadFile(dataUrl, fileName, fileType, messageId, viewOnce) {
  try {
    // Check if already viewed (for view-once)
    if (viewOnce && this.viewedOnceFiles.has(messageId)) {
      alert('🔒 This file can only be viewed once and has already been opened.');
      return;
    }
    
    // Mark as viewed
    if (viewOnce) {
      this.viewedOnceFiles.add(messageId);
      localStorage.setItem('viewedOnceFiles', JSON.stringify([...this.viewedOnceFiles]));
    }
    
    // Check if it's an image - show preview first
    if (fileType && fileType.startsWith('image/')) {
      if (viewOnce) {
        // For view-once, show warning
        const proceed = confirm(`⚠️ VIEW ONCE FILE\n\nThis image can only be viewed once.\nAfter closing, it will be permanently deleted.\n\nClick OK to view now.`);
        if (!proceed) return;
      }
      
      const win = window.open();
      win.document.write(`
        <html>
          <head>
            <title>${fileName}${viewOnce ? ' (View Once)' : ''}</title>
            <style>
              body { 
                margin: 0; 
                display: flex; 
                flex-direction: column;
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                background: #000; 
              }
              img { max-width: 100%; max-height: 90vh; object-fit: contain; }
              .warning {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(239, 68, 68, 0.9);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                font-weight: bold;
                z-index: 1000;
              }
              .download-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-family: Arial, sans-serif;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            ${viewOnce ? '<div class="warning">⚠️ VIEW ONCE - Will be deleted after closing</div>' : ''}
            <img src="${dataUrl}" alt="${fileName}" />
            ${!viewOnce ? `<a href="${dataUrl}" download="${fileName}" class="download-btn">💾 Download</a>` : ''}
          </body>
        </html>
      `);
      return;
    }

    // For non-images or if user wants to download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show notification
    const message = viewOnce ? 
      `Downloaded ${fileName} (View Once - now deleted)` :
      `Downloaded ${fileName}`;
    this.showNotification('Download Complete', message, { icon: '/static/icon-192.svg' });
  } catch (error) {
    console.error('Download error:', error);
    alert(`Failed to download ${fileName}: ${error.message}`);
  }
}

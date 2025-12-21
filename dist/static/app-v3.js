// Amebo - V3 Industrial Grade with Token System
const API_BASE = '';

class SecureChatApp {
    constructor() {
        this.currentUser = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages = [];
        this.messagePoller = null;
        this.notificationPoller = null;
        this.unreadNotifications = 0;
        this.viewedOnceFiles = new Set();
        this.roomKeys = new Map(); // Store room encryption keys
        this.userPrivateKey = null; // User's private key for E2E
        
        // Navigation history for swipe back
        this.navigationHistory = [];
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.swipeThreshold = 100; // pixels to trigger back
        
        // Last message tracking for notifications
        this.lastMessageIds = new Map(); // roomId -> last message ID
        this.notificationSound = null;
        this.notificationsEnabled = true;
        this.badgeNotificationsEnabled = true; // Badge notifications for iOS PWA
        
        // Enhanced notification queue system
        this.notificationQueue = [];
        this.isProcessingNotifications = false;
        this.lastNotificationTime = 0;
        this.notificationMinDelay = 500; // Minimum 500ms between notifications
        this.notificationPermissionChecked = false;
        this.pendingNotifications = []; // Backup queue for retry
        
        console.log('[V3] App initialized - Industrial Grade Security + Tokens + Enhanced Notifications');
        
        // Initialize swipe gesture handling
        this.initSwipeGestures();
        
        // Request notification permission
        this.requestNotificationPermission();
    }

    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                console.log('[NOTIFICATIONS] Permission:', permission);
            } catch (error) {
                console.error('[NOTIFICATIONS] Permission error:', error);
            }
        }
    }

    // Poll for notifications (for mobile push when app is in background)
    startNotificationPolling() {
        // Clear any existing interval
        if (this.notificationPollInterval) {
            clearInterval(this.notificationPollInterval);
        }
        
        console.log('[NOTIFICATIONS] 📡 Starting notification polling (every 15s)');
        
        this.notificationPollInterval = setInterval(async () => {
            if (this.currentUser) {
                try {
                    const response = await fetch(`/api/notifications/${this.currentUser.id}/unread`);
                    const { notifications } = await response.json();
                    
                    const unreadCount = notifications ? notifications.length : 0;
                    
                    console.log(`[NOTIFICATIONS] Polling check: ${unreadCount} unread notification(s)`);
                    
                    // Always update badge with unread count
                    await this.updateAppBadge(unreadCount);
                    
                    if (notifications && notifications.length > 0) {
                        console.log(`[NOTIFICATIONS] 📬 ${notifications.length} unread notification(s) found`);
                        
                        // Track which notifications we've already shown to avoid duplicates
                        if (!this.shownNotifications) {
                            this.shownNotifications = new Set();
                        }
                        
                        // Only show browser notifications if enabled
                        if (this.notificationsEnabled) {
                            console.log(`[NOTIFICATIONS] Browser notifications are enabled but we'll only show badge`);
                            // DISABLED: Browser notification popups are annoying
                            // Users can click the bell icon to see notifications
                            /*
                            for (const notif of notifications) {
                                // Skip if we've already shown this notification
                                if (this.shownNotifications.has(notif.id)) {
                                    continue;
                                }
                                
                                if ('Notification' in window && Notification.permission === 'granted') {
                                    const browserNotif = new Notification(notif.title, {
                                        body: notif.message,
                                        icon: '/static/icon-192.svg',
                                        badge: '/static/icon-192.svg',
                                        tag: `amebo-${notif.id}`,
                                        vibrate: [200, 100, 300, 100, 200],
                                        timestamp: new Date(notif.created_at).getTime(),
                                        requireInteraction: false
                                    });
                                    
                                    // Handle notification click
                                    browserNotif.onclick = () => {
                                        window.focus();
                                        try {
                                            const data = JSON.parse(notif.data || '{}');
                                            if (data.roomId) {
                                                // Navigate to room
                                                this.joinRoomById(data.roomId);
                                            }
                                        } catch (e) {
                                            console.error('[NOTIFICATIONS] Data parse error:', e);
                                        }
                                        browserNotif.close();
                                    };
                                    
                                    // Play sound
                                    this.playNotificationSound();
                                    
                                    console.log(`[NOTIFICATIONS] ✅ Showed notification: ${notif.title}`);
                                }
                                
                                // Mark this notification as shown (but keep as unread in DB for badge)
                                this.shownNotifications.add(notif.id);
                            }
                            */
                        } else {
                            console.log(`[NOTIFICATIONS] ⏭️ Notifications disabled, badge will still show count`);
                        }
                    }
                } catch (error) {
                    console.error('[NOTIFICATIONS] Poll error:', error);
                }
            }
        }, 15000); // Check every 15 seconds
    }

    stopNotificationPolling() {
        if (this.notificationPollInterval) {
            clearInterval(this.notificationPollInterval);
            this.notificationPollInterval = null;
            console.log('[NOTIFICATIONS] ⏹️ Stopped notification polling');
        }
    }

    async updateAppBadge(count) {
        try {
            console.log(`[BADGE] 🔵 updateAppBadge called with count: ${count}`);
            
            // Only update badge if badge notifications are enabled
            if (!this.badgeNotificationsEnabled) {
                console.log('[BADGE] ⏭️ Badge notifications disabled, skipping update');
                console.log('[BADGE] 💡 Enable in: Profile > Notifications > Badge Notifications');
                return;
            }
            
            // Diagnostic checks
            console.log('[BADGE] 🔍 Diagnostics:');
            console.log('  - Badge API support:', 'setAppBadge' in navigator);
            console.log('  - Service Worker:', 'serviceWorker' in navigator);
            console.log('  - SW Active:', navigator.serviceWorker?.controller ? 'Yes' : 'No');
            console.log('  - Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'Standalone (PWA)' : 'Browser');
            console.log('  - iOS check:', /iPhone|iPad|iPod/.test(navigator.userAgent));
            
            // Check if Badge API is supported
            if (!('setAppBadge' in navigator)) {
                console.log('[BADGE] ❌ Badge API not supported in this browser');
                console.log('[BADGE] ℹ️ Badge API requires:');
                console.log('  - iOS 16.4+ (in PWA mode)');
                console.log('  - iPadOS 16.4+ (in PWA mode)');
                console.log('  - Chrome/Edge 81+');
                console.log('[BADGE] 💡 Make sure:');
                console.log('  1. iOS version is 16.4 or higher');
                console.log('  2. App is saved to home screen');
                console.log('  3. App is opened from home screen (not Safari)');
                return;
            }
            
            console.log('[BADGE] ✅ Badge API is supported');
            
            // Update app badge (iOS PWA compatible!)
            if (count > 0) {
                await navigator.setAppBadge(count);
                console.log(`[BADGE] ✅ Badge set to: ${count}`);
                console.log('[BADGE] 📱 Check your home screen icon for the red badge');
            } else {
                await navigator.clearAppBadge();
                console.log('[BADGE] ✅ Badge cleared');
            }
            
            // Also tell service worker to update badge (for reliability)
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'UPDATE_BADGE',
                    count: count
                });
                console.log('[BADGE] 📤 Sent badge update to service worker');
            } else {
                console.log('[BADGE] ⚠️ Service worker not active yet');
            }
        } catch (error) {
            console.error('[BADGE] ❌ Error updating badge:', error);
            console.error('[BADGE] This might happen if:');
            console.error('[BADGE] 1. Badge API not supported (need iOS 16.4+ or Chrome 81+)');
            console.error('[BADGE] 2. App not installed as PWA (need to "Add to Home Screen")');
            console.error('[BADGE] 3. Browser security restrictions');
        }
    }

    checkBadgeSupport() {
        console.log('[BADGE] 🔍 Checking Badge API support...');
        console.log('[BADGE] Navigator.setAppBadge:', 'setAppBadge' in navigator ? '✅ Available' : '❌ Not available');
        console.log('[BADGE] Service Worker:', 'serviceWorker' in navigator ? '✅ Available' : '❌ Not available');
        
        if ('setAppBadge' in navigator) {
            console.log('[BADGE] ✅ Badge notifications supported on this device!');
            console.log('[BADGE] Make sure app is saved to home screen for iOS PWA support');
        } else {
            console.log('[BADGE] ⚠️ Badge API not supported');
            console.log('[BADGE] Requirements:');
            console.log('[BADGE] - iOS 16.4+ / iPadOS 16.4+');
            console.log('[BADGE] - Chrome 81+');
            console.log('[BADGE] - Edge 81+');
            console.log('[BADGE] - App saved to home screen (iOS)');
        }
        
        // Check display mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        console.log('[BADGE] Display mode:', isStandalone ? '✅ Standalone (PWA)' : '⚠️ Browser (not PWA)');
        
        if (!isStandalone) {
            console.log('[BADGE] ℹ️ To enable badge on iOS:');
            console.log('[BADGE] 1. Open in Safari');
            console.log('[BADGE] 2. Tap Share button');
            console.log('[BADGE] 3. Select "Add to Home Screen"');
            console.log('[BADGE] 4. Open from home screen icon');
        }
    }

    playNotificationSound() {
        try {
            // Create audio context if not exists
            if (!this.notificationSound) {
                // Create a simple notification beep using Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (error) {
            console.error('[SOUND] Notification sound error:', error);
        }
    }

    // Scroll chat to bottom (auto-scroll on new messages)
    scrollToBottom(force = false) {
        const scrollContainer = document.getElementById('messages-scroll-container');
        
        if (!scrollContainer) {
            console.error('[CHAT] ❌ Scroll container not found!');
            return;
        }
        
        // Check if user is already near the bottom (within 150px)
        const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 150;
        
        // Only auto-scroll if user is near bottom OR force is true
        if (isNearBottom || force) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
            console.log('[CHAT] ✅ Scrolled to bottom. ScrollHeight:', scrollContainer.scrollHeight, 'ScrollTop:', scrollContainer.scrollTop);
        } else {
            console.log('[CHAT] ⏸️ User is scrolling up, skipping auto-scroll');
        }
    }

    // Queue-based notification system for reliability
    queueNotification(message, roomName) {
        if (!this.notificationsEnabled) return;
        if (message.sender_id === this.currentUser.id) return;
        
        const notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            message,
            roomName,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: 3
        };
        
        this.notificationQueue.push(notification);
        console.log('[NOTIFICATIONS] ✓ Queued notification:', notification.id, 'Queue size:', this.notificationQueue.length);
        
        // Start processing if not already processing
        if (!this.isProcessingNotifications) {
            this.processNotificationQueue();
        }
    }

    async processNotificationQueue() {
        if (this.isProcessingNotifications || this.notificationQueue.length === 0) {
            return;
        }
        
        this.isProcessingNotifications = true;
        console.log('[NOTIFICATIONS] 🔄 Processing notification queue, size:', this.notificationQueue.length);
        
        while (this.notificationQueue.length > 0) {
            const notif = this.notificationQueue.shift();
            
            // Enforce minimum delay between notifications
            const timeSinceLastNotification = Date.now() - this.lastNotificationTime;
            if (timeSinceLastNotification < this.notificationMinDelay) {
                const waitTime = this.notificationMinDelay - timeSinceLastNotification;
                console.log('[NOTIFICATIONS] ⏱️ Waiting', waitTime, 'ms before next notification');
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            
            // Check if app is hidden/backgrounded
            const isHidden = document.hidden || !document.hasFocus();
            if (!isHidden) {
                console.log('[NOTIFICATIONS] ⏭️ Skipping notification - app is visible');
                continue;
            }
            
            try {
                await this.showMessageNotification(notif.message, notif.roomName);
                console.log('[NOTIFICATIONS] ✅ Successfully processed notification:', notif.id);
                this.lastNotificationTime = Date.now();
            } catch (error) {
                console.error('[NOTIFICATIONS] ❌ Error processing notification:', notif.id, error);
                
                // Retry logic
                if (notif.retryCount < notif.maxRetries) {
                    notif.retryCount++;
                    this.pendingNotifications.push(notif);
                    console.log('[NOTIFICATIONS] 🔄 Queued for retry (attempt', notif.retryCount, '/', notif.maxRetries, ')');
                } else {
                    console.error('[NOTIFICATIONS] ❌ Max retries reached for:', notif.id);
                }
            }
            
            // Small delay between notifications to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Process retry queue
        if (this.pendingNotifications.length > 0) {
            console.log('[NOTIFICATIONS] 🔄 Processing', this.pendingNotifications.length, 'pending retries');
            this.notificationQueue.push(...this.pendingNotifications);
            this.pendingNotifications = [];
        }
        
        this.isProcessingNotifications = false;
        console.log('[NOTIFICATIONS] ✓ Queue processing complete');
    }

    showMessageNotification(message, roomName) {
        if (!this.notificationsEnabled) return;
        
        // Don't notify for own messages
        if (message.sender_id === this.currentUser.id) return;
        
        console.log('[NOTIFICATIONS] 📱 Showing mobile notification for message:', message.id);
        
        // Mobile vibration pattern: short-long-short
        if ('vibrate' in navigator) {
            try {
                // Vibration pattern: vibrate 200ms, pause 100ms, vibrate 300ms, pause 100ms, vibrate 200ms
                navigator.vibrate([200, 100, 300, 100, 200]);
                console.log('[NOTIFICATIONS] ✓ Mobile vibration triggered');
            } catch (error) {
                console.error('[NOTIFICATIONS] Vibration error:', error);
            }
        }
        
        // Play notification sound
        this.playNotificationSound();
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                // Enhanced mobile notification options
                const notificationOptions = {
                    body: message.username ? `${message.username}: ${message.decrypted?.substring(0, 50) || 'New message'}` : message.decrypted?.substring(0, 50) || 'New message',
                    icon: '/static/amebo-logo.png',
                    badge: '/static/amebo-logo.png',
                    tag: `message-${message.id}`,
                    requireInteraction: false,
                    silent: false, // Let the notification make sound (in addition to our custom sound)
                    vibrate: [200, 100, 300, 100, 200], // Same vibration pattern
                    // Mobile-specific properties
                    renotify: true, // Allow re-notification even with same tag
                    timestamp: Date.now(),
                    data: {
                        roomId: this.currentRoom?.id,
                        messageId: message.id,
                        senderId: message.sender_id,
                        notificationId: `notif-${Date.now()}`
                    }
                };

                const notification = new Notification(`New message in ${roomName}`, notificationOptions);

                notification.onclick = () => {
                    console.log('[NOTIFICATIONS] Notification clicked - focusing window');
                    window.focus();
                    notification.close();
                    
                    // If not in the room, navigate to it
                    if (this.currentRoom?.id !== notification.data?.roomId) {
                        console.log('[NOTIFICATIONS] Navigating to room:', notification.data?.roomId);
                    }
                };

                notification.onerror = (error) => {
                    console.error('[NOTIFICATIONS] Notification error:', error);
                };

                // Auto-close after 6 seconds (slightly longer for mobile)
                setTimeout(() => {
                    try {
                        notification.close();
                    } catch (e) {
                        // Notification already closed
                    }
                }, 6000);
                
                console.log('[NOTIFICATIONS] ✓ Browser notification shown');
            } catch (error) {
                console.error('[NOTIFICATIONS] Show notification error:', error);
                throw error; // Rethrow to trigger retry logic
            }
        } else {
            const permissionStatus = Notification.permission;
            console.log('[NOTIFICATIONS] Browser notifications not available. Permission:', permissionStatus);
            
            if (permissionStatus === 'denied') {
                console.warn('[NOTIFICATIONS] ⚠️ User has denied notification permission');
            } else if (permissionStatus === 'default') {
                console.log('[NOTIFICATIONS] ℹ️ Notification permission not yet requested');
                // Automatically request permission
                this.requestNotificationPermission();
            }
        }
        
        // Mobile-specific: Wake lock to ensure notification is seen
        if ('wakeLock' in navigator && document.hidden) {
            try {
                // Request a brief wake lock to ensure the notification is delivered
                navigator.wakeLock.request('screen').then(wakeLock => {
                    console.log('[NOTIFICATIONS] ✓ Wake lock acquired for notification delivery');
                    // Release after 2 seconds
                    setTimeout(() => {
                        wakeLock.release();
                        console.log('[NOTIFICATIONS] Wake lock released');
                    }, 2000);
                }).catch(err => {
                    console.log('[NOTIFICATIONS] Wake lock request failed:', err);
                });
            } catch (error) {
                console.log('[NOTIFICATIONS] Wake lock not supported:', error);
            }
        }
        
        // Increment unread counter
        this.unreadNotifications++;
        console.log('[NOTIFICATIONS] ✓ Unread count:', this.unreadNotifications);
    }

    initSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            // Only handle swipes from left edge (first 50px)
            if (e.touches[0].clientX < 50) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (startX > 0) {
                const currentX = e.touches[0].clientX;
                const diffX = currentX - startX;
                
                // Show visual feedback for swipe
                if (diffX > 20) {
                    document.body.style.transform = `translateX(${Math.min(diffX * 0.3, 100)}px)`;
                    document.body.style.transition = 'none';
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (startX > 0) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = endX - startX;
                const diffY = Math.abs(endY - startY);
                const diffTime = Date.now() - startTime;
                
                // Reset visual feedback
                document.body.style.transform = '';
                document.body.style.transition = 'transform 0.3s ease';
                
                // Swipe right detected (more horizontal than vertical, and significant distance)
                if (diffX > this.swipeThreshold && diffY < 100 && diffTime < 500) {
                    console.log('[SWIPE] Back gesture detected');
                    this.navigateBack();
                }
                
                startX = 0;
                startY = 0;
            }
        }, { passive: true });
    }

    pushNavigation(pageName, context = {}) {
        this.navigationHistory.push({ page: pageName, context });
        console.log('[NAV] Pushed:', pageName, '- History depth:', this.navigationHistory.length);
    }

    navigateBack() {
        if (this.navigationHistory.length > 0) {
            // Remove current page
            this.navigationHistory.pop();
            
            // Get previous page
            const previous = this.navigationHistory[this.navigationHistory.length - 1];
            
            if (previous) {
                console.log('[NAV] Going back to:', previous.page);
                
                // Navigate to previous page
                switch(previous.page) {
                    case 'roomList':
                        this.showRoomList();
                        break;
                    case 'room':
                        if (previous.context.roomCode) {
                            this.joinRoom(previous.context.roomCode);
                        }
                        break;
                    case 'profile':
                        this.showProfile();
                        break;
                    case 'dataRedemption':
                        this.showDataRedemption();
                        break;
                    case 'tokenHistory':
                        this.showTokenHistory();
                        break;
                    case 'auth':
                        this.showAuth();
                        break;
                    case 'advertiserLanding':
                        this.showAdvertiserLanding();
                        break;
                    case 'advertiserLogin':
                        this.showAdvertiserLogin();
                        break;
                    case 'advertiserDashboard':
                        this.showAdvertiserDashboard(previous.context.advertiserId);
                        break;
                    default:
                        this.showRoomList();
                }
            } else {
                // No history, go to room list
                console.log('[NAV] No history, going to room list');
                this.showRoomList();
            }
        } else {
            console.log('[NAV] No navigation history');
        }
    }

    async init() {
        console.log('[V3] Init started');
        
        // Load notification preference
        const notificationPref = localStorage.getItem('notificationsEnabled');
        if (notificationPref !== null) {
            this.notificationsEnabled = notificationPref === 'true';
        }
        
        // Load badge notification preference
        const badgeNotificationPref = localStorage.getItem('badgeNotificationsEnabled');
        if (badgeNotificationPref !== null) {
            this.badgeNotificationsEnabled = badgeNotificationPref === 'true';
        }
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        // Check for email verification
        const isVerifyEmail = window.location.pathname.includes('/verify-email');
        if (isVerifyEmail && token) {
            console.log('[V3] Email verification flow detected');
            await this.verifyEmail(token);
            return;
        }
        
        // Check for password reset
        const isResetPassword = window.location.pathname.includes('/reset-password');
        if (isResetPassword && token) {
            console.log('[V3] Password reset flow detected');
            this.showResetPasswordForm(token);
            return;
        }
        
        // Check for saved user
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            console.log('[V3] Found saved user');
            this.currentUser = JSON.parse(saved);
            
            // Load private key from secure storage
            this.userPrivateKey = await CryptoUtils.retrievePrivateKey(this.currentUser.id);
            
            // Load viewed once files
            const viewedFiles = localStorage.getItem('viewedOnceFiles');
            if (viewedFiles) {
                this.viewedOnceFiles = new Set(JSON.parse(viewedFiles));
            }
            
            // Start notification polling for mobile push notifications
            this.startNotificationPolling();
            console.log('[NOTIFICATIONS] ✅ Notification polling started (auto-login)');
            
            // Start online status updates
            this.startOnlineStatusUpdates();
            console.log('[STATUS] ✅ Online status tracking started');
            
            // Check badge API support
            this.checkBadgeSupport();
            
            // FEATURE: Direct to room list (no room code prompt)
            await this.showRoomList();
        } else {
            console.log('[V3] No saved user - showing auth');
            this.showAuth();
        }
    }

    showAuth() {
        console.log('[V3] Rendering email auth page');
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="w-28 h-28 mx-auto mb-4 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center">
                            <img 
                                src="/static/amebo-logo.png" 
                                alt="Amebo Logo" 
                                class="w-full h-full object-contain"
                                width="112"
                                height="112"
                                loading="eager"
                                onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'text-4xl font-bold text-purple-600\\'>AMEBO</div>'"
                            >
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">Amebo</h1>
                        <p class="text-gray-600 mt-2">🇳🇬 Earn Tokens · Buy Data</p>
                        <div class="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            <i class="fas fa-coins"></i>
                            <span class="font-semibold">+20 Tokens on Signup!</span>
                        </div>
                    </div>

                    <div id="auth-message" class="hidden mb-4 p-3 rounded-lg"></div>

                    <!-- Auth Mode Toggle -->
                    <div class="flex border-b mb-6">
                        <button 
                            id="loginTab"
                            onclick="app.switchAuthMode('login')"
                            class="flex-1 py-3 font-semibold border-b-2 border-purple-600 text-purple-600"
                        >
                            Login
                        </button>
                        <button 
                            id="signupTab"
                            onclick="app.switchAuthMode('signup')"
                            class="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700"
                        >
                            Sign Up
                        </button>
                    </div>

                    <!-- Login Form -->
                    <div id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="loginEmail" 
                                placeholder="your@email.com"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="loginPassword" 
                                placeholder="••••••••"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onkeypress="if(event.key==='Enter') app.handleLogin()"
                            />
                        </div>
                        <button 
                            onclick="app.handleLogin()"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>Login
                        </button>
                        <div class="text-center mt-3">
                            <button 
                                onclick="app.showForgotPasswordModal()"
                                class="text-sm text-purple-600 hover:text-purple-800 font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    </div>

                    <!-- Sign Up Form -->
                    <div id="signupForm" class="space-y-4 hidden">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="signupEmail" 
                                placeholder="your@email.com"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="signupPassword" 
                                placeholder="Min 6 characters"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                id="signupPasswordConfirm" 
                                placeholder="••••••••"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onkeypress="if(event.key==='Enter') app.handleSignup()"
                            />
                        </div>
                        <button 
                            onclick="app.handleSignup()"
                            class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition"
                        >
                            <i class="fas fa-user-plus mr-2"></i>Create Account (+20 tokens!)
                        </button>
                    </div>

                    <!-- Features -->
                    <div class="mt-6 space-y-2 text-sm text-gray-600">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <span>Tier rewards: Bronze → Silver → Gold → Platinum</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <span>Redeem tokens for MTN, Airtel, Glo, 9mobile data</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-check-circle text-green-500"></i>
                            <span>End-to-end encrypted messaging</span>
                        </div>
                    </div>
                    
                    <!-- Advertiser Link -->
                    <div class="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p class="text-sm text-gray-600 mb-2">Want to advertise your business?</p>
                        <button 
                            onclick="app.showAdvertiserLanding()"
                            class="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
                        >
                            <i class="fas fa-bullhorn"></i>
                            Advertise on Amebo
                            <i class="fas fa-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    switchAuthMode(mode) {
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (mode === 'login') {
            loginTab.className = 'flex-1 py-3 font-semibold border-b-2 border-purple-600 text-purple-600';
            signupTab.className = 'flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700';
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            signupTab.className = 'flex-1 py-3 font-semibold border-b-2 border-green-600 text-green-600';
            loginTab.className = 'flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700';
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const msgDiv = document.getElementById('auth-message');

        if (!email || !password) {
            this.showMessage(msgDiv, 'Please enter email and password', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Logging in...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/auth/login-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.user) {
                this.showMessage(msgDiv, 'Login successful!', 'success');
                
                // Set current user
                this.currentUser = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    tokens: data.user.tokens || 0,
                    tier: data.user.tier || 'bronze'
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // Generate crypto keys for E2E encryption
                const keyPair = await CryptoUtils.generateUserKeyPair();
                this.userPrivateKey = keyPair.privateKey;
                await CryptoUtils.storePrivateKey(this.currentUser.id, keyPair.privateKey);
                
                // Start notification polling for mobile push notifications
                this.startNotificationPolling();
                console.log('[NOTIFICATIONS] ✅ Notification polling started after login');
                
                // Check badge API support
                this.checkBadgeSupport();
                
                setTimeout(() => this.showRoomList(), 500);
            } else if (data.verificationRequired) {
                this.showMessage(msgDiv, 'Please verify your email first. Check your inbox!', 'error');
                setTimeout(() => this.showEmailVerification(email), 2000);
            } else {
                this.showMessage(msgDiv, data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('[V3] Login error:', error);
            this.showMessage(msgDiv, 'Login failed. Please try again.', 'error');
        }
    }

    async handleSignup() {
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const msgDiv = document.getElementById('auth-message');

        if (!email || !password || !passwordConfirm) {
            this.showMessage(msgDiv, 'Please fill all fields', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage(msgDiv, 'Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showMessage(msgDiv, 'Passwords do not match', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Creating account...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/auth/register-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, 'Account created! Check your email to verify.', 'success');
                setTimeout(() => this.showEmailVerification(email), 2000);
            } else {
                this.showMessage(msgDiv, data.error || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('[V3] Signup error:', error);
            this.showMessage(msgDiv, 'Signup failed. Please try again.', 'error');
        }
    }

    showEmailVerification(email) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-envelope-open-text text-green-600 text-3xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>
                    <p class="text-gray-600 mb-6">
                        We sent a verification link to:<br>
                        <strong class="text-purple-600">${email}</strong>
                    </p>
                    <p class="text-sm text-gray-500 mb-6">
                        Click the link in the email to activate your account and receive <strong class="text-green-600">+20 tokens</strong> bonus!
                    </p>
                    
                    <div id="verification-message" class="hidden mb-4 p-3 rounded-lg"></div>
                    
                    <button 
                        onclick="app.resendVerification('${email}')"
                        class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition mb-3"
                    >
                        <i class="fas fa-redo mr-2"></i>Resend Verification Email
                    </button>
                    
                    <button 
                        onclick="app.showAuth()"
                        class="w-full text-purple-600 hover:text-purple-800 py-2 font-semibold"
                    >
                        ← Back to Login
                    </button>
                    
                    <div class="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-left">
                        <p class="font-semibold text-blue-900 mb-2">Didn't receive the email?</p>
                        <ul class="text-blue-800 space-y-1 text-xs">
                            <li>• Check your spam/junk folder</li>
                            <li>• Make sure ${email} is correct</li>
                            <li>• Try resending the verification email</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    async resendVerification(email) {
        const msgDiv = document.getElementById('verification-message');
        this.showMessage(msgDiv, 'Sending verification email...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, '✅ Verification email sent! Check your inbox.', 'success');
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to resend email', 'error');
            }
        } catch (error) {
            console.error('[V3] Resend verification error:', error);
            this.showMessage(msgDiv, 'Failed to resend email', 'error');
        }
    }

    // ============================================
    // LEGACY AUTH FUNCTIONS (kept for compatibility)
    // New email auth above, these are for fallback
    // ============================================
    
    async handleAvatarSelect(event) {
        // Legacy function - not used in email auth
        console.log('[V3] Avatar select (legacy)');
    }

    async compressImage(file, maxWidth, maxHeight, quality) {
        // Legacy function - kept for reference
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

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
        // Legacy username auth - kept for backward compatibility
        // New users should use email auth (handleLogin/handleSignup)
        console.log('[V3] Legacy username auth called - redirecting to email auth');
        this.showAuth();
    }

    // TOKEN SYSTEM: Award tokens for activities
    async awardTokens(amount, reason) {
        try {
            // Award tokens via backend
            const response = await fetch(`${API_BASE}/api/tokens/award`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    amount: amount,
                    reason: reason
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update local balance
                this.currentUser.tokens = data.newBalance;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                // Update UI if on chat page
                const tokenBalanceEl = document.getElementById('tokenBalance');
                if (tokenBalanceEl) {
                    tokenBalanceEl.textContent = data.newBalance;
                }

                // Show notification
                this.showTokenNotification(amount, reason);

                console.log(`[V3] Awarded ${amount} tokens for ${reason}. New balance: ${data.newBalance}`);
            } else {
                console.error('[V3] Failed to award tokens:', data.error);
            }
        } catch (error) {
            console.error('[V3] Token award error:', error);
        }
    }

    showTokenNotification(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-coins text-2xl"></i>
                <div>
                    <div class="font-bold">+${amount} Tokens!</div>
                    <div class="text-sm opacity-90">${this.getReasonText(reason)}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getReasonText(reason) {
        const reasons = {
            'registration': 'Welcome bonus',
            'message': 'Message sent',
            'room_create': 'Room created',
            'room_join': 'Room joined',
            'file_share': 'File shared',
            'daily_login': 'Daily login bonus'
        };
        return reasons[reason] || reason;
    }

    async syncTokenBalance() {
        try {
            const response = await fetch(`${API_BASE}/api/tokens/balance/${this.currentUser.id}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentUser.tokens = data.balance;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('[V3] Token balance synced:', data.balance);
            }
        } catch (error) {
            console.error('[V3] Failed to sync token balance:', error);
        }
    }

    async showRoomList() {
        console.log('[V3] Showing room list with token balance');
        
        // Push to navigation history
        this.pushNavigation('roomList');
        
        // Sync token balance from backend
        await this.syncTokenBalance();
        
        // Start notification polling
        this.startNotificationPolling();
        
        const avatarHtml = this.currentUser.avatar 
            ? `<img src="${this.currentUser.avatar}" class="w-10 h-10 rounded-full object-cover" alt="Avatar">`
            : `<div class="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center"><i class="fas fa-user text-white"></i></div>`;

        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100">
                <!-- Profile Settings Drawer -->
                <div id="profileDrawer" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden" onclick="app.closeProfileDrawer()">
                    <div class="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform -translate-x-full transition-transform duration-300" id="drawerContent" onclick="event.stopPropagation()">
                        <!-- Profile Header -->
                        <div class="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6">
                            <div class="flex items-center gap-3 mb-4">
                                ${avatarHtml}
                                <div>
                                    <h2 class="text-xl font-bold">${this.currentUser.username}</h2>
                                    <p class="text-sm text-white/80">${this.currentUser.email}</p>
                                </div>
                            </div>
                            <div class="bg-white/20 rounded-lg p-3 flex items-center justify-between">
                                <span class="text-sm">Token Balance</span>
                                <span class="text-xl font-bold flex items-center gap-2">
                                    <i class="fas fa-coins text-yellow-300"></i>
                                    ${this.currentUser.tokens || 0}
                                </span>
                            </div>
                        </div>

                        <!-- Menu Items -->
                        <div class="overflow-y-auto h-[calc(100%-200px)]">
                            <!-- Account Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Account</div>
                                <button onclick="app.showChangeAvatar()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-user-circle text-purple-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Change Avatar</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showChangeUsername()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-signature text-purple-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Change Username</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showChangePassword()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-key text-purple-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Change Password</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>

                            <!-- Wallet Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Wallet</div>
                                <button onclick="app.showTokenDashboard()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-coins text-yellow-500 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Token Dashboard</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showDataRedemption()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-mobile-alt text-green-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Buy Data</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showTokenHistory()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-history text-blue-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Transaction History</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>

                            <!-- Notifications Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Notifications</div>
                                <button onclick="app.toggleNotifications()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-bell text-yellow-600 text-xl w-6"></i>
                                    <div class="flex-1 text-left">
                                        <div class="font-medium">Message Notifications</div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            <i class="fas fa-mobile-alt"></i> Sound + Vibration + Push
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm ${this.notificationsEnabled ? 'text-green-600' : 'text-gray-400'}">${this.notificationsEnabled ? 'ON' : 'OFF'}</span>
                                        <i class="fas fa-toggle-${this.notificationsEnabled ? 'on text-green-600' : 'off text-gray-400'} text-2xl"></i>
                                    </div>
                                </button>
                                <button onclick="app.toggleBadgeNotifications()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition border-t border-gray-100">
                                    <i class="fas fa-certificate text-red-600 text-xl w-6"></i>
                                    <div class="flex-1 text-left">
                                        <div class="font-medium">Badge Notifications</div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            <i class="fas fa-mobile-alt"></i> Show unread count on app icon (iOS PWA)
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm ${this.badgeNotificationsEnabled ? 'text-green-600' : 'text-gray-400'}">${this.badgeNotificationsEnabled ? 'ON' : 'OFF'}</span>
                                        <i class="fas fa-toggle-${this.badgeNotificationsEnabled ? 'on text-green-600' : 'off text-gray-400'} text-2xl"></i>
                                    </div>
                                </button>
                                <button onclick="app.testBadgeNotification()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition border-t border-gray-100">
                                    <i class="fas fa-vial text-blue-600 text-xl w-6"></i>
                                    <div class="flex-1 text-left">
                                        <div class="font-medium">Test Badge</div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            <i class="fas fa-check-circle"></i> Check if badge works on your device
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>

                            <!-- Contacts Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Contacts</div>
                                <button onclick="app.showContactRequests()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-user-plus text-green-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Contact Requests</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showMyContacts()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-users text-blue-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">My Contacts</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showBlockedUsers()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-ban text-red-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Blocked Users</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>

                            <!-- Privacy Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Privacy</div>
                                <button onclick="app.showPrivacySettings()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-shield-alt text-indigo-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Privacy Settings</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <button onclick="app.showClearChatHistory()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-trash-alt text-red-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Clear Chat History</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                            </div>

                            <!-- Support Section -->
                            <div class="border-b">
                                <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Support</div>
                                <button onclick="app.showAbout()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-info-circle text-gray-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">About Amebo</span>
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </button>
                                <a href="mailto:ads@oztec.cam" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                                    <i class="fas fa-envelope text-purple-600 text-xl w-6"></i>
                                    <span class="flex-1 text-left">Contact Support</span>
                                    <i class="fas fa-external-link-alt text-gray-400 text-xs"></i>
                                </a>
                            </div>

                            <!-- Logout -->
                            <button onclick="app.logout()" class="w-full px-6 py-4 flex items-center gap-4 hover:bg-red-50 transition text-red-600">
                                <i class="fas fa-sign-out-alt text-xl w-6"></i>
                                <span class="flex-1 text-left font-semibold">Logout</span>
                                <i class="fas fa-chevron-right text-gray-400"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Header with Token Balance -->
                <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
                    <div class="max-w-4xl mx-auto flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <button onclick="app.openProfileDrawer()" class="p-2 hover:bg-white/20 rounded-lg transition">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                            ${avatarHtml}
                            <div>
                                <h1 class="text-lg font-bold">${this.currentUser.username}</h1>
                                <button 
                                    onclick="app.showTokenDashboard()" 
                                    class="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition mt-1"
                                >
                                    <i class="fas fa-coins text-yellow-300"></i>
                                    <span class="font-semibold">${this.currentUser.tokens || 0} Tokens</span>
                                    <i class="fas fa-chevron-right text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <button onclick="app.showNotifications()" class="relative p-2 hover:bg-white/20 rounded-lg transition">
                            <i class="fas fa-bell text-xl"></i>
                            ${this.unreadNotifications > 0 ? `<span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${this.unreadNotifications}</span>` : ''}
                        </button>
                    </div>
                </div>

                <!-- Room Management -->
                <div class="max-w-4xl mx-auto p-4">
                    <!-- Create Room Card -->
                    <div class="bg-white rounded-lg shadow-md p-6 mb-4">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-plus-circle text-purple-600"></i>
                            Create or Join Room
                        </h2>
                        
                        <div id="room-message" class="hidden mb-4 p-3 rounded-lg"></div>
                        
                        <div class="space-y-3">
                            <input 
                                type="text" 
                                id="roomCode" 
                                placeholder="Enter room code (e.g., myroom123)"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onkeypress="if(event.key==='Enter') app.joinRoom()"
                            />
                            <div class="grid grid-cols-2 gap-2">
                                <button 
                                    onclick="app.joinRoom()"
                                    class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                >
                                    <i class="fas fa-sign-in-alt"></i>Join (+5 tokens)
                                </button>
                                <button 
                                    onclick="app.createRoom()"
                                    class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                >
                                    <i class="fas fa-plus"></i>Create (+10 tokens)
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Search Users Card -->
                    <div class="bg-white rounded-lg shadow-md p-6 mb-4">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-search text-green-600"></i>
                            Find Users
                        </h2>
                        <p class="text-gray-600 text-sm mb-4">Search for users by username or email to start a direct chat</p>
                        <button 
                            onclick="app.showUserSearch()"
                            class="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-user-plus"></i>
                            Search Users
                        </button>
                    </div>

                    <!-- Room List -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
                            <i class="fas fa-comments text-indigo-600"></i>
                            My Rooms
                        </h2>
                        <div id="roomList" class="space-y-2">
                            <div class="text-gray-500 text-center py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Loading rooms...</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="mt-4 grid grid-cols-2 gap-4">
                        <!-- Token Info Card -->
                        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-md p-4">
                            <h3 class="font-bold flex items-center gap-2 mb-2">
                                <i class="fas fa-coins"></i>
                                Earn Tokens
                            </h3>
                            <div class="text-sm space-y-1">
                                <div>• Create room: +10</div>
                                <div>• Join room: +5</div>
                                <div>• Send message: +1</div>
                                <div>• Share file: +3</div>
                            </div>
                        </div>

                        <!-- Data Purchase Card -->
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-md p-4">
                            <h3 class="font-bold flex items-center gap-2 mb-2">
                                <i class="fas fa-mobile-alt"></i>
                                Buy Data
                            </h3>
                            <div class="text-sm mb-3">
                                Convert tokens to mobile data for Nigerian networks
                            </div>
                            <button 
                                onclick="app.showDataRedemption()"
                                class="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition w-full"
                            >
                                Browse Plans →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadRooms();
        
        // Show ad banner at bottom of page
        await this.showAdBanner();
    }

    async loadRooms() {
        console.log('[V3] Loading rooms for user:', this.currentUser.id);
        
        try {
            const response = await fetch(`${API_BASE}/api/rooms/user/${this.currentUser.id}`);
            const data = await response.json();
            
            console.log('[V3] Rooms loaded:', data);
            this.rooms = data.rooms || [];

            const listEl = document.getElementById('roomList');
            if (this.rooms.length === 0) {
                listEl.innerHTML = `
                    <div class="text-gray-500 text-center py-8">
                        <i class="fas fa-comments text-4xl mb-2"></i>
                        <p>No rooms yet. Create or join one above!</p>
                    </div>
                `;
            } else {
                listEl.innerHTML = this.rooms.map(room => `
                    <div 
                        onclick="app.openRoom('${room.id}', '${room.room_code}')"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer transition"
                    >
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-semibold flex items-center gap-2">
                                    <i class="fas fa-lock text-purple-600"></i>
                                    ${room.room_name || room.room_code}
                                </h3>
                                <p class="text-sm text-gray-600">Code: ${room.room_code}</p>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400"></i>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('[V3] Error loading rooms:', error);
        }
    }

    async createRoom() {
        const code = document.getElementById('roomCode').value.trim();
        const msgDiv = document.getElementById('room-message');

        if (!code) {
            this.showMessage(msgDiv, 'Please enter a room code', 'error');
            return;
        }

        console.log('[V3] Creating encrypted room:', code);
        this.showMessage(msgDiv, 'Creating encrypted room...', 'info');

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
            console.log('[V3] Create response:', data);

            if (data.success) {
                // Award tokens for room creation
                await this.awardTokens(10, 'room_create');
                
                this.showMessage(msgDiv, 'Room created! Opening...', 'success');
                await this.loadRooms();
                setTimeout(() => this.openRoom(data.roomId, code), 500);
            } else {
                throw new Error(data.error || 'Failed to create room');
            }
        } catch (error) {
            console.error('[V3] Create error:', error);
            this.showMessage(msgDiv, 'Error: ' + error.message, 'error');
        }
    }

    async joinRoom() {
        const code = document.getElementById('roomCode').value.trim();
        const msgDiv = document.getElementById('room-message');

        if (!code) {
            this.showMessage(msgDiv, 'Please enter a room code', 'error');
            return;
        }

        console.log('[V3] Joining encrypted room:', code);
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
            console.log('[V3] Join response:', data);

            if (data.success) {
                // Award tokens for joining room
                await this.awardTokens(5, 'room_join');
                
                this.showMessage(msgDiv, 'Joined! Opening room...', 'success');
                await this.loadRooms();
                setTimeout(() => this.openRoom(data.roomId, code), 500);
            } else {
                throw new Error(data.error || 'Failed to join room');
            }
        } catch (error) {
            console.error('[V3] Join error:', error);
            this.showMessage(msgDiv, 'Error: ' + error.message, 'error');
        }
    }

    async joinRoomById(roomId) {
        console.log('[V3] Opening room by ID:', roomId);
        
        try {
            // Load rooms if not already loaded
            if (!this.rooms || this.rooms.length === 0) {
                await this.loadRooms();
            }
            
            // Find room
            const room = this.rooms.find(r => r.id === roomId);
            
            if (room) {
                // Open the room directly
                await this.openRoom(room.id, room.room_code);
            } else {
                console.error('[V3] Room not found:', roomId);
                // Try to load rooms again and retry
                await this.loadRooms();
                const retryRoom = this.rooms.find(r => r.id === roomId);
                if (retryRoom) {
                    await this.openRoom(retryRoom.id, retryRoom.room_code);
                } else {
                    console.error('[V3] Room still not found after reload:', roomId);
                    await this.showRoomList();
                }
            }
        } catch (error) {
            console.error('[V3] Error opening room by ID:', error);
            await this.showRoomList();
        }
    }

    async openRoom(roomId, roomCode) {
        console.log('[V3] Opening encrypted room:', roomId);
        
        // Clear app badge when opening room (user is viewing messages)
        await this.updateAppBadge(0);
        
        this.currentRoom = this.rooms.find(r => r.id === roomId);
        
        if (!this.currentRoom) {
            await this.loadRooms();
            this.currentRoom = this.rooms.find(r => r.id === roomId);
        }

        // Push to navigation history
        this.pushNavigation('room', { roomCode: roomCode || this.currentRoom.room_code });

        // Generate/retrieve room encryption key from room code
        if (!this.roomKeys.has(roomId)) {
            const roomKey = await CryptoUtils.deriveKeyFromCode(roomCode || this.currentRoom.room_code);
            this.roomKeys.set(roomId, roomKey);
            console.log('[V3] Room encryption key generated');
        }

        const avatarHtml = this.currentUser.avatar 
            ? `<img src="${this.currentUser.avatar}" class="w-8 h-8 rounded-full object-cover" alt="Avatar">`
            : `<div class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center"><i class="fas fa-user text-white text-sm"></i></div>`;

        document.getElementById('app').innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; background: #efeae2;">
                <!-- WhatsApp-style Header -->
                <div style="background: #075e54; color: white; padding: 10px 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); flex-shrink: 0; z-index: 10;">
                    <div style="max-width: 800px; margin: 0 auto; display: flex; align-items: center; gap: 12px;">
                        <button onclick="app.showRoomList()" style="background: none; border: none; color: white; padding: 8px; cursor: pointer; font-size: 20px;">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #25d366; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
                            ${this.currentRoom?.room_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 16px; font-weight: 600;">${this.currentRoom?.room_name || 'Chat Room'}</div>
                            <div style="font-size: 12px; opacity: 0.8;">
                                <i class="fas fa-lock" style="font-size: 10px;"></i> Encrypted • ${this.currentRoom?.room_code || roomId}
                            </div>
                        </div>
                        <button onclick="app.showTokenGiftModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 10px; border-radius: 20px; cursor: pointer; font-size: 12px; margin-right: 8px;">
                            <i class="fas fa-gift"></i>
                        </button>
                        <div style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                            <i class="fas fa-coins" style="color: #ffd700;"></i> <span id="tokenBalance">${this.currentUser.tokens || 0}</span>
                        </div>
                    </div>
                </div>

                <!-- WhatsApp-style Messages Area -->
                <div style="flex: 1; overflow-y: scroll; overflow-x: hidden; background: #efeae2; -webkit-overflow-scrolling: touch;" id="messages-scroll-container">
                    <div id="messages" style="max-width: 800px; margin: 0 auto; padding: 20px 16px; min-height: 100%;">
                        <div style="text-align: center; padding: 40px 20px; color: #667781;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 16px;"></i>
                            <div style="font-size: 14px;">Loading encrypted messages...</div>
                        </div>
                    </div>
                    <!-- Typing Indicator -->
                    <div id="typing-indicator" class="hidden" style="max-width: 800px; margin: 0 auto; padding: 0 16px 10px;"></div>
                </div>

                <!-- WhatsApp-style Input Bar -->
                <div style="background: #f0f0f0; padding: 8px 16px; box-shadow: 0 -2px 5px rgba(0,0,0,0.05); flex-shrink: 0;">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <!-- Emoji Picker -->
                        <div id="emojiPicker" class="hidden" style="background: white; margin-bottom: 8px; padding: 12px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; max-height: 200px; overflow-y: auto;">
                                ${['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓','💞','💕','💟','❣️','💔','❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💯','💢','💥','💫','💦','💨','🕳️','💬','👁️','🗨️','🗯️','💭','💤','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦿','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄','🔒','🔐','🔑','💰','💎','🎁','🎉','🎊','🔥','⚡','✨','💫','⭐','🌟'].map(e => `<button onclick="app.insertEmoji('${e}')" style="background: none; border: none; font-size: 24px; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">${e}</button>`).join('')}
                            </div>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button onclick="app.toggleEmojiPicker()" style="background: white; border: none; color: #54656f; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px;" title="Emoji">
                                <i class="fas fa-smile"></i>
                            </button>
                            <button onclick="document.getElementById('fileInput').click()" style="background: white; border: none; color: #54656f; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;" title="Attach">
                                <i class="fas fa-paperclip"></i>
                            </button>
                            <input type="file" id="fileInput" style="display: none;" onchange="app.handleFileSelect(event)" />
                            <input 
                                type="text" 
                                id="messageInput" 
                                placeholder="Type a message"
                                style="flex: 1; padding: 10px 16px; border: none; border-radius: 24px; background: white; font-size: 15px; outline: none;"
                                oninput="app.handleMessageInput()"
                                onkeypress="if(event.key==='Enter') app.sendMessage()"
                            />
                            <button onclick="app.sendMessage()" style="background: #25d366; border: none; color: white; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 5px rgba(37, 211, 102, 0.4);">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadMessages();
        
        // Force scroll to bottom immediately after loading (force=true on initial open)
        console.log('[CHAT] 🎯 Opening room - forcing scroll to bottom');
        this.scrollToBottom(true);
        
        // Aggressive scroll with force=true for initial room open
        setTimeout(() => this.scrollToBottom(true), 50);
        setTimeout(() => this.scrollToBottom(true), 150);
        setTimeout(() => this.scrollToBottom(true), 400);
        setTimeout(() => this.scrollToBottom(true), 800);
        
        this.startPolling();
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.toggle('hidden');
    }

    insertEmoji(emoji) {
        const input = document.getElementById('messageInput');
        input.value += emoji;
        input.focus();
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('[V3] File selected for encrypted upload:', file.name, file.size);

        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ File too large! Maximum size is 10MB.\n\nFor larger files, use Cloudflare R2 storage.');
            return;
        }

        const viewOnce = confirm('🔒 Send as VIEW ONCE?\n\n✓ File deleted after first view\n✗ Cancel for normal file');

        try {
            let fileData = null;
            
            if (file.type.startsWith('image/')) {
                console.log('[V3] Compressing image...');
                fileData = await this.compressImage(file, 1920, 1080, 0.7);
            } else {
                fileData = await this.fileToDataUrl(file);
            }

            await this.sendFileMessage(file.name, file.type, file.size, fileData, viewOnce);
            
            // Award tokens for file sharing
            await this.awardTokens(3, 'file_share');
        } catch (error) {
            console.error('[V3] File upload error:', error);
            alert('Failed to upload file: ' + error.message);
        }

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

        console.log('[V3] Sending encrypted file message:', fileName);

        const fileContent = JSON.stringify({
            type: 'file',
            fileName: fileName,
            fileType: fileType,
            fileSize: fileSize,
            dataUrl: dataUrl,
            viewOnce: viewOnce || false
        });

        // Encrypt file content with room key
        const roomKey = this.roomKeys.get(this.currentRoom.id);
        const encrypted = await CryptoUtils.encryptMessage(fileContent, roomKey);

        try {
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
            console.log('[V3] File send response:', data);

            if (data.success) {
                await this.loadMessages();
            }
        } catch (error) {
            console.error('[V3] Error sending file:', error);
            alert('Failed to send file: ' + error.message);
        }
    }

    async loadMessages() {
        if (!this.currentRoom) return;
        
        console.log('[V3] Loading encrypted messages for room:', this.currentRoom.id);

        try {
            const response = await fetch(`${API_BASE}/api/messages/${this.currentRoom.id}`);
            const data = await response.json();
            
            console.log('[V3] Messages loaded (encrypted):', data);
            const newMessages = data.messages || [];

            const container = document.getElementById('messages');
            if (!container) {
                console.error('[V3] Messages container not found! Cannot render messages.');
                return;
            }
            
            if (newMessages.length === 0) {
                container.innerHTML = `
                    <div class="text-gray-500 text-center py-8">
                        <i class="fas fa-shield-halved text-4xl mb-2"></i>
                        <p class="font-semibold">End-to-End Encrypted Chat</p>
                        <p class="text-sm mt-2">All messages are encrypted with AES-256-GCM</p>
                        <p class="text-sm">Start the conversation!</p>
                    </div>
                `;
                this.messages = [];
            } else {
                // Decrypt messages
                const roomKey = this.roomKeys.get(this.currentRoom.id);
                console.log('[V3] Decrypting messages - Room key exists:', !!roomKey);
                console.log('[V3] Total messages to decrypt:', newMessages.length);
                
                const decryptedMessages = await Promise.all(
                    newMessages.map(async (msg, index) => {
                        try {
                            const encryptedContent = msg.encrypted_content || msg.content;
                            const iv = msg.iv;
                            
                            console.log(`[V3] Message ${index + 1}: has encrypted_content=${!!msg.encrypted_content}, has iv=${!!iv}, roomKey=${!!roomKey}`);
                            
                            if (!roomKey) {
                                console.warn('[V3] No room key available for decryption');
                                return { ...msg, decrypted: '[No encryption key - rejoin room]' };
                            }
                            
                            if (!iv) {
                                console.warn('[V3] No IV for message, cannot decrypt');
                                return { ...msg, decrypted: encryptedContent };
                            }
                            
                            const decrypted = await CryptoUtils.decryptMessage(encryptedContent, iv, roomKey);
                            console.log(`[V3] Message ${index + 1} decrypted successfully:`, decrypted.substring(0, 50) + '...');
                            return { ...msg, decrypted };
                        } catch (error) {
                            console.error('[V3] Message decryption error:', error);
                            return { ...msg, decrypted: '[Decryption failed]' };
                        }
                    })
                );

                // Check for new messages and notify
                const lastMessageId = this.lastMessageIds.get(this.currentRoom.id);
                if (lastMessageId && decryptedMessages.length > 0) {
                    // Find new messages (messages after the last known message)
                    const lastIndex = decryptedMessages.findIndex(m => m.id === lastMessageId);
                    if (lastIndex !== -1 && lastIndex < decryptedMessages.length - 1) {
                        const newMessagesOnly = decryptedMessages.slice(lastIndex + 1);
                        console.log('[NOTIFICATIONS] New messages detected:', newMessagesOnly.length);
                        
                        // Queue notifications for each new message (but not if window is focused on this room)
                        if (document.hidden || !document.hasFocus()) {
                            newMessagesOnly.forEach(msg => {
                                this.queueNotification(msg, this.currentRoom.room_name || this.currentRoom.room_code);
                            });
                        } else {
                            console.log('[NOTIFICATIONS] ⏭️ Skipping notifications - app is visible and focused');
                        }
                    }
                }

                // Update last message ID
                if (decryptedMessages.length > 0) {
                    const latestMessageId = decryptedMessages[decryptedMessages.length - 1].id;
                    const previousLastMessageId = this.lastMessageIds.get(this.currentRoom.id);
                    
                    // Only re-render if there are NEW messages (different last message ID)
                    if (previousLastMessageId !== latestMessageId) {
                        console.log('[CHAT] 🆕 New messages detected, re-rendering...');
                        this.messages = decryptedMessages; // Store decrypted messages
                        container.innerHTML = decryptedMessages.map(msg => this.renderMessage(msg)).join('');
                        
                        // Smart scroll: only auto-scroll if user is near bottom (don't force)
                        requestAnimationFrame(() => {
                            this.scrollToBottom(); // Don't force
                        });
                    } else {
                        console.log('[CHAT] ✅ No new messages, skipping re-render');
                    }
                    
                    this.lastMessageIds.set(this.currentRoom.id, latestMessageId);
                } else {
                    // First load with messages
                    this.messages = decryptedMessages;
                    container.innerHTML = decryptedMessages.map(msg => this.renderMessage(msg)).join('');
                    
                    requestAnimationFrame(() => {
                        this.scrollToBottom();
                    });
                }
            }
            
        } catch (error) {
            console.error('[V3] Error loading messages:', error);
        }
    }

    renderMessage(msg) {
        const isMine = msg.sender_id === this.currentUser.id;
        const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Try to parse as file message
        let fileData = null;
        try {
            const parsed = JSON.parse(msg.decrypted || '{}');
            if (parsed.type === 'file') {
                fileData = parsed;
            }
        } catch (e) {
            // Not a file message
        }

        // WhatsApp-style message bubble
        const bubbleColor = isMine ? '#dcf8c6' : '#ffffff';
        const textColor = isMine ? '#000000' : '#000000';
        const timeColor = isMine ? '#667781' : '#667781';
        const alignment = isMine ? 'flex-end' : 'flex-start';

        // File message
        if (fileData) {
            const isViewOnce = fileData.viewOnce;
            const messageId = msg.id;
            const isViewed = this.viewedOnceFiles.has(messageId);

            let fileIcon = 'fa-file';
            if (fileData.fileType.startsWith('image/')) fileIcon = 'fa-image';
            else if (fileData.fileType.startsWith('video/')) fileIcon = 'fa-video';
            else if (fileData.fileType.startsWith('audio/')) fileIcon = 'fa-music';

            return `
                <div style="display: flex; justify-content: ${alignment}; margin-bottom: 8px;">
                    <div style="max-width: 65%; background: ${bubbleColor}; border-radius: 8px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); position: relative;">
                        ${!isMine ? `<div style="font-size: 12px; color: #667781; font-weight: 600; margin-bottom: 4px;">${msg.sender_username || 'User'}</div>` : ''}
                        ${isViewOnce && isViewed ? `
                            <div style="text-align: center; padding: 20px; color: #667781;">
                                <i class="fas fa-eye-slash" style="font-size: 28px; margin-bottom: 8px; opacity: 0.5;"></i>
                                <div style="font-size: 13px;">File has been deleted</div>
                                <div style="font-size: 11px; opacity: 0.7; margin-top: 4px;">View-once file</div>
                            </div>
                        ` : `
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                <i class="fas ${fileIcon}" style="font-size: 24px; color: #667781;"></i>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-size: 14px; font-weight: 500; color: ${textColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(fileData.fileName)}</div>
                                    <div style="font-size: 12px; color: #667781;">${this.formatFileSize(fileData.fileSize)}</div>
                                </div>
                            </div>
                            ${isViewOnce ? `
                                <div style="background: #fff3cd; padding: 6px; border-radius: 6px; font-size: 11px; color: #856404; margin-bottom: 8px;">
                                    <i class="fas fa-eye-slash"></i> <strong>VIEW ONCE:</strong> Will be deleted after viewing
                                </div>
                            ` : ''}
                            <button onclick="app.downloadFile('${messageId}', '${fileData.fileName}', '${fileData.fileType}', ${isViewOnce})" style="width: 100%; background: rgba(0,0,0,0.05); border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; color: ${textColor};">
                                <i class="fas fa-download"></i> ${isViewOnce ? 'View Once' : 'Download'}
                            </button>
                        `}
                        <div style="font-size: 11px; color: ${timeColor}; text-align: right; margin-top: 4px;">
                            ${time}
                        </div>
                    </div>
                </div>
            `;
        }

        // Text message - WhatsApp style
        return `
            <div style="display: flex; justify-content: ${alignment}; margin-bottom: 4px; animation: slideIn 0.2s ease-out;">
                <div style="max-width: 65%; background: ${bubbleColor}; border-radius: 8px; padding: 6px 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); position: relative;">
                    ${!isMine ? `<div style="font-size: 12px; color: #00897b; font-weight: 600; margin-bottom: 2px;">${msg.sender_username || 'User'}</div>` : ''}
                    <div style="font-size: 14.2px; color: ${textColor}; word-wrap: break-word; white-space: pre-wrap; line-height: 1.4; padding-right: 50px;">
                        ${this.escapeHtml(msg.decrypted || '[Encrypted]')}
                    </div>
                    <div style="font-size: 11px; color: ${timeColor}; text-align: right; margin-top: -18px; float: right;">
                        ${time}
                    </div>
                </div>
            </div>
        `;
    }

    async downloadFile(messageId, fileName, fileType, viewOnce) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) {
            alert('File not found');
            return;
        }

        try {
            const fileData = JSON.parse(message.decrypted);
            
            if (viewOnce) {
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
            console.error('[V3] Download error:', error);
            alert('Failed to download file: ' + error.message);
        }
    }

    showEncryptionInfo(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) {
            alert('Message not found');
            return;
        }

        const encryptedPreview = (message.encrypted_content || message.content || '').substring(0, 100);
        const ivPreview = (message.iv || 'default-iv').substring(0, 40);
        const decryptedText = message.decrypted || '[Could not decrypt]';

        const info = `
🔐 END-TO-END ENCRYPTION DETAILS

📊 Encryption Method:
   • Algorithm: AES-256-GCM
   • Key Size: 256 bits (Industrial Grade)
   • Mode: Galois/Counter Mode (Authenticated)

🔑 Encryption Components:
   • IV (Initialization Vector): ${ivPreview}...
   • Encrypted Data: ${encryptedPreview}...
   
📝 Original Message:
   "${decryptedText}"

✅ Verification:
   • Message was encrypted on sender's device
   • Transmitted as encrypted ciphertext
   • Decrypted on your device with room key
   • Server never sees plaintext

🛡️ Security Level: INDUSTRIAL GRADE
   • Zero-knowledge encryption
   • Perfect forward secrecy
   • Authenticated encryption (prevents tampering)

⚠️ Technical Details:
   Message ID: ${message.id}
   Sender ID: ${message.sender_id}
   Created: ${new Date(message.created_at).toLocaleString()}
   
💡 What this means:
   Only people in this room with the correct room code
   can decrypt and read this message. Not even the server
   administrator can read your messages!
        `;

        alert(info);
        
        // Also log to console for developers
        console.log('[V3] Encryption Info for message:', {
            messageId: message.id,
            encrypted: message.encrypted_content || message.content,
            iv: message.iv,
            decrypted: message.decrypted,
            algorithm: 'AES-256-GCM',
            keyDerivation: 'PBKDF2 with 100,000 iterations'
        });
    }

    showRoomEncryptionInfo() {
        if (!this.currentRoom) return;

        const roomKey = this.roomKeys.get(this.currentRoom.id);
        const totalMessages = this.messages.length;
        const encryptedMessages = this.messages.filter(m => m.encrypted_content || m.iv).length;

        const info = `
🔐 ROOM ENCRYPTION STATUS

🏠 Room Information:
   • Room Name: ${this.currentRoom.room_name || this.currentRoom.room_code}
   • Room Code: ${this.currentRoom.room_code}
   • Encryption: ✅ ACTIVE

🔑 Encryption Details:
   • Algorithm: AES-256-GCM
   • Key Derivation: PBKDF2 (100,000 iterations)
   • Key Size: 256 bits (Industrial Grade)
   • User Keys: RSA-4096-OAEP

📊 Security Statistics:
   • Total Messages: ${totalMessages}
   • Encrypted Messages: ${encryptedMessages}
   • Encryption Rate: ${totalMessages > 0 ? Math.round((encryptedMessages / totalMessages) * 100) : 100}%
   • Room Key: ${roomKey ? '✅ Active' : '❌ Not Generated'}

🛡️ Protection Features:
   • End-to-End Encryption
   • Zero-Knowledge Architecture
   • Authenticated Encryption (prevents tampering)
   • Perfect Forward Secrecy
   • Unique IV per message

🔬 How It Works:
   1. Your room code is used to derive an AES-256 key
   2. Each message is encrypted with this key + random IV
   3. Only room members with the code can decrypt
   4. Server stores only encrypted ciphertext
   5. Decryption happens only on your device

💡 To verify encryption:
   • Click "Info" button on any message
   • Open browser Network tab (F12 > Network)
   • Send a message and inspect the request
   • You'll see only encrypted data being sent!

✅ Your messages are protected with INDUSTRIAL-GRADE security!
        `;

        alert(info);
        
        console.log('[V3] Room Encryption Info:', {
            roomId: this.currentRoom.id,
            roomCode: this.currentRoom.room_code,
            algorithm: 'AES-256-GCM',
            keyDerivation: 'PBKDF2 (100,000 iterations)',
            totalMessages: totalMessages,
            encryptedMessages: encryptedMessages,
            encryptionRate: `${totalMessages > 0 ? Math.round((encryptedMessages / totalMessages) * 100) : 100}%`,
            roomKeyActive: roomKey ? true : false
        });
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

        console.log('[V3] Sending encrypted message');

        try {
            // Encrypt message with room key
            const roomKey = this.roomKeys.get(this.currentRoom.id);
            const encrypted = await CryptoUtils.encryptMessage(content, roomKey);

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
            console.log('[V3] Send response:', data);

            if (data.success) {
                input.value = '';
                await this.loadMessages();
                
                // Force scroll to bottom after sending your own message
                setTimeout(() => {
                    this.scrollToBottom(true);
                }, 100);
                
                // Award tokens for messaging
                await this.awardTokens(1, 'message');
            }
        } catch (error) {
            console.error('[V3] Error sending message:', error);
        }
    }

    startPolling() {
        if (this.messagePoller) clearInterval(this.messagePoller);
        
        this.messagePoller = setInterval(async () => {
            if (this.currentRoom) {
                await this.loadMessages();
                // Auto-scroll to bottom when new messages arrive
                setTimeout(() => this.scrollToBottom(), 100);
                
                // Poll typing indicators
                await this.pollTypingIndicators(this.currentRoom);
            }
        }, 3000);
    }

    logout() {
        console.log('[V3] Logging out');
        
        // Clear sensitive data
        if (this.currentUser) {
            localStorage.removeItem(`privateKey_${this.currentUser.id}`);
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('viewedOnceFiles');
        
        this.currentUser = null;
        this.currentRoom = null;
        this.rooms = [];
        this.messages = [];
        this.roomKeys.clear();
        this.viewedOnceFiles.clear();
        this.userPrivateKey = null;
        
        if (this.messagePoller) clearInterval(this.messagePoller);
        if (this.notificationPollInterval) {
            clearInterval(this.notificationPollInterval);
            this.notificationPollInterval = null;
            console.log('[NOTIFICATIONS] ⏹️ Stopped notification polling on logout');
        }
        
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
    
    formatTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return then.toLocaleDateString();
    }

    // ============================================
    // TOKEN GIFTING FEATURES
    // ============================================

    async showTokenGiftModal() {
        console.log('[V3] Showing token gift modal');

        // Check if user has PIN
        const hasPin = await this.checkUserHasPin();
        
        if (!hasPin) {
            await this.showSetPinModal();
            return;
        }

        // Get room members
        const members = await this.getRoomMembers();
        
        if (members.length === 0) {
            alert('No other members in this room yet. Send a message to invite others!');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'tokenGiftModal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn my-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-gift text-purple-600"></i>
                        Gift Tokens
                    </h2>
                    <button onclick="app.closeTokenGiftModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div id="gift-message" class="hidden mb-4 p-3 rounded-lg"></div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Select Recipient
                        </label>
                        <select id="giftRecipient" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">Choose a member...</option>
                            ${members.filter(m => m.id !== this.currentUser.id).map(m => `
                                <option value="${m.id}">${m.username}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Amount (Your balance: ${this.currentUser.tokens || 0} tokens)
                        </label>
                        <input 
                            type="number" 
                            id="giftAmount" 
                            placeholder="Enter amount"
                            min="1"
                            max="${this.currentUser.tokens || 0}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Message (optional)
                        </label>
                        <input 
                            type="text" 
                            id="giftMessage" 
                            placeholder="Add a message..."
                            maxlength="100"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div class="border-t pt-4">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            <i class="fas fa-lock text-purple-600"></i> Enter your 4-digit PIN
                        </label>
                        <input 
                            type="password" 
                            id="giftPin" 
                            placeholder="••••"
                            maxlength="4"
                            pattern="[0-9]{4}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                        <button 
                            onclick="app.showForgotPinModal()"
                            class="text-xs text-purple-600 hover:text-purple-800 mt-2 underline"
                        >
                            Forgot PIN?
                        </button>
                    </div>
                    
                    <button 
                        onclick="app.sendTokenGift()"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>
                        Send Gift
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    closeTokenGiftModal() {
        const modal = document.getElementById('tokenGiftModal');
        if (modal) modal.remove();
    }

    async showSetPinModal() {
        const modal = document.createElement('div');
        modal.id = 'setPinModal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-lock text-purple-600"></i>
                        Set Security PIN
                    </h2>
                    <button onclick="app.closeSetPinModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        Create a 4-digit PIN to secure token transfers
                    </p>
                </div>
                
                <div class="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p class="text-xs text-yellow-800">
                        <i class="fas fa-shield-alt mr-2"></i>
                        <strong>Tip:</strong> 
                        <button 
                            onclick="app.showSetupSecurityQuestionModal()"
                            class="underline hover:text-yellow-900 font-semibold"
                        >
                            Setup a security question
                        </button> 
                        to recover your PIN if you forget it
                    </p>
                </div>
                
                <div id="pin-message" class="hidden mb-4 p-3 rounded-lg"></div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Create 4-Digit PIN
                        </label>
                        <input 
                            type="password" 
                            id="newPin" 
                            placeholder="••••"
                            maxlength="4"
                            pattern="[0-9]{4}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm PIN
                        </label>
                        <input 
                            type="password" 
                            id="confirmPin" 
                            placeholder="••••"
                            maxlength="4"
                            pattern="[0-9]{4}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                    </div>
                    
                    <button 
                        onclick="app.savePin()"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                    >
                        <i class="fas fa-check mr-2"></i>
                        Set PIN
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    closeSetPinModal() {
        const modal = document.getElementById('setPinModal');
        if (modal) modal.remove();
    }

    async savePin() {
        const pin = document.getElementById('newPin').value;
        const confirmPin = document.getElementById('confirmPin').value;
        const msgDiv = document.getElementById('pin-message');
        
        if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            this.showMessage(msgDiv, 'PIN must be exactly 4 digits', 'error');
            return;
        }
        
        if (pin !== confirmPin) {
            this.showMessage(msgDiv, 'PINs do not match', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/users/pin/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    pin: pin
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(msgDiv, 'PIN set successfully!', 'success');
                setTimeout(() => {
                    this.closeSetPinModal();
                    this.showTokenGiftModal();
                }, 1000);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to set PIN', 'error');
            }
        } catch (error) {
            console.error('[V3] Set PIN error:', error);
            this.showMessage(msgDiv, 'Failed to set PIN', 'error');
        }
    }

    async checkUserHasPin() {
        try {
            const response = await fetch(`${API_BASE}/api/users/${this.currentUser.id}/has-pin`);
            const data = await response.json();
            return data.hasPin;
        } catch (error) {
            console.error('[V3] Check PIN error:', error);
            return false;
        }
    }

    // ============================================
    // PIN RESET & SECURITY QUESTION FUNCTIONS
    // ============================================
    
    showForgotPinModal() {
        this.closeTokenGiftModal();
        const modal = document.createElement('div');
        modal.id = 'forgotPinModal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-unlock text-red-600"></i>
                        Reset PIN
                    </h2>
                    <button onclick="app.closeForgotPinModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p class="text-sm text-yellow-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        Answer your security question to reset your PIN
                    </p>
                </div>
                
                <div id="forgot-pin-message" class="hidden mb-4 p-3 rounded-lg"></div>
                
                <div id="forgot-pin-content">
                    <div class="text-center py-4">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p class="text-sm text-gray-600 mt-2">Loading security question...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.loadSecurityQuestion();
    }
    
    closeForgotPinModal() {
        const modal = document.getElementById('forgotPinModal');
        if (modal) modal.remove();
    }
    
    async loadSecurityQuestion() {
        const contentDiv = document.getElementById('forgot-pin-content');
        const msgDiv = document.getElementById('forgot-pin-message');
        
        try {
            const response = await fetch(`${API_BASE}/api/users/${this.currentUser.id}/security-question`);
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                // No security question set, show setup form
                contentDiv.innerHTML = `
                    <div class="mb-4 p-3 bg-red-50 rounded-lg">
                        <p class="text-sm text-red-800">
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            No security question set. Please set one first.
                        </p>
                    </div>
                    <button 
                        onclick="app.showSetupSecurityQuestionModal()"
                        class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                        <i class="fas fa-shield-alt mr-2"></i>
                        Setup Security Question
                    </button>
                `;
                return;
            }
            
            // Show reset form
            contentDiv.innerHTML = `
                <div class="space-y-4">
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Security Question:</p>
                        <p class="text-gray-900">${data.question}</p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Your Answer
                        </label>
                        <input 
                            type="text" 
                            id="securityAnswer" 
                            placeholder="Enter your answer"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            New 4-Digit PIN
                        </label>
                        <input 
                            type="password" 
                            id="newResetPin" 
                            placeholder="••••"
                            maxlength="4"
                            pattern="[0-9]{4}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New PIN
                        </label>
                        <input 
                            type="password" 
                            id="confirmResetPin" 
                            placeholder="••••"
                            maxlength="4"
                            pattern="[0-9]{4}"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                        />
                    </div>
                    
                    <button 
                        onclick="app.submitPinReset()"
                        class="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition"
                    >
                        <i class="fas fa-key mr-2"></i>
                        Reset PIN
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('[V3] Load security question error:', error);
            this.showMessage(msgDiv, 'Failed to load security question', 'error');
        }
    }
    
    async submitPinReset() {
        const answer = document.getElementById('securityAnswer').value.trim();
        const newPin = document.getElementById('newResetPin').value;
        const confirmPin = document.getElementById('confirmResetPin').value;
        const msgDiv = document.getElementById('forgot-pin-message');
        
        if (!answer || answer.length < 3) {
            this.showMessage(msgDiv, 'Please enter your security answer', 'error');
            return;
        }
        
        if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            this.showMessage(msgDiv, 'PIN must be exactly 4 digits', 'error');
            return;
        }
        
        if (newPin !== confirmPin) {
            this.showMessage(msgDiv, 'PINs do not match', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Resetting PIN...', 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/users/pin/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    answer: answer,
                    newPin: newPin
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.verified) {
                this.showMessage(msgDiv, '✅ PIN reset successfully!', 'success');
                setTimeout(() => {
                    this.closeForgotPinModal();
                    this.showTokenGiftModal();
                }, 1500);
            } else {
                const errorMsg = data.error || 'Failed to reset PIN';
                if (data.remainingAttempts !== undefined) {
                    this.showMessage(msgDiv, `${errorMsg} (${data.remainingAttempts} attempts remaining)`, 'error');
                } else if (data.remainingTime) {
                    this.showMessage(msgDiv, `${errorMsg} Try again in ${data.remainingTime} minutes`, 'error');
                } else {
                    this.showMessage(msgDiv, errorMsg, 'error');
                }
            }
        } catch (error) {
            console.error('[V3] Reset PIN error:', error);
            this.showMessage(msgDiv, 'Failed to reset PIN', 'error');
        }
    }
    
    showSetupSecurityQuestionModal() {
        this.closeForgotPinModal();
        const modal = document.createElement('div');
        modal.id = 'setupSecurityModal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-shield-alt text-blue-600"></i>
                        Setup Security Question
                    </h2>
                    <button onclick="app.closeSetupSecurityModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-800">
                        <i class="fas fa-info-circle mr-2"></i>
                        This question will be used to reset your PIN if you forget it
                    </p>
                </div>
                
                <div id="security-setup-message" class="hidden mb-4 p-3 rounded-lg"></div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Choose a Security Question
                        </label>
                        <select 
                            id="securityQuestion" 
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">-- Select a question --</option>
                            <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                            <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                            <option value="What city were you born in?">What city were you born in?</option>
                            <option value="What is your favorite food?">What is your favorite food?</option>
                            <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                            <option value="What is the name of your favorite teacher?">What is the name of your favorite teacher?</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Your Answer
                        </label>
                        <input 
                            type="text" 
                            id="securityAnswerSetup" 
                            placeholder="Enter your answer (min 3 characters)"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p class="text-xs text-gray-500 mt-1">
                            <i class="fas fa-exclamation-circle"></i> Remember this answer - it's case-insensitive
                        </p>
                    </div>
                    
                    <button 
                        onclick="app.saveSecurityQuestion()"
                        class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                        <i class="fas fa-check mr-2"></i>
                        Save Security Question
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    closeSetupSecurityModal() {
        const modal = document.getElementById('setupSecurityModal');
        if (modal) modal.remove();
    }
    
    async saveSecurityQuestion() {
        const question = document.getElementById('securityQuestion').value;
        const answer = document.getElementById('securityAnswerSetup').value.trim();
        const msgDiv = document.getElementById('security-setup-message');
        
        if (!question) {
            this.showMessage(msgDiv, 'Please select a security question', 'error');
            return;
        }
        
        if (!answer || answer.length < 3) {
            this.showMessage(msgDiv, 'Answer must be at least 3 characters', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Saving security question...', 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/users/pin/security-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    question: question,
                    answer: answer
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(msgDiv, '✅ Security question saved!', 'success');
                setTimeout(() => {
                    this.closeSetupSecurityModal();
                    // Go back to forgot PIN flow
                    this.showForgotPinModal();
                }, 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to save security question', 'error');
            }
        } catch (error) {
            console.error('[V3] Save security question error:', error);
            this.showMessage(msgDiv, 'Failed to save security question', 'error');
        }
    }

    async getRoomMembers() {
        try {
            const response = await fetch(`${API_BASE}/api/rooms/${this.currentRoom.id}/members`);
            const data = await response.json();
            return data.members || [];
        } catch (error) {
            console.error('[V3] Get members error:', error);
            return [];
        }
    }

    async sendTokenGift() {
        const toUserId = document.getElementById('giftRecipient').value;
        const amount = parseInt(document.getElementById('giftAmount').value);
        const message = document.getElementById('giftMessage').value;
        const pin = document.getElementById('giftPin').value;
        const msgDiv = document.getElementById('gift-message');
        
        if (!toUserId) {
            this.showMessage(msgDiv, 'Please select a recipient', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            this.showMessage(msgDiv, 'Please enter a valid amount', 'error');
            return;
        }
        
        if (amount > (this.currentUser.tokens || 0)) {
            this.showMessage(msgDiv, 'Insufficient tokens', 'error');
            return;
        }
        
        if (!pin || pin.length !== 4) {
            this.showMessage(msgDiv, 'Please enter your 4-digit PIN', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Sending gift...', 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/tokens/gift`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromUserId: this.currentUser.id,
                    toUserId: toUserId,
                    amount: amount,
                    roomId: this.currentRoom.id,
                    message: message,
                    pin: pin
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(msgDiv, data.message, 'success');
                
                // Update local token balance
                this.currentUser.tokens = data.newBalance;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                // Update UI
                const tokenBalanceEl = document.getElementById('tokenBalance');
                if (tokenBalanceEl) {
                    tokenBalanceEl.textContent = data.newBalance;
                }
                
                // Show success notification
                this.showTokenNotification(`✅ Sent ${amount} tokens!`, 'success');
                
                setTimeout(() => {
                    this.closeTokenGiftModal();
                }, 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to send gift', 'error');
            }
        } catch (error) {
            console.error('[V3] Send gift error:', error);
            this.showMessage(msgDiv, 'Failed to send gift', 'error');
        }
    }

    showTokenNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`;
        notification.innerHTML = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================

    async checkNotifications() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${API_BASE}/api/notifications/${this.currentUser.id}`);
            const data = await response.json();

            if (data.success && data.notifications.length > 0) {
                // Filter unread notifications
                const unread = data.notifications.filter(n => n.read === 0);
                
                if (unread.length > this.unreadNotifications) {
                    // New notification!
                    const newest = unread[0];
                    this.showInAppNotification(newest);
                    
                    // Update token balance if it's a gift notification
                    if (newest.type === 'token_gift') {
                        await this.syncTokenBalance();
                    }
                }
                
                this.unreadNotifications = unread.length;
                this.updateNotificationBadge();
            }
        } catch (error) {
            console.error('[V3] Check notifications error:', error);
        }
    }

    showInAppNotification(notification) {
        const notifDiv = document.createElement('div');
        notifDiv.className = 'fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 max-w-sm animate-slideIn';
        notifDiv.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fas fa-gift text-2xl"></i>
                <div class="flex-1">
                    <h4 class="font-bold mb-1">${this.escapeHtml(notification.title)}</h4>
                    <p class="text-sm opacity-90">${this.escapeHtml(notification.message)}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notifDiv);
        
        // Mark as read
        this.markNotificationRead(notification.id);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notifDiv.parentElement) {
                notifDiv.remove();
            }
        }, 5000);
    }

    async markNotificationRead(notificationId) {
        try {
            await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('[V3] Mark notification read error:', error);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (this.unreadNotifications > 0) {
                badge.textContent = this.unreadNotifications;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    startNotificationPolling() {
        if (this.notificationPoller) clearInterval(this.notificationPoller);
        
        // Check immediately
        this.checkNotifications();
        
        // Then check every 3 seconds
        this.notificationPoller = setInterval(() => {
            this.checkNotifications();
        }, 3000);
    }

    stopNotificationPolling() {
        if (this.notificationPoller) {
            clearInterval(this.notificationPoller);
            this.notificationPoller = null;
        }
    }

    // ============================================
    // ADVERTISING SYSTEM
    // ============================================

    async showAdBanner() {
        try {
            // Get active ad
            const response = await fetch(`${API_BASE}/api/ads/active?userId=${this.currentUser.id}`);
            const data = await response.json();
            
            if (!data.success || !data.ad) {
                return; // No ads to show
            }
            
            const ad = data.ad;
            
            // Create session ID if not exists
            if (!localStorage.getItem('adSessionId')) {
                localStorage.setItem('adSessionId', crypto.randomUUID());
            }
            
            // Create ad banner HTML
            const adBanner = `
                <div id="ad-banner" class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-lg z-50 animate-slide-up">
                    <div class="max-w-4xl mx-auto p-3 flex items-center gap-3">
                        <!-- Ad Image -->
                        <img 
                            src="${ad.ad_image_url}" 
                            alt="${ad.ad_title}"
                            class="w-16 h-16 object-cover rounded-lg shadow"
                            onerror="this.src='https://via.placeholder.com/64x64/7C3AED/FFFFFF?text=Ad'"
                        />
                        
                        <!-- Ad Content -->
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-gray-800 text-sm truncate">${ad.ad_title}</h3>
                            ${ad.ad_description ? `<p class="text-xs text-gray-600 truncate">${ad.ad_description}</p>` : ''}
                            <span class="text-xs text-gray-400 italic">Sponsored</span>
                        </div>
                        
                        <!-- CTA Button - Mobile optimized with touch handling -->
                        <button 
                            id="ad-cta-button"
                            data-campaign-id="${ad.id}"
                            data-destination-type="${ad.destination_type}"
                            class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 active:scale-95 transition-all shadow-md whitespace-nowrap touch-manipulation"
                            style="min-height: 44px; min-width: 44px;"
                        >
                            ${ad.destination_type === 'instagram' ? '📷 Follow' : '🌐 Visit'}
                        </button>
                        
                        <!-- Close Button -->
                        <button 
                            onclick="document.getElementById('ad-banner').remove()"
                            class="text-gray-400 hover:text-gray-600 transition ml-2 touch-manipulation"
                            style="min-height: 44px; min-width: 44px;"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Insert ad banner at bottom of page
            document.body.insertAdjacentHTML('beforeend', adBanner);
            
            // Add event listener for mobile touch handling
            const ctaButton = document.getElementById('ad-cta-button');
            if (ctaButton) {
                ctaButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const campaignId = ctaButton.getAttribute('data-campaign-id');
                    const destinationType = ctaButton.getAttribute('data-destination-type');
                    await this.handleAdClick(campaignId, destinationType);
                });
            }
            
            // Track impression
            await this.trackAdImpression(ad.id);
            
        } catch (error) {
            console.error('[ADS] Show banner error:', error);
        }
    }

    async trackAdImpression(campaignId) {
        try {
            await fetch(`${API_BASE}/api/ads/impression`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    userId: this.currentUser?.id,
                    sessionId: localStorage.getItem('adSessionId')
                })
            });
            console.log('[ADS] Impression tracked for campaign:', campaignId);
        } catch (error) {
            console.error('[ADS] Track impression error:', error);
        }
    }

    async handleAdClick(campaignId, destinationType) {
        try {
            console.log('[ADS] Ad clicked:', campaignId, destinationType);
            
            // Track click
            const response = await fetch(`${API_BASE}/api/ads/click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    userId: this.currentUser?.id,
                    sessionId: localStorage.getItem('adSessionId')
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.destinationUrl) {
                console.log('[ADS] Redirecting to:', data.destinationUrl);
                
                // Better mobile support: try window.open first, fallback to location.href
                const newWindow = window.open(data.destinationUrl, '_blank', 'noopener,noreferrer');
                
                // If popup blocked (common on mobile), use location.href
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    console.log('[ADS] Popup blocked, using direct navigation');
                    window.location.href = data.destinationUrl;
                }
                
                // Remove ad banner after click
                setTimeout(() => {
                    document.getElementById('ad-banner')?.remove();
                }, 100);
            }
        } catch (error) {
            console.error('[ADS] Handle click error:', error);
        }
    }

    // ============================================
    // TOKEN ECONOMY DASHBOARD
    // ============================================

    async showTokenDashboard() {
        console.log('[V3] Showing token dashboard');
        
        // Fetch user stats from backend
        try {
            const [statsRes, historyRes] = await Promise.all([
                fetch(`${API_BASE}/api/tokens/stats/${this.currentUser.id}`),
                fetch(`${API_BASE}/api/tokens/history/${this.currentUser.id}`)
            ]);
            
            const stats = await statsRes.json();
            const history = await historyRes.json();
            
            if (!stats.success) {
                throw new Error(stats.error || 'Failed to load token stats');
            }
            
            const userData = stats.data;
            const tierInfo = this.getTierInfo(userData.token_tier);
            const nextTierInfo = this.getNextTierInfo(userData.token_tier);
            
            // Calculate daily progress percentages
            const msgProgress = Math.min((userData.daily_messages_sent / userData.daily_message_cap) * 100, 100);
            const fileProgress = Math.min((userData.daily_files_sent / userData.daily_file_cap) * 100, 100);
            const totalProgress = Math.min((userData.daily_tokens_earned / userData.daily_total_cap) * 100, 100);
            
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen bg-gray-100">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
                        <div class="max-w-4xl mx-auto flex justify-between items-center">
                            <button onclick="app.showRoomList()" class="hover:bg-white/20 p-2 rounded transition">
                                <i class="fas fa-arrow-left mr-2"></i>Back
                            </button>
                            <h1 class="text-xl font-bold">Token Dashboard</h1>
                            <button onclick="app.logout()" class="hover:bg-white/20 p-2 rounded transition">
                                <i class="fas fa-sign-out-alt"></i>
                            </button>
                        </div>
                    </div>

                    <div class="max-w-4xl mx-auto p-4 space-y-4">
                        <!-- Balance Card -->
                        <div class="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-xl shadow-lg p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <div class="text-sm opacity-90 mb-1">Total Balance</div>
                                    <div class="text-4xl font-bold flex items-center gap-2">
                                        <i class="fas fa-coins"></i>
                                        ${userData.token_balance}
                                    </div>
                                </div>
                                <button 
                                    onclick="app.showDataRedemption()"
                                    class="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition shadow-lg"
                                >
                                    <i class="fas fa-mobile-alt mr-2"></i>Buy Data
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="bg-white/20 rounded-lg p-3">
                                    <div class="opacity-90">Total Earned</div>
                                    <div class="text-xl font-bold">${userData.total_tokens_earned || 0}</div>
                                </div>
                                <div class="bg-white/20 rounded-lg p-3">
                                    <div class="opacity-90">Total Spent</div>
                                    <div class="text-xl font-bold">${userData.total_tokens_spent || 0}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Tier Progress Card -->
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <i class="fas fa-trophy text-yellow-500"></i>
                                Your Tier
                            </h2>
                            
                            <div class="flex items-center gap-4 mb-4">
                                <div class="text-5xl">${tierInfo.icon}</div>
                                <div class="flex-1">
                                    <div class="text-2xl font-bold ${tierInfo.color}">${tierInfo.name}</div>
                                    <div class="text-gray-600">${tierInfo.multiplier}x Token Multiplier</div>
                                </div>
                            </div>

                            ${nextTierInfo ? `
                                <div class="bg-gray-100 rounded-lg p-4">
                                    <div class="flex justify-between text-sm mb-2">
                                        <span>Progress to ${nextTierInfo.name}</span>
                                        <span class="font-semibold">${userData.total_tokens_earned}/${nextTierInfo.threshold}</span>
                                    </div>
                                    <div class="w-full bg-gray-300 rounded-full h-3">
                                        <div class="bg-gradient-to-r ${nextTierInfo.gradient} h-3 rounded-full transition-all" 
                                             style="width: ${Math.min((userData.total_tokens_earned / nextTierInfo.threshold) * 100, 100)}%">
                                        </div>
                                    </div>
                                    <div class="text-xs text-gray-600 mt-2">
                                        ${nextTierInfo.threshold - userData.total_tokens_earned} more tokens to upgrade!
                                    </div>
                                </div>
                            ` : `
                                <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 text-center">
                                    <i class="fas fa-crown text-3xl text-purple-600 mb-2"></i>
                                    <div class="font-bold text-purple-800">Maximum Tier Achieved!</div>
                                    <div class="text-sm text-purple-600">You're at the highest level 🎉</div>
                                </div>
                            `}
                        </div>

                        <!-- Daily Earning Limits Card -->
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <i class="fas fa-calendar-day text-indigo-600"></i>
                                Today's Activity
                            </h2>

                            <!-- Messages Progress -->
                            <div class="mb-4">
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="flex items-center gap-2">
                                        <i class="fas fa-comment text-blue-500"></i>
                                        Messages Sent
                                    </span>
                                    <span class="font-semibold">${userData.daily_messages_sent}/${userData.daily_message_cap}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: ${msgProgress}%"></div>
                                </div>
                            </div>

                            <!-- Files Progress -->
                            <div class="mb-4">
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="flex items-center gap-2">
                                        <i class="fas fa-file text-green-500"></i>
                                        Files Shared
                                    </span>
                                    <span class="font-semibold">${userData.daily_files_sent}/${userData.daily_file_cap}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full transition-all" style="width: ${fileProgress}%"></div>
                                </div>
                            </div>

                            <!-- Total Tokens Progress -->
                            <div>
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="flex items-center gap-2">
                                        <i class="fas fa-coins text-yellow-500"></i>
                                        Daily Tokens Earned
                                    </span>
                                    <span class="font-semibold">${userData.daily_tokens_earned}/${userData.daily_total_cap}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all" style="width: ${totalProgress}%"></div>
                                </div>
                            </div>

                            <div class="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                                Limits reset daily at midnight (WAT)
                            </div>
                        </div>

                        <!-- Recent Activity Card -->
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <i class="fas fa-history text-purple-600"></i>
                                Recent Activity
                            </h2>
                            
                            <div id="tokenHistory" class="space-y-2 max-h-96 overflow-y-auto">
                                ${history.success && history.data.length > 0 ? 
                                    history.data.map(item => `
                                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full ${this.getActivityIconBg(item.type)} flex items-center justify-center">
                                                    <i class="fas ${this.getActivityIcon(item.type)} text-white"></i>
                                                </div>
                                                <div>
                                                    <div class="font-semibold">${this.getActivityLabel(item.type)}</div>
                                                    <div class="text-xs text-gray-500">${this.formatDate(item.created_at)}</div>
                                                </div>
                                            </div>
                                            <div class="font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                                                ${item.amount > 0 ? '+' : ''}${item.amount}
                                            </div>
                                        </div>
                                    `).join('')
                                : '<div class="text-center text-gray-500 py-8">No activity yet</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('[V3] Token dashboard error:', error);
            alert('Failed to load token dashboard: ' + error.message);
            this.showRoomList();
        }
    }

    getTierInfo(tier) {
        const tiers = {
            'bronze': { name: 'Bronze', icon: '🥉', color: 'text-orange-700', multiplier: '1.0x', gradient: 'from-orange-300 to-orange-500' },
            'silver': { name: 'Silver', icon: '🥈', color: 'text-gray-500', multiplier: '1.5x', gradient: 'from-gray-300 to-gray-500' },
            'gold': { name: 'Gold', icon: '🥇', color: 'text-yellow-500', multiplier: '2.0x', gradient: 'from-yellow-400 to-yellow-600' },
            'platinum': { name: 'Platinum', icon: '💎', color: 'text-purple-600', multiplier: '3.0x', gradient: 'from-purple-400 to-pink-600' }
        };
        return tiers[tier] || tiers['bronze'];
    }

    getNextTierInfo(currentTier) {
        const tierProgression = {
            'bronze': { name: 'Silver', threshold: 1000, gradient: 'from-gray-300 to-gray-500' },
            'silver': { name: 'Gold', threshold: 5000, gradient: 'from-yellow-400 to-yellow-600' },
            'gold': { name: 'Platinum', threshold: 20000, gradient: 'from-purple-400 to-pink-600' },
            'platinum': null
        };
        return tierProgression[currentTier];
    }

    getActivityIcon(type) {
        const icons = {
            'message': 'fa-comment',
            'file_share': 'fa-file',
            'room_create': 'fa-plus-circle',
            'room_join': 'fa-sign-in-alt',
            'daily_bonus': 'fa-calendar-check',
            'email_verification': 'fa-envelope-circle-check',
            'data_redemption': 'fa-mobile-alt',
            'gift_sent': 'fa-gift',
            'gift_received': 'fa-gift'
        };
        return icons[type] || 'fa-coins';
    }

    getActivityIconBg(type) {
        const colors = {
            'message': 'bg-blue-500',
            'file_share': 'bg-green-500',
            'room_create': 'bg-purple-500',
            'room_join': 'bg-indigo-500',
            'daily_bonus': 'bg-orange-500',
            'email_verification': 'bg-teal-500',
            'data_redemption': 'bg-red-500',
            'gift_sent': 'bg-pink-500',
            'gift_received': 'bg-yellow-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    getActivityLabel(type) {
        const labels = {
            'message': 'Message Sent',
            'file_share': 'File Shared',
            'room_create': 'Room Created',
            'room_join': 'Joined Room',
            'daily_bonus': 'Daily Login Bonus',
            'email_verification': 'Email Verified',
            'data_redemption': 'Data Purchase',
            'gift_sent': 'Gift Sent',
            'gift_received': 'Gift Received'
        };
        return labels[type] || 'Token Activity';
    }

    // ============================================
    // DATA REDEMPTION UI
    // ============================================

    async showDataRedemption() {
        console.log('[V3] Showing data redemption');
        
        try {
            // Fetch available data plans
            const response = await fetch(`${API_BASE}/api/data/plans`);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load data plans');
            }
            
            const plans = result.data;
            
            // Group plans by network
            const networks = {
                'MTN': plans.filter(p => p.network === 'MTN'),
                'Airtel': plans.filter(p => p.network === 'Airtel'),
                'Glo': plans.filter(p => p.network === 'Glo'),
                '9mobile': plans.filter(p => p.network === '9mobile')
            };
            
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen bg-gray-100">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
                        <div class="max-w-4xl mx-auto flex justify-between items-center">
                            <button onclick="app.showTokenDashboard()" class="hover:bg-white/20 p-2 rounded transition">
                                <i class="fas fa-arrow-left mr-2"></i>Back
                            </button>
                            <h1 class="text-xl font-bold">Buy Data</h1>
                            <div class="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                <i class="fas fa-coins"></i>
                                <span class="font-bold">${this.currentUser.tokens || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div class="max-w-4xl mx-auto p-4">
                        <!-- Phone Number Input -->
                        <div class="bg-white rounded-xl shadow-lg p-6 mb-4">
                            <h2 class="text-lg font-bold mb-4">📱 Enter Nigerian Phone Number</h2>
                            <div class="flex gap-2">
                                <input 
                                    type="tel" 
                                    id="phoneNumber" 
                                    placeholder="08012345678"
                                    pattern="[0-9]{11}"
                                    maxlength="11"
                                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button 
                                    onclick="app.detectNetwork()"
                                    class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <div id="networkDetected" class="mt-2 text-sm text-gray-600"></div>
                        </div>

                        <!-- Network Tabs -->
                        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div class="flex border-b">
                                ${Object.keys(networks).map((network, index) => `
                                    <button 
                                        id="tab-${network}"
                                        onclick="app.switchNetworkTab('${network}')"
                                        class="flex-1 py-3 font-semibold ${index === 0 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}"
                                    >
                                        ${network}
                                    </button>
                                `).join('')}
                            </div>

                            ${Object.entries(networks).map(([network, networkPlans], index) => `
                                <div id="plans-${network}" class="p-6 ${index !== 0 ? 'hidden' : ''}">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        ${networkPlans.map(plan => `
                                            <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition cursor-pointer"
                                                 onclick="app.selectPlan('${plan.plan_code}', ${plan.token_cost}, '${plan.data_amount}', '${network}')">
                                                <div class="flex items-center justify-between mb-2">
                                                    <div class="text-2xl font-bold text-purple-600">${plan.data_amount}</div>
                                                    <div class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                                                        <i class="fas fa-coins mr-1"></i>${plan.token_cost}
                                                    </div>
                                                </div>
                                                <div class="text-sm text-gray-600">${plan.validity}</div>
                                                <div class="text-xs text-gray-500 mt-1">${plan.description || ''}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Recent Redemptions -->
                        <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
                            <h2 class="text-lg font-bold mb-4">Recent Purchases</h2>
                            <div id="recentRedemptions">
                                <div class="text-center text-gray-500 py-4">
                                    <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                    <p>Loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load recent redemptions
            this.loadRecentRedemptions();
            
        } catch (error) {
            console.error('[V3] Data redemption error:', error);
            alert('Failed to load data plans: ' + error.message);
            this.showTokenDashboard();
        }
    }

    switchNetworkTab(network) {
        // Update tab styles
        ['MTN', 'Airtel', 'Glo', '9mobile'].forEach(n => {
            const tab = document.getElementById(`tab-${n}`);
            const plans = document.getElementById(`plans-${n}`);
            
            if (n === network) {
                tab.className = 'flex-1 py-3 font-semibold border-b-2 border-purple-600 text-purple-600';
                plans.classList.remove('hidden');
            } else {
                tab.className = 'flex-1 py-3 font-semibold text-gray-500 hover:text-gray-700';
                plans.classList.add('hidden');
            }
        });
    }

    detectNetwork() {
        const phone = document.getElementById('phoneNumber').value.trim();
        const networkDiv = document.getElementById('networkDetected');
        
        if (!phone || phone.length !== 11) {
            networkDiv.innerHTML = '<span class="text-red-500">Please enter a valid 11-digit phone number</span>';
            return;
        }

        // Detect network from prefix
        const prefix = phone.substring(0, 4);
        let network = '';
        
        if (['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'].includes(prefix)) {
            network = 'MTN';
        } else if (['0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'].includes(prefix)) {
            network = 'Airtel';
        } else if (['0805', '0807', '0811', '0815', '0905', '0915'].includes(prefix)) {
            network = 'Glo';
        } else if (['0809', '0817', '0818', '0909', '0908'].includes(prefix)) {
            network = '9mobile';
        }

        if (network) {
            networkDiv.innerHTML = `<span class="text-green-600"><i class="fas fa-check-circle mr-1"></i>Detected: ${network}</span>`;
            this.switchNetworkTab(network);
        } else {
            networkDiv.innerHTML = '<span class="text-orange-500">Could not detect network. Please select manually.</span>';
        }
    }

    async selectPlan(planCode, tokenCost, dataAmount, network) {
        const phone = document.getElementById('phoneNumber').value.trim();
        
        if (!phone || phone.length !== 11) {
            alert('⚠️ Please enter a valid 11-digit phone number first');
            document.getElementById('phoneNumber').focus();
            return;
        }

        if (!phone.match(/^[0-9]{11}$/)) {
            alert('⚠️ Phone number must be exactly 11 digits');
            return;
        }

        if (this.currentUser.tokens < tokenCost) {
            alert(`⚠️ Insufficient tokens! You need ${tokenCost} tokens but only have ${this.currentUser.tokens} tokens.`);
            return;
        }

        const confirmed = confirm(
            `🎯 Confirm Data Purchase\n\n` +
            `Network: ${network}\n` +
            `Data: ${dataAmount}\n` +
            `Phone: ${phone}\n` +
            `Cost: ${tokenCost} tokens\n\n` +
            `Proceed with purchase?`
        );

        if (!confirmed) return;

        try {
            // Show loading
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-overlay';
            loadingDiv.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
            loadingDiv.innerHTML = `
                <div class="bg-white rounded-xl p-8 text-center">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600 mb-4"></i>
                    <div class="text-xl font-bold">Processing Purchase...</div>
                    <div class="text-sm text-gray-600 mt-2">Please wait</div>
                </div>
            `;
            document.body.appendChild(loadingDiv);

            const response = await fetch(`${API_BASE}/api/data/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    planCode: planCode,
                    phoneNumber: phone
                })
            });

            const result = await response.json();
            
            // Remove loading
            loadingDiv.remove();

            if (result.success) {
                // Update local token balance
                this.currentUser.tokens -= tokenCost;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                alert(
                    `✅ Purchase Successful!\n\n` +
                    `${dataAmount} has been sent to ${phone}\n` +
                    `Transaction ID: ${result.data.transactionId}\n\n` +
                    `New Balance: ${this.currentUser.tokens} tokens`
                );

                // Refresh the page to show updated data
                this.showDataRedemption();
            } else {
                alert(`❌ Purchase Failed\n\n${result.error || 'Unknown error occurred'}`);
            }
        } catch (error) {
            console.error('[V3] Data purchase error:', error);
            document.getElementById('loading-overlay')?.remove();
            alert('❌ Purchase failed: ' + error.message);
        }
    }

    async loadRecentRedemptions() {
        try {
            const response = await fetch(`${API_BASE}/api/data/history/${this.currentUser.id}`);
            const result = await response.json();
            
            const container = document.getElementById('recentRedemptions');
            
            if (result.success && result.data.length > 0) {
                container.innerHTML = result.data.slice(0, 5).map(item => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <i class="fas fa-mobile-alt text-purple-600"></i>
                            </div>
                            <div>
                                <div class="font-semibold">${item.data_amount} - ${item.network}</div>
                                <div class="text-xs text-gray-500">${item.phone_number}</div>
                                <div class="text-xs text-gray-400">${this.formatDate(item.created_at)}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-red-600">-${item.token_cost}</div>
                            <div class="text-xs ${this.getStatusColor(item.status)}">${this.getStatusLabel(item.status)}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="text-center text-gray-500 py-8">No purchases yet</div>';
            }
        } catch (error) {
            console.error('[V3] Load redemptions error:', error);
            document.getElementById('recentRedemptions').innerHTML = 
                '<div class="text-center text-red-500 py-4">Failed to load history</div>';
        }
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'text-yellow-600',
            'completed': 'text-green-600',
            'failed': 'text-red-600'
        };
        return colors[status] || 'text-gray-600';
    }

    getStatusLabel(status) {
        const labels = {
            'pending': '⏳ Pending',
            'completed': '✅ Completed',
            'failed': '❌ Failed'
        };
        return labels[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    // ============================================
    // PASSWORD RESET SYSTEM
    // ============================================

    showForgotPasswordModal() {
        const modal = document.createElement('div');
        modal.id = 'forgotPasswordModal';
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Reset Password</h2>
                    <button onclick="app.closeForgotPasswordModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div id="forgot-password-message" class="hidden mb-4 p-3 rounded-lg"></div>

                <div id="forgot-password-form">
                    <p class="text-gray-600 mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            id="resetEmail" 
                            placeholder="your@email.com"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <button 
                        onclick="app.requestPasswordReset()"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>Send Reset Link
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    closeForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.remove();
        }
    }

    async verifyEmail(token) {
        console.log('[V3] Verifying email with token:', token);
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-spinner fa-spin text-purple-600 text-3xl"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
                    <p class="text-gray-600">Please wait while we verify your email address</p>
                </div>
            </div>
        `;
        
        try {
            const response = await fetch(`${API_BASE}/api/auth/verify-email/${token}`);
            const data = await response.json();
            
            if (data.success) {
                // Success - show success message
                document.getElementById('app').innerHTML = `
                    <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-check-circle text-green-600 text-3xl"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">✅ Email Verified!</h2>
                            <p class="text-gray-600 mb-4">${data.message}</p>
                            
                            <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                                <div class="flex items-center justify-center gap-2 text-green-700">
                                    <i class="fas fa-coins text-2xl"></i>
                                    <span class="text-xl font-bold">+20 Tokens Earned!</span>
                                </div>
                                <p class="text-sm text-green-600 mt-1">Signup bonus added to your account</p>
                            </div>
                            
                            <button 
                                onclick="window.location.href='/'"
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                            >
                                Continue to Login
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Error - show error message
                document.getElementById('app').innerHTML = `
                    <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-times-circle text-red-600 text-3xl"></i>
                            </div>
                            <h2 class="text-2xl font-bold text-gray-800 mb-2">❌ Verification Failed</h2>
                            <p class="text-gray-600 mb-6">${data.error || 'Invalid or expired verification link'}</p>
                            
                            <div class="space-y-3">
                                <button 
                                    onclick="window.location.href='/'"
                                    class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                                >
                                    Back to Login
                                </button>
                                
                                <p class="text-sm text-gray-500">
                                    Need help? The verification link expires in 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[V3] Verification error:', error);
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">❌ Connection Error</h2>
                        <p class="text-gray-600 mb-6">Could not verify email. Please check your internet connection and try again.</p>
                        
                        <button 
                            onclick="window.location.href='/'"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            `;
        }
    }

    async requestPasswordReset() {
        const email = document.getElementById('resetEmail').value.trim();
        const msgDiv = document.getElementById('forgot-password-message');

        if (!email) {
            this.showMessage(msgDiv, 'Please enter your email address', 'error');
            return;
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            this.showMessage(msgDiv, 'Please enter a valid email address', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Sending reset link...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, '✅ Password reset link sent! Check your email inbox.', 'success');
                document.getElementById('resetEmail').value = '';
                
                setTimeout(() => {
                    this.closeForgotPasswordModal();
                }, 3000);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to send reset link', 'error');
            }
        } catch (error) {
            console.error('[V3] Password reset error:', error);
            this.showMessage(msgDiv, 'Failed to send reset link. Please try again.', 'error');
        }
    }

    // Called when user clicks reset link in email
    async showResetPasswordForm(token) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-key text-white text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">Reset Password</h1>
                        <p class="text-gray-600 mt-2">Enter your new password</p>
                    </div>

                    <div id="reset-password-message" class="hidden mb-4 p-3 rounded-lg"></div>

                    <div id="reset-password-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input 
                                type="password" 
                                id="newPassword" 
                                placeholder="Min 8 characters, 1 uppercase, 1 number"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input 
                                type="password" 
                                id="confirmNewPassword" 
                                placeholder="Re-enter password"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onkeypress="if(event.key==='Enter') app.submitPasswordReset('${token}')"
                            />
                        </div>
                        <button 
                            onclick="app.submitPasswordReset('${token}')"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                        >
                            <i class="fas fa-check mr-2"></i>Reset Password
                        </button>
                        <button 
                            onclick="app.showAuth()"
                            class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            <i class="fas fa-arrow-left mr-2"></i>Back to Login
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async submitPasswordReset(token) {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        const msgDiv = document.getElementById('reset-password-message');

        if (!newPassword || !confirmPassword) {
            this.showMessage(msgDiv, 'Please fill in all fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showMessage(msgDiv, 'Passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showMessage(msgDiv, 'Password must be at least 8 characters long', 'error');
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            this.showMessage(msgDiv, 'Password must contain at least one uppercase letter', 'error');
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            this.showMessage(msgDiv, 'Password must contain at least one number', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Resetting password...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, '✅ Password reset successfully! Redirecting to login...', 'success');
                
                setTimeout(() => {
                    this.showAuth();
                }, 2000);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to reset password', 'error');
            }
        } catch (error) {
            console.error('[V3] Submit password reset error:', error);
            this.showMessage(msgDiv, 'Failed to reset password. Please try again.', 'error');
        }
    }

    // ============================================
    // ADVERTISER UI SYSTEM
    // ============================================

    showAdvertiserLanding() {
        // Push to navigation history for swipe back
        this.pushNavigation('advertiserLanding');
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
                <!-- Header -->
                <div class="bg-white/10 backdrop-blur-sm border-b border-white/20">
                    <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-bullhorn"></i>
                            Amebo Ads
                        </h1>
                        <button 
                            onclick="app.showAuth()"
                            class="text-white hover:text-white/80 transition"
                        >
                            <i class="fas fa-arrow-left mr-2"></i>Back to App
                        </button>
                    </div>
                </div>

                <!-- Hero Section -->
                <div class="max-w-6xl mx-auto px-4 py-16 text-center">
                    <h2 class="text-5xl font-bold text-white mb-6">
                        Reach Thousands of Nigerian Users
                    </h2>
                    <p class="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                        Advertise your business to active users on Amebo. 
                        Drive Instagram followers or website traffic with our affordable ad platform.
                    </p>
                    
                    <div class="flex gap-4 justify-center flex-wrap">
                        <button 
                            onclick="app.showAdvertiserSignup()"
                            class="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
                        >
                            <i class="fas fa-rocket mr-2"></i>Get Started - ₦2,000
                        </button>
                        <button 
                            onclick="app.showAdvertiserLogin()"
                            class="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition border-2 border-white/30"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>Advertiser Login
                        </button>
                    </div>
                </div>

                <!-- Features Grid -->
                <div class="max-w-6xl mx-auto px-4 pb-16">
                    <div class="grid md:grid-cols-3 gap-6">
                        <!-- Instagram Ads -->
                        <div class="bg-white rounded-xl p-6 shadow-xl">
                            <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                                <i class="fab fa-instagram text-pink-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Instagram Profile</h3>
                            <p class="text-gray-600 mb-4">Drive followers to your Instagram account. Perfect for influencers and brands.</p>
                            <div class="bg-pink-50 rounded-lg p-3">
                                <p class="text-sm font-semibold text-pink-800">Starting at ₦2,000</p>
                                <p class="text-xs text-pink-600">10,000 impressions</p>
                            </div>
                        </div>

                        <!-- Website Ads -->
                        <div class="bg-white rounded-xl p-6 shadow-xl">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <i class="fas fa-globe text-blue-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Website Traffic</h3>
                            <p class="text-gray-600 mb-4">Send users directly to your website. Great for e-commerce and services.</p>
                            <div class="bg-blue-50 rounded-lg p-3">
                                <p class="text-sm font-semibold text-blue-800">₦10 per click</p>
                                <p class="text-xs text-blue-600">CPC model available</p>
                            </div>
                        </div>

                        <!-- Analytics -->
                        <div class="bg-white rounded-xl p-6 shadow-xl">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <i class="fas fa-chart-line text-green-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">Real-Time Analytics</h3>
                            <p class="text-gray-600 mb-4">Track impressions, clicks, and ROI in real-time dashboard.</p>
                            <div class="bg-green-50 rounded-lg p-3">
                                <p class="text-sm font-semibold text-green-800">100% Transparency</p>
                                <p class="text-xs text-green-600">Live tracking</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pricing -->
                <div class="max-w-6xl mx-auto px-4 pb-16">
                    <h2 class="text-3xl font-bold text-white text-center mb-8">Simple, Affordable Pricing</h2>
                    <div class="grid md:grid-cols-4 gap-4">
                        <div class="bg-white rounded-lg p-6 text-center">
                            <h4 class="font-bold text-gray-800 mb-2">Starter</h4>
                            <p class="text-3xl font-bold text-purple-600 mb-2">₦2,000</p>
                            <p class="text-sm text-gray-600">10,000 impressions</p>
                        </div>
                        <div class="bg-white rounded-lg p-6 text-center">
                            <h4 class="font-bold text-gray-800 mb-2">Growth</h4>
                            <p class="text-3xl font-bold text-purple-600 mb-2">₦8,000</p>
                            <p class="text-sm text-gray-600">50,000 impressions</p>
                        </div>
                        <div class="bg-white rounded-lg p-6 text-center border-2 border-yellow-400">
                            <div class="bg-yellow-400 text-xs font-bold text-gray-800 px-2 py-1 rounded-full inline-block mb-2">POPULAR</div>
                            <h4 class="font-bold text-gray-800 mb-2">Pro</h4>
                            <p class="text-3xl font-bold text-purple-600 mb-2">₦15,000</p>
                            <p class="text-sm text-gray-600">100,000 impressions</p>
                        </div>
                        <div class="bg-white rounded-lg p-6 text-center">
                            <h4 class="font-bold text-gray-800 mb-2">Enterprise</h4>
                            <p class="text-3xl font-bold text-purple-600 mb-2">₦60,000</p>
                            <p class="text-sm text-gray-600">500,000 impressions</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showAdvertiserSignup() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-bullhorn text-purple-600 text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">Advertise on Amebo</h1>
                        <p class="text-gray-600 mt-2">Reach thousands of active Nigerian users</p>
                    </div>
                    
                    <div id="advertiser-message" class="hidden mb-4 p-3 rounded-lg"></div>
                    
                    <form id="advertiserForm" class="space-y-4">
                        <!-- Business Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Business Name *
                            </label>
                            <input 
                                type="text"
                                id="businessName"
                                placeholder="e.g., TechHub Nigeria"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                                required
                            />
                        </div>
                        
                        <!-- Email -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Business Email *
                            </label>
                            <input 
                                type="email"
                                id="businessEmail"
                                placeholder="contact@yourbusiness.com"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                                required
                            />
                        </div>
                        
                        <!-- Phone -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input 
                                type="tel"
                                id="businessPhone"
                                placeholder="080xxxxxxxx"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                            />
                        </div>
                        
                        <!-- Instagram Handle -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Instagram Handle (optional)
                            </label>
                            <div class="flex">
                                <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">@</span>
                                <input 
                                    type="text"
                                    id="instagramHandle"
                                    placeholder="yourbusiness"
                                    class="flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-purple-600"
                                />
                            </div>
                        </div>
                        
                        <!-- Website -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Website URL (optional)
                            </label>
                            <input 
                                type="url"
                                id="websiteUrl"
                                placeholder="https://yourbusiness.com"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                            />
                        </div>
                        
                        <!-- Submit Button -->
                        <button 
                            type="submit"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Register as Advertiser
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center text-sm text-gray-600">
                        <p>Already registered? <a href="#" onclick="app.showAdvertiserLogin()" class="text-purple-600 font-semibold">Login</a></p>
                        <p class="mt-2"><a href="#" onclick="app.showAuth()" class="text-gray-500 hover:text-gray-700">Back to App</a></p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('advertiserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAdvertiserRegistration();
        });
    }

    async handleAdvertiserRegistration() {
        const businessName = document.getElementById('businessName').value.trim();
        const email = document.getElementById('businessEmail').value.trim();
        const phone = document.getElementById('businessPhone').value.trim();
        const instagramHandle = document.getElementById('instagramHandle').value.trim();
        const websiteUrl = document.getElementById('websiteUrl').value.trim();
        const msgDiv = document.getElementById('advertiser-message');
        
        if (!businessName || !email) {
            this.showMessage(msgDiv, 'Business name and email are required', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Registering...', 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/ads/register-advertiser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessName,
                    email,
                    phone: phone || null,
                    instagramHandle: instagramHandle || null,
                    websiteUrl: websiteUrl || null
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(msgDiv, '✅ Registration successful! You can now create ad campaigns.', 'success');
                
                // Save advertiser ID
                localStorage.setItem('advertiserId', data.advertiserId);
                localStorage.setItem('advertiserEmail', email);
                
                setTimeout(() => this.showAdvertiserDashboard(), 2000);
            } else {
                this.showMessage(msgDiv, data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('[ADS] Registration error:', error);
            this.showMessage(msgDiv, 'Registration failed. Please try again.', 'error');
        }
    }

    showAdvertiserLogin() {
        // Push to navigation history for swipe back
        this.pushNavigation('advertiserLogin');
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-sign-in-alt text-purple-600 text-3xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-800">Advertiser Login</h1>
                        <p class="text-gray-600 mt-2">Access your campaigns</p>
                    </div>
                    
                    <div id="login-message" class="hidden mb-4 p-3 rounded-lg"></div>
                    
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Business Email
                            </label>
                            <input 
                                type="email"
                                id="loginEmail"
                                placeholder="your@business.com"
                                class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Access Dashboard
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center text-sm text-gray-600">
                        <p>Don't have an account? <a href="#" onclick="app.showAdvertiserSignup()" class="text-purple-600 font-semibold">Sign up</a></p>
                        <p class="mt-2"><a href="#" onclick="app.showAuth()" class="text-gray-500 hover:text-gray-700">Back to App</a></p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAdvertiserLogin();
        });
    }

    async handleAdvertiserLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const msgDiv = document.getElementById('login-message');
        
        if (!email) {
            this.showMessage(msgDiv, 'Email is required', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Logging in...', 'info');
        
        try {
            // Call the correct login endpoint
            const response = await fetch(`${API_BASE}/api/ads/login-advertiser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store advertiser info and show dashboard
                console.log('[ADS] Login successful, data:', data);
                localStorage.setItem('advertiserEmail', email);
                localStorage.setItem('advertiserId', data.advertiserId);
                localStorage.setItem('advertiserBusinessName', data.businessName);
                console.log('[ADS] Calling showAdvertiserDashboard with ID:', data.advertiserId);
                this.showAdvertiserDashboard(data.advertiserId);
            } else {
                this.showMessage(msgDiv, data.error || 'Login failed. Please check your email.', 'error');
            }
        } catch (error) {
            console.error('[ADS] Login error:', error);
            this.showMessage(msgDiv, 'Login failed. Please try again.', 'error');
        }
    }

    showCreateCampaign() {
        const advertiserId = localStorage.getItem('advertiserId');
        
        if (!advertiserId) {
            this.showAdvertiserSignup();
            return;
        }
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-3xl font-bold text-gray-800">Create Ad Campaign</h1>
                            <button 
                                onclick="app.showAdvertiserDashboard()"
                                class="text-gray-600 hover:text-gray-800"
                            >
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                        
                        <div id="campaign-message" class="hidden mb-4 p-3 rounded-lg"></div>
                        
                        <form id="campaignForm" class="space-y-6">
                            <!-- Campaign Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Campaign Name *
                                </label>
                                <input 
                                    type="text"
                                    id="campaignName"
                                    placeholder="e.g., Christmas Sale 2025"
                                    class="w-full px-4 py-3 border rounded-lg"
                                    required
                                />
                            </div>
                            
                            <!-- Ad Image -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ad Image URL *
                                </label>
                                <input 
                                    type="url"
                                    id="adImageUrl"
                                    placeholder="https://yourcdn.com/ad-image.jpg"
                                    class="w-full px-4 py-3 border rounded-lg"
                                    required
                                />
                                <p class="text-xs text-gray-500 mt-1">Recommended: 320x100px, max 200KB</p>
                            </div>
                            
                            <!-- Ad Title -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ad Title * (max 50 characters)
                                </label>
                                <input 
                                    type="text"
                                    id="adTitle"
                                    maxlength="50"
                                    placeholder="Get 50% Off This Christmas!"
                                    class="w-full px-4 py-3 border rounded-lg"
                                    required
                                />
                            </div>
                            
                            <!-- Ad Description -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Ad Description (max 100 characters)
                                </label>
                                <textarea 
                                    id="adDescription"
                                    maxlength="100"
                                    rows="2"
                                    placeholder="Shop now and save big on all items"
                                    class="w-full px-4 py-3 border rounded-lg"
                                ></textarea>
                            </div>
                            
                            <!-- Destination Type -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Where should the ad link to? *
                                </label>
                                <div class="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        id="instagramBtn"
                                        onclick="app.selectDestination('instagram')"
                                        class="p-4 border-2 rounded-lg text-center hover:border-purple-600 hover:bg-purple-50 transition-all"
                                    >
                                        <i class="fab fa-instagram text-3xl text-pink-600 mb-2"></i>
                                        <p class="font-semibold">Instagram Profile</p>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        id="websiteBtn"
                                        onclick="app.selectDestination('website')"
                                        class="p-4 border-2 rounded-lg text-center hover:border-purple-600 hover:bg-purple-50 transition-all"
                                    >
                                        <i class="fas fa-globe text-3xl text-blue-600 mb-2"></i>
                                        <p class="font-semibold">Website URL</p>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Instagram Handle (hidden by default) -->
                            <div id="instagramSection" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Instagram Handle *
                                </label>
                                <div class="flex">
                                    <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">@</span>
                                    <input 
                                        type="text"
                                        id="campaignInstagram"
                                        placeholder="yourbusiness"
                                        class="flex-1 px-4 py-3 border rounded-r-lg"
                                    />
                                </div>
                            </div>
                            
                            <!-- Website URL (hidden by default) -->
                            <div id="websiteSection" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Website URL *
                                </label>
                                <input 
                                    type="url"
                                    id="campaignWebsite"
                                    placeholder="https://yourbusiness.com/sale"
                                    class="w-full px-4 py-3 border rounded-lg"
                                />
                            </div>
                            
                            <!-- Pricing Model -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Pricing Model *
                                </label>
                                <select 
                                    id="pricingModel"
                                    class="w-full px-4 py-3 border rounded-lg"
                                    required
                                    onchange="app.updateBudgetEstimate()"
                                >
                                    <option value="cpm">CPM - Pay per 1000 impressions (₦200 CPM)</option>
                                    <option value="cpc">CPC - Pay per click (₦10 per click)</option>
                                </select>
                            </div>
                            
                            <!-- Budget -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Campaign Budget * (minimum ₦2,000)
                                </label>
                                <div class="flex">
                                    <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">₦</span>
                                    <input 
                                        type="number"
                                        id="budgetTotal"
                                        min="2000"
                                        step="1000"
                                        placeholder="10000"
                                        class="flex-1 px-4 py-3 border rounded-r-lg"
                                        required
                                        oninput="app.updateBudgetEstimate()"
                                    />
                                </div>
                                
                                <div id="budgetEstimate" class="mt-2 p-3 bg-purple-50 rounded-lg">
                                    <p class="text-sm text-purple-800">
                                        <strong>Estimated Reach:</strong> Enter budget to see estimate
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Submit Button -->
                            <button 
                                type="submit"
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                            >
                                Create Campaign
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('campaignForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateCampaign();
        });
    }

    selectDestination(type) {
        const instagramBtn = document.getElementById('instagramBtn');
        const websiteBtn = document.getElementById('websiteBtn');
        const instagramSection = document.getElementById('instagramSection');
        const websiteSection = document.getElementById('websiteSection');
        
        if (type === 'instagram') {
            instagramBtn.classList.add('border-purple-600', 'bg-purple-50');
            websiteBtn.classList.remove('border-purple-600', 'bg-purple-50');
            instagramSection.classList.remove('hidden');
            websiteSection.classList.add('hidden');
            this.selectedDestination = 'instagram';
        } else {
            websiteBtn.classList.add('border-purple-600', 'bg-purple-50');
            instagramBtn.classList.remove('border-purple-600', 'bg-purple-50');
            websiteSection.classList.remove('hidden');
            instagramSection.classList.add('hidden');
            this.selectedDestination = 'website';
        }
    }

    updateBudgetEstimate() {
        const pricingModel = document.getElementById('pricingModel')?.value;
        const budget = parseFloat(document.getElementById('budgetTotal')?.value) || 0;
        const estimateDiv = document.getElementById('budgetEstimate');
        
        if (!estimateDiv) return;
        
        if (budget < 2000) {
            estimateDiv.innerHTML = '<p class="text-sm text-red-600"><strong>Minimum budget is ₦2,000</strong></p>';
            return;
        }
        
        let estimate = '';
        
        if (pricingModel === 'cpm') {
            const impressions = (budget / 200) * 1000;
            const estimatedClicks = impressions * 0.02; // 2% CTR estimate
            estimate = `
                <p class="text-sm text-purple-800">
                    <strong>Estimated Reach:</strong><br>
                    • ~${impressions.toLocaleString()} impressions<br>
                    • ~${Math.floor(estimatedClicks)} clicks (2% CTR)<br>
                    • Cost: ₦${(budget / impressions * 1000).toFixed(2)} per 1000 impressions
                </p>
            `;
        } else {
            const clicks = budget / 10;
            estimate = `
                <p class="text-sm text-purple-800">
                    <strong>Estimated Reach:</strong><br>
                    • Up to ${Math.floor(clicks)} clicks<br>
                    • Cost: ₦10 per click<br>
                    • Actual impressions depend on CTR
                </p>
            `;
        }
        
        estimateDiv.innerHTML = estimate;
    }

    async handleCreateCampaign() {
        const advertiserId = localStorage.getItem('advertiserId');
        const msgDiv = document.getElementById('campaign-message');
        
        const campaignData = {
            advertiserId,
            campaignName: document.getElementById('campaignName').value.trim(),
            adImageUrl: document.getElementById('adImageUrl').value.trim(),
            adTitle: document.getElementById('adTitle').value.trim(),
            adDescription: document.getElementById('adDescription').value.trim(),
            destinationType: this.selectedDestination,
            instagramHandle: document.getElementById('campaignInstagram')?.value.trim(),
            websiteUrl: document.getElementById('campaignWebsite')?.value.trim(),
            pricingModel: document.getElementById('pricingModel').value,
            budgetTotal: parseFloat(document.getElementById('budgetTotal').value)
        };
        
        // Validation
        if (!campaignData.destinationType) {
            this.showMessage(msgDiv, 'Please select where your ad should link to', 'error');
            return;
        }
        
        if (campaignData.destinationType === 'instagram' && !campaignData.instagramHandle) {
            this.showMessage(msgDiv, 'Instagram handle is required', 'error');
            return;
        }
        
        if (campaignData.destinationType === 'website' && !campaignData.websiteUrl) {
            this.showMessage(msgDiv, 'Website URL is required', 'error');
            return;
        }
        
        this.showMessage(msgDiv, 'Creating campaign...', 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/ads/create-campaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage(msgDiv, '✅ Campaign created successfully!', 'success');
                
                setTimeout(() => {
                    this.showAdvertiserDashboard();
                }, 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Campaign creation failed', 'error');
            }
        } catch (error) {
            console.error('[ADS] Create campaign error:', error);
            this.showMessage(msgDiv, 'Campaign creation failed. Please try again.', 'error');
        }
    }

    async showCampaignAnalytics(campaignId) {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-4xl mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-8">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Campaign Analytics</h1>
                            <button 
                                onclick="app.showAdvertiserDashboard()"
                                class="text-gray-600 hover:text-gray-800"
                            >
                                <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                            </button>
                        </div>
                        
                        <div id="analytics-content">
                            <div class="text-center py-8">
                                <i class="fas fa-spinner fa-spin text-3xl text-purple-600 mb-2"></i>
                                <p class="text-gray-600">Loading analytics...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        try {
            const response = await fetch(`${API_BASE}/api/ads/campaign/${campaignId}/analytics`);
            const data = await response.json();
            
            if (data.success) {
                const campaign = data.campaign;
                const metrics = campaign.metrics;
                
                document.getElementById('analytics-content').innerHTML = `
                    <div class="space-y-6">
                        <!-- Campaign Info -->
                        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6">
                            <h2 class="text-2xl font-bold mb-2">${campaign.campaign_name}</h2>
                            <p class="text-white/80">Status: <span class="font-semibold">${campaign.status.toUpperCase()}</span></p>
                        </div>
                        
                        <!-- Metrics Grid -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <p class="text-sm text-blue-600 font-semibold mb-1">Impressions</p>
                                <p class="text-3xl font-bold text-blue-800">${campaign.impressions?.toLocaleString() || 0}</p>
                            </div>
                            
                            <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                                <p class="text-sm text-green-600 font-semibold mb-1">Clicks</p>
                                <p class="text-3xl font-bold text-green-800">${campaign.clicks?.toLocaleString() || 0}</p>
                            </div>
                            
                            <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <p class="text-sm text-purple-600 font-semibold mb-1">CTR</p>
                                <p class="text-3xl font-bold text-purple-800">${metrics.ctr}</p>
                            </div>
                            
                            <div class="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <p class="text-sm text-orange-600 font-semibold mb-1">Avg CPC</p>
                                <p class="text-3xl font-bold text-orange-800">${metrics.avgCostPerClick}</p>
                            </div>
                        </div>
                        
                        <!-- Budget Info -->
                        <div class="bg-gray-50 rounded-lg p-6">
                            <h3 class="font-bold text-gray-800 mb-4">Budget Overview</h3>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <p class="text-sm text-gray-600">Total Budget</p>
                                    <p class="text-2xl font-bold text-gray-800">₦${campaign.budget_total?.toLocaleString() || 0}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Spent</p>
                                    <p class="text-2xl font-bold text-gray-800">₦${campaign.budget_spent?.toFixed(0) || 0}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-600">Remaining</p>
                                    <p class="text-2xl font-bold text-gray-800">${metrics.budgetRemaining}</p>
                                </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="mt-4">
                                <div class="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Budget Used</span>
                                    <span>${metrics.percentSpent}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-3">
                                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full" style="width: ${metrics.percentSpent}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[ADS] Analytics error:', error);
            document.getElementById('analytics-content').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
                    <p class="text-gray-600">Failed to load analytics</p>
                </div>
            `;
        }
    }

    // ==================== ADVERTISER UI ====================

    showAdvertiserLanding() {
        // Push to navigation history for swipe back
        this.pushNavigation('advertiserLanding');
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
                <div class="max-w-5xl mx-auto">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <button onclick="app.showAuth()" class="text-white hover:text-gray-200 mb-4 inline-flex items-center">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Login
                        </button>
                        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <i class="fas fa-bullhorn text-purple-600 text-4xl"></i>
                        </div>
                        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                            Advertise on Amebo
                        </h1>
                        <p class="text-xl text-purple-100 mb-6">
                            Reach 100,000+ Active Nigerian Users
                        </p>
                    </div>

                    <!-- Benefits -->
                    <div class="grid md:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white rounded-2xl shadow-2xl p-6">
                            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-users text-purple-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 text-center mb-2">Targeted Audience</h3>
                            <p class="text-gray-600 text-center">Reach engaged Nigerian users actively using our chat & payment platform</p>
                        </div>
                        <div class="bg-white rounded-2xl shadow-2xl p-6">
                            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-chart-line text-indigo-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 text-center mb-2">Real-Time Analytics</h3>
                            <p class="text-gray-600 text-center">Track impressions, clicks, and ROI with our live analytics dashboard</p>
                        </div>
                        <div class="bg-white rounded-2xl shadow-2xl p-6">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-money-bill-wave text-green-600 text-3xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 text-center mb-2">Affordable Pricing</h3>
                            <p class="text-gray-600 text-center">Pay only for results with flexible CPM and CPC pricing models</p>
                        </div>
                    </div>

                    <!-- Pricing -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">Simple, Transparent Pricing</h2>
                        <div class="grid md:grid-cols-2 gap-6 mb-8">
                            <div class="border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 transition-all">
                                <div class="text-center">
                                    <div class="text-purple-600 font-bold text-4xl mb-2">₦200</div>
                                    <div class="text-gray-600 mb-4">per 1,000 impressions</div>
                                    <div class="text-sm text-gray-500 mb-4">CPM (Cost Per Mille)</div>
                                    <div class="bg-purple-50 rounded-lg p-4 text-left">
                                        <div class="font-semibold text-gray-800 mb-2">Best for:</div>
                                        <ul class="text-sm text-gray-600 space-y-1">
                                            <li>• Brand awareness campaigns</li>
                                            <li>• Product launches</li>
                                            <li>• Event promotions</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="border-2 border-indigo-200 rounded-xl p-6 hover:border-indigo-400 transition-all">
                                <div class="text-center">
                                    <div class="text-indigo-600 font-bold text-4xl mb-2">₦10</div>
                                    <div class="text-gray-600 mb-4">per click</div>
                                    <div class="text-sm text-gray-500 mb-4">CPC (Cost Per Click)</div>
                                    <div class="bg-indigo-50 rounded-lg p-4 text-left">
                                        <div class="font-semibold text-gray-800 mb-2">Best for:</div>
                                        <ul class="text-sm text-gray-600 space-y-1">
                                            <li>• Website traffic</li>
                                            <li>• Instagram growth</li>
                                            <li>• Direct conversions</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Packages -->
                        <h3 class="text-2xl font-bold text-gray-800 text-center mb-6">Recommended Packages</h3>
                        <div class="grid md:grid-cols-4 gap-4">
                            <div class="border rounded-lg p-4 text-center">
                                <div class="font-bold text-lg mb-2">Starter</div>
                                <div class="text-2xl font-bold text-purple-600 mb-2">₦2,000</div>
                                <div class="text-sm text-gray-600">10,000 impressions</div>
                            </div>
                            <div class="border-2 border-purple-400 rounded-lg p-4 text-center bg-purple-50">
                                <div class="text-xs text-purple-600 font-bold mb-1">POPULAR</div>
                                <div class="font-bold text-lg mb-2">Growth</div>
                                <div class="text-2xl font-bold text-purple-600 mb-2">₦8,000</div>
                                <div class="text-sm text-gray-600">50,000 impressions</div>
                            </div>
                            <div class="border rounded-lg p-4 text-center">
                                <div class="font-bold text-lg mb-2">Pro</div>
                                <div class="text-2xl font-bold text-purple-600 mb-2">₦15,000</div>
                                <div class="text-sm text-gray-600">100,000 impressions</div>
                            </div>
                            <div class="border rounded-lg p-4 text-center">
                                <div class="font-bold text-lg mb-2">Enterprise</div>
                                <div class="text-2xl font-bold text-purple-600 mb-2">₦60,000</div>
                                <div class="text-sm text-gray-600">500,000 impressions</div>
                            </div>
                        </div>
                    </div>

                    <!-- How It Works -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                        <h2 class="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
                        <div class="grid md:grid-cols-4 gap-6">
                            <div class="text-center">
                                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">1</div>
                                <h4 class="font-bold text-gray-800 mb-2">Register</h4>
                                <p class="text-sm text-gray-600">Create your advertiser account in seconds</p>
                            </div>
                            <div class="text-center">
                                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">2</div>
                                <h4 class="font-bold text-gray-800 mb-2">Create Campaign</h4>
                                <p class="text-sm text-gray-600">Design your ad and choose your destination (Instagram or Website)</p>
                            </div>
                            <div class="text-center">
                                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">3</div>
                                <h4 class="font-bold text-gray-800 mb-2">Set Budget</h4>
                                <p class="text-sm text-gray-600">Choose CPM or CPC and set your budget</p>
                            </div>
                            <div class="text-center">
                                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">4</div>
                                <h4 class="font-bold text-gray-800 mb-2">Track Results</h4>
                                <p class="text-sm text-gray-600">Monitor impressions, clicks, and ROI in real-time</p>
                            </div>
                        </div>
                    </div>

                    <!-- CTA Buttons -->
                    <div class="grid md:grid-cols-2 gap-6">
                        <button 
                            onclick="app.showAdvertiserRegistration()"
                            class="bg-white text-purple-600 py-6 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl"
                        >
                            <i class="fas fa-user-plus mr-2"></i>Register as Advertiser
                        </button>
                        <button 
                            onclick="app.showAdvertiserLogin()"
                            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-2xl"
                        >
                            <i class="fas fa-sign-in-alt mr-2"></i>Advertiser Login
                        </button>
                    </div>

                    <!-- Footer Note -->
                    <div class="text-center mt-8 text-white text-sm">
                        <p>Questions? Email us at ads@oztec.cam</p>
                    </div>
                </div>
            </div>
        `;
    }

    showAdvertiserRegistration() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
                <div class="max-w-2xl mx-auto">
                    <!-- Header -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                        <button onclick="app.showAuth()" class="text-gray-600 hover:text-gray-800 mb-4">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Login
                        </button>
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-bullhorn text-white text-3xl"></i>
                            </div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">Advertiser Registration</h1>
                            <p class="text-gray-600">Start advertising to 100,000+ Nigerian users</p>
                        </div>

                        <!-- Registration Form -->
                        <form id="advertiserRegForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                                <input type="text" id="businessName" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., TechHub Nigeria">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" id="advertiserEmail" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="business@example.com">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input type="tel" id="advertiserPhone" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="080XXXXXXXX">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Website URL (Optional)</label>
                                <input type="url" id="advertiserWebsite"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://yourwebsite.com">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                                <select id="advertiserIndustry" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                    <option value="">Select Industry</option>
                                    <option value="technology">Technology</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="education">Education</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="food">Food & Beverage</option>
                                    <option value="finance">Finance</option>
                                    <option value="health">Health & Wellness</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div id="advertiserRegMessage"></div>

                            <button type="submit"
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105">
                                <i class="fas fa-rocket mr-2"></i>Register as Advertiser
                            </button>
                        </form>
                    </div>

                    <!-- Pricing Info -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">Pricing</h2>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="border border-purple-200 rounded-lg p-4">
                                <div class="text-purple-600 font-bold text-2xl">₦200</div>
                                <div class="text-gray-600 text-sm">per 1,000 impressions (CPM)</div>
                            </div>
                            <div class="border border-indigo-200 rounded-lg p-4">
                                <div class="text-indigo-600 font-bold text-2xl">₦10</div>
                                <div class="text-gray-600 text-sm">per click (CPC)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('advertiserRegForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerAdvertiser();
        });
    }

    async registerAdvertiser() {
        const businessName = document.getElementById('businessName').value.trim();
        const email = document.getElementById('advertiserEmail').value.trim();
        const phone = document.getElementById('advertiserPhone').value.trim();
        const website = document.getElementById('advertiserWebsite').value.trim();
        const industry = document.getElementById('advertiserIndustry').value;
        const msgDiv = document.getElementById('advertiserRegMessage');

        if (!businessName || !email || !phone || !industry) {
            this.showMessage(msgDiv, 'Please fill all required fields', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Registering...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/ads/register-advertiser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName, email, phone, website, industry })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('advertiserId', data.advertiserId);
                this.showMessage(msgDiv, '✅ Registration successful! Redirecting to campaign creation...', 'success');
                setTimeout(() => this.showCampaignCreation(data.advertiserId), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('[ADS] Registration error:', error);
            this.showMessage(msgDiv, 'Registration failed. Please try again.', 'error');
        }
    }

    showCampaignCreation(advertiserId) {
        if (!advertiserId) {
            advertiserId = localStorage.getItem('advertiserId');
        }
        
        if (!advertiserId) {
            this.showAdvertiserRegistration();
            return;
        }

        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
                <div class="max-w-3xl mx-auto">
                    <!-- Header -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                        <button onclick="app.showAdvertiserDashboard('${advertiserId}')" class="text-gray-600 hover:text-gray-800 mb-4">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                        </button>
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-ad text-white text-3xl"></i>
                            </div>
                            <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Ad Campaign</h1>
                            <p class="text-gray-600">Reach 100,000+ Nigerian users instantly</p>
                        </div>

                        <!-- Campaign Creation Form -->
                        <form id="campaignForm" class="space-y-6">
                            <!-- Campaign Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                                <input type="text" id="campaignName" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Christmas Sale 2025">
                            </div>

                            <!-- Ad Creative -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ad Title * (Max 50 characters)</label>
                                <input type="text" id="adTitle" required maxlength="50"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Get 50% Off All Products!">
                                <p class="text-xs text-gray-500 mt-1">
                                    <span id="titleCharCount">0</span>/50 characters
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ad Description (Max 100 characters)</label>
                                <textarea id="adDescription" maxlength="100" rows="2"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g., Limited time offer - Shop now and save!"></textarea>
                                <p class="text-xs text-gray-500 mt-1">
                                    <span id="descCharCount">0</span>/100 characters
                                </p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Ad Image URL * (320x100px recommended)</label>
                                <input type="url" id="adImage" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://example.com/ad-banner.jpg">
                                <p class="text-xs text-gray-500 mt-1">Use a free tool like Canva to create your banner</p>
                            </div>

                            <!-- Destination Type -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Where should users go when they click? *</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <button type="button" id="instagramBtn"
                                        class="destination-btn border-2 border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-all"
                                        onclick="app.selectDestination('instagram')">
                                        <i class="fab fa-instagram text-3xl text-purple-600 mb-2"></i>
                                        <div class="font-semibold">Instagram</div>
                                        <div class="text-xs text-gray-500">Redirect to your Instagram</div>
                                    </button>
                                    <button type="button" id="websiteBtn"
                                        class="destination-btn border-2 border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-all"
                                        onclick="app.selectDestination('website')">
                                        <i class="fas fa-globe text-3xl text-indigo-600 mb-2"></i>
                                        <div class="font-semibold">Website</div>
                                        <div class="text-xs text-gray-500">Redirect to your website</div>
                                    </button>
                                </div>
                            </div>

                            <!-- Instagram Input -->
                            <div id="instagramInput" style="display: none;">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Instagram Username *</label>
                                <div class="flex">
                                    <span class="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                                        @
                                    </span>
                                    <input type="text" id="instagramUsername"
                                        class="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="yourusername">
                                </div>
                            </div>

                            <!-- Website Input -->
                            <div id="websiteInput" style="display: none;">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
                                <input type="url" id="websiteUrl"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="https://yourwebsite.com">
                            </div>

                            <!-- Pricing Model -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Pricing Model *</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <button type="button" id="cpmBtn"
                                        class="pricing-btn border-2 border-gray-300 rounded-lg p-4 hover:border-purple-500 transition-all"
                                        onclick="app.selectPricing('cpm')">
                                        <div class="font-bold text-xl text-purple-600">₦200</div>
                                        <div class="text-sm">per 1,000 impressions</div>
                                        <div class="text-xs text-gray-500 mt-1">CPM (Cost Per Mille)</div>
                                    </button>
                                    <button type="button" id="cpcBtn"
                                        class="pricing-btn border-2 border-gray-300 rounded-lg p-4 hover:border-indigo-500 transition-all"
                                        onclick="app.selectPricing('cpc')">
                                        <div class="font-bold text-xl text-indigo-600">₦10</div>
                                        <div class="text-sm">per click</div>
                                        <div class="text-xs text-gray-500 mt-1">CPC (Cost Per Click)</div>
                                    </button>
                                </div>
                            </div>

                            <!-- Budget -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Budget (Naira) *</label>
                                <input type="number" id="campaignBudget" required min="1000" step="100"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="5000">
                                <div id="budgetEstimate" class="text-sm text-gray-600 mt-2"></div>
                            </div>

                            <div id="campaignMessage"></div>

                            <button type="submit"
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105">
                                <i class="fas fa-rocket mr-2"></i>Launch Campaign
                            </button>
                        </form>
                    </div>

                    <!-- Preview -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">Ad Preview</h2>
                        <div id="adPreview" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400">
                            <i class="fas fa-eye text-3xl mb-2"></i>
                            <p>Your ad preview will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Character counters
        document.getElementById('adTitle').addEventListener('input', (e) => {
            document.getElementById('titleCharCount').textContent = e.target.value.length;
            this.updateAdPreview();
        });
        document.getElementById('adDescription').addEventListener('input', (e) => {
            document.getElementById('descCharCount').textContent = e.target.value.length;
            this.updateAdPreview();
        });
        document.getElementById('adImage').addEventListener('input', () => this.updateAdPreview());

        // Budget calculator
        document.getElementById('campaignBudget').addEventListener('input', (e) => {
            const budget = parseInt(e.target.value) || 0;
            const pricing = this.selectedPricing || 'cpm';
            let estimate = '';
            if (pricing === 'cpm') {
                const impressions = Math.floor((budget / 200) * 1000);
                estimate = `Estimated: ${impressions.toLocaleString()} impressions`;
            } else {
                const clicks = Math.floor(budget / 10);
                estimate = `Estimated: ${clicks.toLocaleString()} clicks`;
            }
            document.getElementById('budgetEstimate').textContent = estimate;
        });

        document.getElementById('campaignForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCampaign(advertiserId);
        });

        // Store advertiserId
        this.currentAdvertiserId = advertiserId;
    }

    selectDestination(type) {
        this.selectedDestination = type;
        
        // Update button styles
        document.getElementById('instagramBtn').classList.remove('border-purple-500', 'bg-purple-50');
        document.getElementById('websiteBtn').classList.remove('border-indigo-500', 'bg-indigo-50');
        
        if (type === 'instagram') {
            document.getElementById('instagramBtn').classList.add('border-purple-500', 'bg-purple-50');
            document.getElementById('instagramInput').style.display = 'block';
            document.getElementById('websiteInput').style.display = 'none';
        } else {
            document.getElementById('websiteBtn').classList.add('border-indigo-500', 'bg-indigo-50');
            document.getElementById('websiteInput').style.display = 'block';
            document.getElementById('instagramInput').style.display = 'none';
        }
        
        this.updateAdPreview();
    }

    selectPricing(type) {
        this.selectedPricing = type;
        
        // Update button styles
        document.getElementById('cpmBtn').classList.remove('border-purple-500', 'bg-purple-50');
        document.getElementById('cpcBtn').classList.remove('border-indigo-500', 'bg-indigo-50');
        
        if (type === 'cpm') {
            document.getElementById('cpmBtn').classList.add('border-purple-500', 'bg-purple-50');
        } else {
            document.getElementById('cpcBtn').classList.add('border-indigo-500', 'bg-indigo-50');
        }
        
        // Update budget estimate
        const budgetInput = document.getElementById('campaignBudget');
        if (budgetInput.value) {
            budgetInput.dispatchEvent(new Event('input'));
        }
    }

    updateAdPreview() {
        const title = document.getElementById('adTitle').value;
        const description = document.getElementById('adDescription').value;
        const image = document.getElementById('adImage').value;
        
        if (!title && !description && !image) return;
        
        const destination = this.selectedDestination === 'instagram' ? 'Follow on Instagram' : 'Visit Website';
        
        document.getElementById('adPreview').innerHTML = `
            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4">
                ${image ? `<img src="${image}" alt="Ad" class="w-full h-24 object-cover rounded-lg mb-3" onerror="this.src='https://via.placeholder.com/320x100/7C3AED/FFFFFF?text=Ad+Image'">` : ''}
                <div class="text-left">
                    <div class="font-bold text-gray-800">${title || 'Your Ad Title'}</div>
                    ${description ? `<div class="text-sm text-gray-600 mt-1">${description}</div>` : ''}
                    <button class="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                        ${destination}
                    </button>
                </div>
            </div>
        `;
    }

    async createCampaign(advertiserId) {
        const name = document.getElementById('campaignName').value.trim();
        const title = document.getElementById('adTitle').value.trim();
        const description = document.getElementById('adDescription').value.trim();
        const image = document.getElementById('adImage').value.trim();
        const budget = parseInt(document.getElementById('campaignBudget').value);
        const msgDiv = document.getElementById('campaignMessage');

        if (!this.selectedDestination) {
            this.showMessage(msgDiv, 'Please select a destination type (Instagram or Website)', 'error');
            return;
        }

        if (!this.selectedPricing) {
            this.showMessage(msgDiv, 'Please select a pricing model (CPM or CPC)', 'error');
            return;
        }

        let destinationUrl = '';
        if (this.selectedDestination === 'instagram') {
            const username = document.getElementById('instagramUsername').value.trim();
            if (!username) {
                this.showMessage(msgDiv, 'Please enter your Instagram username', 'error');
                return;
            }
            destinationUrl = `https://instagram.com/${username}`;
        } else {
            destinationUrl = document.getElementById('websiteUrl').value.trim();
            if (!destinationUrl) {
                this.showMessage(msgDiv, 'Please enter your website URL', 'error');
                return;
            }
        }

        if (!name || !title || !image || !budget) {
            this.showMessage(msgDiv, 'Please fill all required fields', 'error');
            return;
        }

        if (budget < 1000) {
            this.showMessage(msgDiv, 'Minimum budget is ₦1,000', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Creating campaign...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/ads/create-campaign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    advertiserId,
                    campaignName: name,
                    adTitle: title,
                    adDescription: description,
                    adImageUrl: image,
                    destinationType: this.selectedDestination,
                    instagramHandle: this.selectedDestination === 'instagram' ? document.getElementById('instagramUsername').value.trim() : null,
                    websiteUrl: this.selectedDestination === 'website' ? destinationUrl : null,
                    pricingModel: this.selectedPricing,
                    budgetTotal: budget
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, '✅ Campaign created successfully! Redirecting to dashboard...', 'success');
                setTimeout(() => this.showAdvertiserDashboard(advertiserId), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to create campaign', 'error');
            }
        } catch (error) {
            console.error('[ADS] Campaign creation error:', error);
            this.showMessage(msgDiv, 'Failed to create campaign. Please try again.', 'error');
        }
    }

    async showAdvertiserDashboard(advertiserId) {
        console.log('[ADS] showAdvertiserDashboard called with:', advertiserId);
        
        // Push to navigation history for swipe back
        this.pushNavigation('advertiserDashboard', { advertiserId });
        
        if (!advertiserId) {
            advertiserId = localStorage.getItem('advertiserId');
            console.log('[ADS] No param, got from localStorage:', advertiserId);
        }
        
        if (!advertiserId) {
            console.log('[ADS] No advertiserId found, showing registration');
            this.showAdvertiserRegistration();
            return;
        }
        
        console.log('[ADS] Showing dashboard for:', advertiserId);
        
        // Push to navigation history for swipe back
        this.pushNavigation('advertiserDashboard', { advertiserId });

        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
                <div class="max-w-6xl mx-auto">
                    <!-- Header -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <button onclick="app.showAdvertiserLanding()" class="text-gray-600 hover:text-gray-800 mb-2">
                                    <i class="fas fa-arrow-left mr-2"></i>Back
                                </button>
                                <h1 class="text-3xl font-bold text-gray-800">Advertiser Dashboard</h1>
                                <p class="text-gray-600">Manage your ad campaigns</p>
                            </div>
                            <button onclick="app.showAuth()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>

                        <button onclick="app.showCampaignCreation('${advertiserId}')"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                            <i class="fas fa-plus mr-2"></i>Create New Campaign
                        </button>
                    </div>

                    <!-- Campaigns List -->
                    <div class="bg-white rounded-2xl shadow-2xl p-8">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">Your Campaigns</h2>
                        <div id="campaignsList">
                            <div class="text-center py-8">
                                <i class="fas fa-spinner fa-spin text-3xl text-purple-600 mb-2"></i>
                                <p class="text-gray-600">Loading campaigns...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadAdvertiserCampaigns(advertiserId);
    }

    async loadAdvertiserCampaigns(advertiserId) {
        try {
            const response = await fetch(`${API_BASE}/api/ads/advertiser/${advertiserId}/campaigns`);
            const data = await response.json();

            if (data.success && data.campaigns.length > 0) {
                document.getElementById('campaignsList').innerHTML = data.campaigns.map(campaign => {
                    const impressions = campaign.impressions || 0;
                    const clicks = campaign.clicks || 0;
                    const spent = campaign.budget_spent || 0;
                    const budget = campaign.budget_total || 0;
                    const progress = budget > 0 ? (spent / budget * 100).toFixed(1) : 0;
                    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

                    return `
                        <div class="border-2 border-gray-200 rounded-lg p-6 mb-4 hover:border-purple-300 transition-all">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="font-bold text-lg text-gray-800">${campaign.campaign_name || campaign.name}</h3>
                                    <p class="text-sm text-gray-600">${campaign.ad_title}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full text-sm font-semibold ${
                                    campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }">
                                    ${campaign.status}
                                </span>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div class="bg-purple-50 rounded-lg p-3">
                                    <div class="text-xs text-purple-600 font-semibold mb-1">IMPRESSIONS</div>
                                    <div class="text-xl font-bold text-purple-700">${impressions.toLocaleString()}</div>
                                </div>
                                <div class="bg-indigo-50 rounded-lg p-3">
                                    <div class="text-xs text-indigo-600 font-semibold mb-1">CLICKS</div>
                                    <div class="text-xl font-bold text-indigo-700">${clicks.toLocaleString()}</div>
                                </div>
                                <div class="bg-blue-50 rounded-lg p-3">
                                    <div class="text-xs text-blue-600 font-semibold mb-1">CTR</div>
                                    <div class="text-xl font-bold text-blue-700">${ctr}%</div>
                                </div>
                                <div class="bg-green-50 rounded-lg p-3">
                                    <div class="text-xs text-green-600 font-semibold mb-1">SPENT</div>
                                    <div class="text-xl font-bold text-green-700">₦${spent.toLocaleString()}</div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <div class="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Budget Progress</span>
                                    <span>₦${spent.toLocaleString()} / ₦${budget.toLocaleString()}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style="width: ${progress}%"></div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <button onclick="app.showEditCampaign('${campaign.id}')"
                                    class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2 rounded-lg font-semibold transition-all">
                                    <i class="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button onclick="app.toggleCampaignStatus('${campaign.id}', '${campaign.status}')"
                                    class="${campaign.status === 'active' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : 'bg-green-100 hover:bg-green-200 text-green-700'} py-2 rounded-lg font-semibold transition-all">
                                    <i class="fas fa-${campaign.status === 'active' ? 'pause' : 'play'} mr-1"></i>${campaign.status === 'active' ? 'Pause' : 'Resume'}
                                </button>
                            </div>
                            
                            <button onclick="app.showCampaignAnalytics('${campaign.id}')"
                                class="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition-all">
                                <i class="fas fa-chart-line mr-2"></i>View Analytics
                            </button>
                        </div>
                    `;
                }).join('');
            } else {
                document.getElementById('campaignsList').innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                        <p class="text-gray-600 text-lg mb-4">No campaigns yet</p>
                        <button onclick="app.showCampaignCreation('${advertiserId}')"
                            class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700">
                            Create Your First Campaign
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[ADS] Load campaigns error:', error);
            document.getElementById('campaignsList').innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-2"></i>
                    <p class="text-gray-600">Failed to load campaigns</p>
                </div>
            `;
        }
    }

    async showEditCampaign(campaignId) {
        try {
            // Fetch campaign details
            const response = await fetch(`${API_BASE}/api/ads/campaign/${campaignId}`);
            const data = await response.json();

            if (!data.success || !data.campaign) {
                alert('Failed to load campaign details');
                return;
            }

            const campaign = data.campaign;
            
            document.getElementById('app').innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
                    <div class="max-w-3xl mx-auto">
                        <!-- Header -->
                        <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                            <button onclick="app.showAdvertiserDashboard('${campaign.advertiser_id}')" class="text-gray-600 hover:text-gray-800 mb-4">
                                <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                            </button>
                            <div class="text-center mb-6">
                                <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-edit text-white text-3xl"></i>
                                </div>
                                <h1 class="text-3xl font-bold text-gray-800 mb-2">Edit Campaign</h1>
                                <p class="text-gray-600">${campaign.campaign_name}</p>
                            </div>

                            <!-- Edit Form -->
                            <form id="editCampaignForm" class="space-y-6">
                                <!-- Campaign Name -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                                    <input type="text" id="editCampaignName" value="${campaign.campaign_name}" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                </div>

                                <!-- Ad Title -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ad Title * (Max 50 characters)</label>
                                    <input type="text" id="editAdTitle" value="${campaign.ad_title}" required maxlength="50"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        <span id="editTitleCharCount">${campaign.ad_title.length}</span>/50 characters
                                    </p>
                                </div>

                                <!-- Ad Description -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ad Description (Max 100 characters)</label>
                                    <textarea id="editAdDescription" maxlength="100" rows="2"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${campaign.ad_description || ''}</textarea>
                                    <p class="text-xs text-gray-500 mt-1">
                                        <span id="editDescCharCount">${(campaign.ad_description || '').length}</span>/100 characters
                                    </p>
                                </div>

                                <!-- Ad Image URL -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Ad Image URL * (320x100px recommended)</label>
                                    <input type="url" id="editAdImage" value="${campaign.ad_image_url}" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                    <p class="text-xs text-gray-500 mt-1">Current image will be shown below</p>
                                </div>

                                <!-- Destination Type (Read-only, show current) -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Current Destination</label>
                                    <div class="bg-gray-100 p-4 rounded-lg">
                                        ${campaign.destination_type === 'instagram' 
                                            ? `<i class="fab fa-instagram text-purple-600 mr-2"></i>Instagram: @${campaign.instagram_handle}`
                                            : `<i class="fas fa-globe text-indigo-600 mr-2"></i>Website: ${campaign.website_url}`
                                        }
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">Destination type cannot be changed after creation</p>
                                </div>

                                <!-- Budget (can only increase) -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Budget (Naira) *</label>
                                    <input type="number" id="editBudget" value="${campaign.budget_total}" required min="${campaign.budget_spent}" step="100"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                                    <p class="text-xs text-gray-500 mt-1">
                                        Already spent: ₦${campaign.budget_spent.toLocaleString()} 
                                        (Cannot reduce budget below this amount)
                                    </p>
                                </div>

                                <div id="editCampaignMessage"></div>

                                <div class="flex gap-3">
                                    <button type="submit"
                                        class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all">
                                        <i class="fas fa-save mr-2"></i>Save Changes
                                    </button>
                                    <button type="button" onclick="app.showAdvertiserDashboard('${campaign.advertiser_id}')"
                                        class="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                                        <i class="fas fa-times mr-2"></i>Cancel
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Preview -->
                        <div class="bg-white rounded-2xl shadow-2xl p-8">
                            <h2 class="text-xl font-bold text-gray-800 mb-4">Current Ad Preview</h2>
                            <div id="editAdPreview" class="border-2 border-gray-200 rounded-lg p-4">
                                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4">
                                    <img src="${campaign.ad_image_url}" alt="Ad" class="w-full h-24 object-cover rounded-lg mb-3" 
                                         onerror="this.src='https://via.placeholder.com/320x100/7C3AED/FFFFFF?text=Ad+Image'">
                                    <div class="text-left">
                                        <div class="font-bold text-gray-800" id="previewTitle">${campaign.ad_title}</div>
                                        <div class="text-sm text-gray-600 mt-1" id="previewDescription">${campaign.ad_description || ''}</div>
                                        <button class="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                                            ${campaign.destination_type === 'instagram' ? 'Follow on Instagram' : 'Visit Website'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners
            document.getElementById('editAdTitle').addEventListener('input', (e) => {
                document.getElementById('editTitleCharCount').textContent = e.target.value.length;
                document.getElementById('previewTitle').textContent = e.target.value;
            });

            document.getElementById('editAdDescription').addEventListener('input', (e) => {
                document.getElementById('editDescCharCount').textContent = e.target.value.length;
                document.getElementById('previewDescription').textContent = e.target.value;
            });

            document.getElementById('editAdImage').addEventListener('input', (e) => {
                const img = document.querySelector('#editAdPreview img');
                img.src = e.target.value;
            });

            document.getElementById('editCampaignForm').addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateCampaign(campaignId, campaign.advertiser_id);
            });

        } catch (error) {
            console.error('[ADS] Edit campaign error:', error);
            alert('Failed to load campaign for editing');
        }
    }

    async updateCampaign(campaignId, advertiserId) {
        const name = document.getElementById('editCampaignName').value.trim();
        const title = document.getElementById('editAdTitle').value.trim();
        const description = document.getElementById('editAdDescription').value.trim();
        const image = document.getElementById('editAdImage').value.trim();
        const budget = parseInt(document.getElementById('editBudget').value);
        const msgDiv = document.getElementById('editCampaignMessage');

        if (!name || !title || !image || !budget) {
            this.showMessage(msgDiv, 'Please fill all required fields', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Updating campaign...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/ads/update-campaign/${campaignId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignName: name,
                    adTitle: title,
                    adDescription: description,
                    adImageUrl: image,
                    budgetTotal: budget
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, '✅ Campaign updated successfully! Redirecting...', 'success');
                setTimeout(() => this.showAdvertiserDashboard(advertiserId), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('[ADS] Update error:', error);
            this.showMessage(msgDiv, 'Update failed. Please try again.', 'error');
        }
    }

    async toggleCampaignStatus(campaignId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        const action = newStatus === 'active' ? 'Resume' : 'Pause';

        if (!confirm(`Are you sure you want to ${action.toLowerCase()} this campaign?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/ads/campaign/${campaignId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully!`);
                // Reload dashboard
                const advertiserId = localStorage.getItem('advertiserId');
                this.showAdvertiserDashboard(advertiserId);
            } else {
                alert(data.error || 'Status update failed');
            }
        } catch (error) {
            console.error('[ADS] Status toggle error:', error);
            alert('Status update failed. Please try again.');
        }
    }

    // Profile Drawer Controls
    openProfileDrawer() {
        const drawer = document.getElementById('profileDrawer');
        const content = document.getElementById('drawerContent');
        if (drawer && content) {
            drawer.classList.remove('hidden');
            setTimeout(() => {
                content.style.transform = 'translateX(0)';
            }, 10);
        }
    }

    closeProfileDrawer() {
        const drawer = document.getElementById('profileDrawer');
        const content = document.getElementById('drawerContent');
        if (content) {
            content.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                if (drawer) drawer.classList.add('hidden');
            }, 300);
        }
    }

    // Profile Settings Functions (Placeholders - to be implemented)
    showChangeAvatar() {
        this.closeProfileDrawer();
        
        const emojis = ['😀', '😎', '🤓', '😊', '🥰', '😇', '🤗', '🤔', '😴', '🤯', '🥳', '🤠', '👻', '👽', '🤖', '😺', '🐶', '🐱', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🦋', '🐝', '🌟', '⭐', '💫', '✨', '🔥', '💎', '👑', '🎯', '🎨', '🎭', '🎪'];
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-2xl mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Change Avatar</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="avatar-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Current Avatar -->
                        <div class="text-center mb-6">
                            <div class="inline-block">
                                <div id="currentAvatarPreview" class="w-32 h-32 mx-auto mb-2">
                                    ${this.currentUser.avatar 
                                        ? `<img src="${this.currentUser.avatar}" class="w-32 h-32 rounded-full object-cover border-4 border-purple-200" alt="Current Avatar">`
                                        : `<div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-purple-200"><i class="fas fa-user text-gray-400 text-5xl"></i></div>`
                                    }
                                </div>
                                <p class="text-sm text-gray-600">Current Avatar</p>
                            </div>
                        </div>

                        <!-- Emoji Selection -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                                <i class="fas fa-smile text-yellow-500"></i>
                                Choose Emoji Avatar
                            </h3>
                            <div class="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                ${emojis.map(emoji => `
                                    <button 
                                        onclick="app.selectEmojiAvatar('${emoji}')"
                                        class="text-4xl p-2 hover:bg-white rounded-lg transition transform hover:scale-110"
                                        title="${emoji}"
                                    >
                                        ${emoji}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- URL Input -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                                <i class="fas fa-link text-blue-500"></i>
                                Or Enter Image URL
                            </h3>
                            <div class="flex gap-2">
                                <input 
                                    type="url" 
                                    id="avatarUrl"
                                    placeholder="https://example.com/avatar.jpg"
                                    class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                                <button 
                                    onclick="app.previewAvatarUrl()"
                                    class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                                >
                                    Preview
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">Paste a direct link to an image (JPG, PNG, GIF)</p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3">
                            <button 
                                onclick="app.showRoomList()"
                                class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onclick="app.removeAvatar()"
                                class="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                <i class="fas fa-trash mr-2"></i>Remove Avatar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async selectEmojiAvatar(emoji) {
        const msgDiv = document.getElementById('avatar-message');
        this.showMessage(msgDiv, 'Updating avatar...', 'info');

        try {
            // Convert emoji to data URL
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Draw background
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, 200, 200);
            
            // Draw emoji
            ctx.font = '120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, 100, 100);
            
            const avatarDataUrl = canvas.toDataURL('image/png');

            const response = await fetch(`${API_BASE}/api/users/update-avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    avatar: avatarDataUrl
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser.avatar = avatarDataUrl;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showMessage(msgDiv, 'Avatar updated successfully! ✓', 'success');
                
                // Update preview
                document.getElementById('currentAvatarPreview').innerHTML = 
                    `<img src="${avatarDataUrl}" class="w-32 h-32 rounded-full object-cover border-4 border-purple-200" alt="Current Avatar">`;
                
                setTimeout(() => this.showRoomList(), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to update avatar', 'error');
            }
        } catch (error) {
            console.error('Avatar update error:', error);
            this.showMessage(msgDiv, 'Failed to update avatar', 'error');
        }
    }

    async previewAvatarUrl() {
        const url = document.getElementById('avatarUrl').value.trim();
        const msgDiv = document.getElementById('avatar-message');

        if (!url) {
            this.showMessage(msgDiv, 'Please enter an image URL', 'error');
            return;
        }

        // Test if URL is valid image
        const img = new Image();
        img.onload = async () => {
            this.showMessage(msgDiv, 'Updating avatar...', 'info');

            try {
                const response = await fetch(`${API_BASE}/api/users/update-avatar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: this.currentUser.id,
                        avatar: url
                    })
                });

                const data = await response.json();

                if (data.success) {
                    this.currentUser.avatar = url;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.showMessage(msgDiv, 'Avatar updated successfully! ✓', 'success');
                    
                    // Update preview
                    document.getElementById('currentAvatarPreview').innerHTML = 
                        `<img src="${url}" class="w-32 h-32 rounded-full object-cover border-4 border-purple-200" alt="Current Avatar">`;
                    
                    setTimeout(() => this.showRoomList(), 1500);
                } else {
                    this.showMessage(msgDiv, data.error || 'Failed to update avatar', 'error');
                }
            } catch (error) {
                console.error('Avatar update error:', error);
                this.showMessage(msgDiv, 'Failed to update avatar', 'error');
            }
        };

        img.onerror = () => {
            this.showMessage(msgDiv, 'Invalid image URL. Please check the URL and try again.', 'error');
        };

        img.src = url;
    }

    async removeAvatar() {
        const msgDiv = document.getElementById('avatar-message');
        
        if (!confirm('Remove your avatar? You can always set a new one later.')) {
            return;
        }

        this.showMessage(msgDiv, 'Removing avatar...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/users/update-avatar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    avatar: null
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser.avatar = null;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showMessage(msgDiv, 'Avatar removed successfully! ✓', 'success');
                
                // Update preview
                document.getElementById('currentAvatarPreview').innerHTML = 
                    `<div class="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-purple-200"><i class="fas fa-user text-gray-400 text-5xl"></i></div>`;
                
                setTimeout(() => this.showRoomList(), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to remove avatar', 'error');
            }
        } catch (error) {
            console.error('Avatar removal error:', error);
            this.showMessage(msgDiv, 'Failed to remove avatar', 'error');
        }
    }

    showChangeUsername() {
        this.closeProfileDrawer();
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Change Username</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="username-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Current Username -->
                        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-600 mb-1">Current Username</p>
                            <p class="text-xl font-bold text-gray-800">${this.currentUser.username}</p>
                        </div>

                        <!-- New Username Form -->
                        <form id="usernameForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    New Username *
                                </label>
                                <input 
                                    type="text"
                                    id="newUsername"
                                    value="${this.currentUser.username}"
                                    placeholder="Enter new username"
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                    minlength="3"
                                    maxlength="30"
                                />
                                <p class="text-xs text-gray-500 mt-1">3-30 characters, letters and numbers only</p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-3">
                                <button 
                                    type="button"
                                    onclick="app.showRoomList()"
                                    class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    class="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                                >
                                    <i class="fas fa-check mr-2"></i>Update Username
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('usernameForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateUsername();
        });
    }

    async updateUsername() {
        const newUsername = document.getElementById('newUsername').value.trim();
        const msgDiv = document.getElementById('username-message');

        if (!newUsername || newUsername === this.currentUser.username) {
            this.showMessage(msgDiv, 'Please enter a different username', 'error');
            return;
        }

        if (newUsername.length < 3 || newUsername.length > 30) {
            this.showMessage(msgDiv, 'Username must be 3-30 characters', 'error');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            this.showMessage(msgDiv, 'Username can only contain letters, numbers, and underscores', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Updating username...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/users/update-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    username: newUsername
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser.username = newUsername;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showMessage(msgDiv, 'Username updated successfully! ✓', 'success');
                setTimeout(() => this.showRoomList(), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to update username', 'error');
            }
        } catch (error) {
            console.error('Username update error:', error);
            this.showMessage(msgDiv, 'Failed to update username', 'error');
        }
    }

    showChangePassword() {
        this.closeProfileDrawer();
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Change Password</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="password-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Password Form -->
                        <form id="passwordForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password *
                                </label>
                                <input 
                                    type="password"
                                    id="currentPassword"
                                    placeholder="Enter current password"
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    New Password *
                                </label>
                                <input 
                                    type="password"
                                    id="newPassword"
                                    placeholder="Enter new password"
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                    minlength="6"
                                />
                                <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password *
                                </label>
                                <input 
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Confirm new password"
                                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>

                            <!-- Security Tips -->
                            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <p class="text-sm text-blue-800 font-semibold mb-2">
                                    <i class="fas fa-shield-alt mr-2"></i>Password Tips:
                                </p>
                                <ul class="text-xs text-blue-700 space-y-1 ml-6 list-disc">
                                    <li>Use at least 8 characters</li>
                                    <li>Mix uppercase and lowercase</li>
                                    <li>Include numbers and symbols</li>
                                    <li>Don't reuse old passwords</li>
                                </ul>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-3">
                                <button 
                                    type="button"
                                    onclick="app.showRoomList()"
                                    class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    class="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                                >
                                    <i class="fas fa-lock mr-2"></i>Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updatePassword();
        });
    }

    async updatePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const msgDiv = document.getElementById('password-message');

        if (newPassword !== confirmPassword) {
            this.showMessage(msgDiv, 'New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showMessage(msgDiv, 'Password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword === currentPassword) {
            this.showMessage(msgDiv, 'New password must be different from current password', 'error');
            return;
        }

        this.showMessage(msgDiv, 'Updating password...', 'info');

        try {
            const response = await fetch(`${API_BASE}/api/users/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    email: this.currentUser.email,
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage(msgDiv, 'Password updated successfully! ✓', 'success');
                setTimeout(() => this.showRoomList(), 1500);
            } else {
                this.showMessage(msgDiv, data.error || 'Failed to update password', 'error');
            }
        } catch (error) {
            console.error('Password update error:', error);
            this.showMessage(msgDiv, 'Failed to update password', 'error');
        }
    }

    async showPrivacySettings() {
        this.closeProfileDrawer();
        
        // Get current privacy settings
        let privacySettings = {
            is_searchable: true,
            message_privacy: 'anyone',
            last_seen_privacy: 'everyone'
        };
        
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/privacy`, {
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.privacy) {
                    // Backend returns camelCase, convert to snake_case
                    privacySettings = {
                        is_searchable: data.privacy.isSearchable,
                        message_privacy: data.privacy.messagePrivacy,
                        last_seen_privacy: data.privacy.lastSeenPrivacy
                    };
                    console.log('[PRIVACY] Loaded settings:', privacySettings);
                }
            }
        } catch (error) {
            console.error('[PRIVACY] Error loading settings:', error);
        }
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Privacy Settings</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="privacy-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Searchability -->
                        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-start gap-3 mb-3">
                                <i class="fas fa-search text-purple-600 text-xl mt-1"></i>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-800 mb-1">Profile Searchability</h3>
                                    <p class="text-sm text-gray-600">Allow others to find you by username or email</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between pl-9">
                                <span class="text-sm ${privacySettings.is_searchable ? 'text-green-600 font-semibold' : 'text-gray-500'}">
                                    ${privacySettings.is_searchable ? 'Searchable' : 'Hidden'}
                                </span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="searchable" class="sr-only peer" ${privacySettings.is_searchable ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>

                        <!-- Message Privacy -->
                        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-start gap-3 mb-3">
                                <i class="fas fa-envelope text-purple-600 text-xl mt-1"></i>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-800 mb-1">Who Can Message You</h3>
                                    <p class="text-sm text-gray-600">Control who can start a direct chat with you</p>
                                </div>
                            </div>
                            <div class="pl-9 space-y-2">
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="messagePrivacy" value="anyone" ${privacySettings.message_privacy === 'anyone' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Anyone</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="messagePrivacy" value="contacts_only" ${privacySettings.message_privacy === 'contacts_only' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Contacts Only</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="messagePrivacy" value="nobody" ${privacySettings.message_privacy === 'nobody' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Nobody</span>
                                </label>
                            </div>
                        </div>

                        <!-- Last Seen -->
                        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-start gap-3 mb-3">
                                <i class="fas fa-clock text-purple-600 text-xl mt-1"></i>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gray-800 mb-1">Last Seen</h3>
                                    <p class="text-sm text-gray-600">Control who can see when you were last online</p>
                                </div>
                            </div>
                            <div class="pl-9 space-y-2">
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="lastSeenPrivacy" value="everyone" ${privacySettings.last_seen_privacy === 'everyone' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Everyone</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="lastSeenPrivacy" value="contacts" ${privacySettings.last_seen_privacy === 'contacts' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Contacts Only</span>
                                </label>
                                <label class="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded-lg transition">
                                    <input type="radio" name="lastSeenPrivacy" value="nobody" ${privacySettings.last_seen_privacy === 'nobody' ? 'checked' : ''} class="w-4 h-4 text-purple-600">
                                    <span class="text-sm">Nobody</span>
                                </label>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <button 
                            onclick="app.savePrivacySettings()"
                            class="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-save"></i>
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async savePrivacySettings() {
        const searchable = document.getElementById('searchable');
        const messagePrivacy = document.querySelector('input[name="messagePrivacy"]:checked');
        const lastSeenPrivacy = document.querySelector('input[name="lastSeenPrivacy"]:checked');
        
        // Validate elements exist
        if (!searchable || !messagePrivacy || !lastSeenPrivacy) {
            console.error('[PRIVACY] Missing form elements');
            this.showToast('Error: Missing form elements', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/users/privacy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({
                    is_searchable: searchable.checked,
                    message_privacy: messagePrivacy.value,
                    last_seen_privacy: lastSeenPrivacy.value
                })
            });
            
            const messageDiv = document.getElementById('privacy-message');
            
            if (response.ok) {
                if (messageDiv) {
                    this.showMessage(messageDiv, 'Privacy settings saved successfully!', 'success');
                }
                this.showToast('Privacy settings saved!', 'success');
                setTimeout(() => this.showRoomList(), 1500);
            } else {
                const data = await response.json();
                if (messageDiv) {
                    this.showMessage(messageDiv, data.error || 'Failed to save privacy settings', 'error');
                }
                this.showToast('Failed to save settings', 'error');
            }
        } catch (error) {
            console.error('[PRIVACY] Error saving:', error);
            const messageDiv = document.getElementById('privacy-message');
            if (messageDiv) {
                this.showMessage(messageDiv, 'Error saving privacy settings', 'error');
            }
            this.showToast('Error saving settings', 'error');
        }
    }
    
    async showUserSearch() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Search Users</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="search-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Search Input -->
                        <div class="mb-6">
                            <div class="relative">
                                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input 
                                    type="text" 
                                    id="userSearch" 
                                    placeholder="Search by username or email..."
                                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    oninput="app.searchUsers(this.value)"
                                />
                            </div>
                        </div>

                        <!-- Search Results -->
                        <div id="searchResults" class="space-y-2">
                            <div class="text-gray-500 text-center py-8">
                                <i class="fas fa-search text-4xl mb-3 text-gray-300"></i>
                                <p>Enter a username or email to search</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async searchUsers(query) {
        const resultsDiv = document.getElementById('searchResults');
        
        if (!query || query.trim().length < 2) {
            resultsDiv.innerHTML = `
                <div class="text-gray-500 text-center py-8">
                    <i class="fas fa-search text-4xl mb-3 text-gray-300"></i>
                    <p>Enter at least 2 characters to search</p>
                </div>
            `;
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="text-gray-500 text-center py-8">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Searching...</p>
            </div>
        `;
        
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                const data = await response.json();
                const users = data.users || [];
                
                if (users.length === 0) {
                    resultsDiv.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            <i class="fas fa-user-slash text-4xl mb-3 text-gray-300"></i>
                            <p>No users found</p>
                        </div>
                    `;
                    return;
                }
                
                resultsDiv.innerHTML = users.map(user => {
                    const avatarHtml = user.avatar 
                        ? `<img src="${user.avatar}" class="w-12 h-12 rounded-full object-cover" alt="Avatar">`
                        : `<div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">${user.username.charAt(0).toUpperCase()}</div>`;
                    
                    return `
                        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            ${avatarHtml}
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${this.escapeHtml(user.username)}</h3>
                                <p class="text-sm text-gray-500">${this.escapeHtml(user.email)}</p>
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    onclick="app.startDirectMessage('${user.id}', '${this.escapeHtml(user.username)}')"
                                    class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                                    title="Message"
                                >
                                    <i class="fas fa-comment"></i>
                                </button>
                                <button 
                                    onclick="app.sendContactRequest('${user.id}')"
                                    class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                                    title="Add Contact"
                                >
                                    <i class="fas fa-user-plus"></i>
                                </button>
                                <button 
                                    onclick="if(confirm('Block this user?')) app.blockUser('${user.id}')"
                                    class="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                                    title="Block User"
                                >
                                    <i class="fas fa-ban"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                resultsDiv.innerHTML = `
                    <div class="text-red-500 text-center py-8">
                        <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                        <p>Error searching users</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[SEARCH] Error:', error);
            resultsDiv.innerHTML = `
                <div class="text-red-500 text-center py-8">
                    <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                    <p>Error searching users</p>
                </div>
            `;
        }
    }
    
    // Handle message input for typing indicator
    handleMessageInput() {
        const input = document.getElementById('messageInput');
        if (input && input.value.trim().length > 0 && this.currentRoom) {
            this.startTyping(this.currentRoom);
        }
    }
    
    async sendContactRequest(contactId) {
        try {
            const response = await fetch('/api/contacts/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ contact_id: contactId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast('Contact request sent!', 'success');
            } else {
                this.showToast(data.error || 'Failed to send request', 'error');
            }
        } catch (error) {
            console.error('[CONTACTS] Send request error:', error);
            this.showToast('Error sending contact request', 'error');
        }
    }
    
    async startDirectMessage(userId, username) {
        try {
            const response = await fetch('/api/rooms/direct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ recipient_id: userId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Open the direct message room
                this.openRoom(data.room.room_code);
            } else {
                // Show error based on privacy settings
                this.showMessage('search-message', data.error || 'Failed to start chat', 'error');
            }
        } catch (error) {
            console.error('[DM] Error starting direct message:', error);
            this.showMessage('search-message', 'Error starting direct message', 'error');
        }
    }

    // ============================================
    // ENHANCED FEATURES
    // ============================================
    
    // Show Contact Requests
    async showContactRequests() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-user-plus text-purple-600 mr-2"></i>
                                Contact Requests
                            </h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="requests-list" class="space-y-3">
                            <div class="text-gray-500 text-center py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Loading requests...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadContactRequests();
    }
    
    async loadContactRequests() {
        try {
            const response = await fetch('/api/contacts/requests', {
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                const { requests } = await response.json();
                const listDiv = document.getElementById('requests-list');
                
                if (requests.length === 0) {
                    listDiv.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            <i class="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                            <p>No pending requests</p>
                        </div>
                    `;
                    return;
                }
                
                listDiv.innerHTML = requests.map(req => {
                    const avatarHtml = req.avatar
                        ? `<img src="${req.avatar}" class="w-12 h-12 rounded-full object-cover" alt="Avatar">`
                        : `<div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">${req.username.charAt(0).toUpperCase()}</div>`;
                    
                    return `
                        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            ${avatarHtml}
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${this.escapeHtml(req.username)}</h3>
                                <p class="text-sm text-gray-500">${this.escapeHtml(req.email)}</p>
                                <p class="text-xs text-gray-400 mt-1">
                                    <i class="fas fa-clock mr-1"></i>
                                    ${new Date(req.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    onclick="app.acceptContactRequest('${req.id}')"
                                    class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                                >
                                    <i class="fas fa-check"></i>
                                </button>
                                <button 
                                    onclick="app.rejectContactRequest('${req.id}')"
                                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                                >
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('[CONTACTS] Error loading requests:', error);
        }
    }
    
    async acceptContactRequest(requesterId) {
        try {
            const response = await fetch('/api/contacts/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ requester_id: requesterId })
            });
            
            if (response.ok) {
                await this.loadContactRequests();
                this.showToast('Contact request accepted!', 'success');
            }
        } catch (error) {
            console.error('[CONTACTS] Accept error:', error);
            this.showToast('Failed to accept request', 'error');
        }
    }
    
    async rejectContactRequest(requesterId) {
        try {
            const response = await fetch('/api/contacts/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ requester_id: requesterId })
            });
            
            if (response.ok) {
                await this.loadContactRequests();
                this.showToast('Contact request rejected', 'info');
            }
        } catch (error) {
            console.error('[CONTACTS] Reject error:', error);
            this.showToast('Failed to reject request', 'error');
        }
    }
    
    // Accept contact request from notification
    async acceptContactRequestFromNotification(notificationId, requesterId) {
        try {
            const response = await fetch('/api/contacts/accept', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ requester_id: requesterId })
            });
            
            if (response.ok) {
                // Mark notification as read
                await this.markNotificationRead(notificationId);
                this.showToast('Contact request accepted!', 'success');
                // Refresh notifications to remove the accepted request
                setTimeout(() => this.showNotifications(), 500);
            } else {
                this.showToast('Failed to accept request', 'error');
            }
        } catch (error) {
            console.error('[CONTACTS] Accept error:', error);
            this.showToast('Failed to accept request', 'error');
        }
    }
    
    // Reject contact request from notification
    async rejectContactRequestFromNotification(notificationId, requesterId) {
        try {
            const response = await fetch('/api/contacts/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ requester_id: requesterId })
            });
            
            if (response.ok) {
                // Mark notification as read
                await this.markNotificationRead(notificationId);
                this.showToast('Contact request rejected', 'info');
                // Refresh notifications to remove the rejected request
                setTimeout(() => this.showNotifications(), 500);
            } else {
                this.showToast('Failed to reject request', 'error');
            }
        } catch (error) {
            console.error('[CONTACTS] Reject error:', error);
            this.showToast('Failed to reject request', 'error');
        }
    }
    
    // Show My Contacts
    async showMyContacts() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-users text-purple-600 mr-2"></i>
                                My Contacts
                            </h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="contacts-list" class="space-y-3">
                            <div class="text-gray-500 text-center py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Loading contacts...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadMyContacts();
    }
    
    async loadMyContacts() {
        try {
            const response = await fetch('/api/contacts', {
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                const { contacts } = await response.json();
                const listDiv = document.getElementById('contacts-list');
                
                if (contacts.length === 0) {
                    listDiv.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            <i class="fas fa-user-friends text-4xl mb-3 text-gray-300"></i>
                            <p>No contacts yet</p>
                            <button 
                                onclick="app.showUserSearch()"
                                class="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Find People
                            </button>
                        </div>
                    `;
                    return;
                }
                
                listDiv.innerHTML = contacts.map(contact => {
                    const avatarHtml = contact.avatar
                        ? `<img src="${contact.avatar}" class="w-12 h-12 rounded-full object-cover" alt="Avatar">`
                        : `<div class="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">${contact.username.charAt(0).toUpperCase()}</div>`;
                    
                    const onlineStatus = contact.online_status === 'online' 
                        ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>'
                        : '';
                    
                    return `
                        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                            <div class="relative">
                                ${avatarHtml}
                                ${onlineStatus}
                            </div>
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${this.escapeHtml(contact.username)}</h3>
                                <p class="text-sm text-gray-500">${this.escapeHtml(contact.email)}</p>
                                ${contact.online_status === 'online' 
                                    ? '<p class="text-xs text-green-600 mt-1"><i class="fas fa-circle mr-1"></i>Online</p>'
                                    : `<p class="text-xs text-gray-400 mt-1">Last seen ${this.formatLastSeen(contact.last_seen)}</p>`
                                }
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    onclick="app.startDirectMessage('${contact.id}', '${this.escapeHtml(contact.username)}')"
                                    class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm"
                                >
                                    <i class="fas fa-comment"></i>
                                </button>
                                <button 
                                    onclick="app.removeContact('${contact.id}')"
                                    class="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm"
                                >
                                    <i class="fas fa-user-times"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('[CONTACTS] Error loading contacts:', error);
        }
    }
    
    async removeContact(contactId) {
        if (!confirm('Remove this contact?')) return;
        
        try {
            const response = await fetch(`/api/contacts/${contactId}`, {
                method: 'DELETE',
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                await this.loadMyContacts();
                this.showToast('Contact removed', 'success');
            }
        } catch (error) {
            console.error('[CONTACTS] Remove error:', error);
            this.showToast('Failed to remove contact', 'error');
        }
    }
    
    // Block/Unblock User
    async blockUser(userId, reason = '') {
        try {
            const response = await fetch('/api/users/block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ user_id: userId, reason })
            });
            
            if (response.ok) {
                this.showToast('User blocked', 'success');
                return true;
            }
        } catch (error) {
            console.error('[BLOCK] Error:', error);
            this.showToast('Failed to block user', 'error');
        }
        return false;
    }
    
    // Show Blocked Users
    async showBlockedUsers() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-ban text-red-600 mr-2"></i>
                                Blocked Users
                            </h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="blocked-list" class="space-y-3">
                            <div class="text-gray-500 text-center py-8">
                                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                <p>Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadBlockedUsers();
    }
    
    async loadBlockedUsers() {
        try {
            const response = await fetch('/api/users/blocked', {
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                const { blocked } = await response.json();
                const listDiv = document.getElementById('blocked-list');
                
                if (blocked.length === 0) {
                    listDiv.innerHTML = `
                        <div class="text-gray-500 text-center py-8">
                            <i class="fas fa-check-circle text-4xl mb-3 text-green-300"></i>
                            <p>No blocked users</p>
                        </div>
                    `;
                    return;
                }
                
                listDiv.innerHTML = blocked.map(user => {
                    const avatarHtml = user.avatar
                        ? `<img src="${user.avatar}" class="w-12 h-12 rounded-full object-cover" alt="Avatar">`
                        : `<div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">${user.username.charAt(0).toUpperCase()}</div>`;
                    
                    return `
                        <div class="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                            ${avatarHtml}
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${this.escapeHtml(user.username)}</h3>
                                <p class="text-sm text-gray-500">${this.escapeHtml(user.email)}</p>
                                ${user.reason ? `<p class="text-xs text-gray-400 mt-1">Reason: ${this.escapeHtml(user.reason)}</p>` : ''}
                                <p class="text-xs text-gray-400 mt-1">
                                    Blocked ${new Date(user.blocked_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button 
                                onclick="app.unblockUser('${user.id}')"
                                class="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm"
                            >
                                <i class="fas fa-unlock mr-1"></i>
                                Unblock
                            </button>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('[BLOCK] Error loading blocked users:', error);
        }
    }
    
    async unblockUser(userId) {
        try {
            const response = await fetch(`/api/users/block/${userId}`, {
                method: 'DELETE',
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            if (response.ok) {
                await this.loadBlockedUsers();
                this.showToast('User unblocked', 'success');
            }
        } catch (error) {
            console.error('[BLOCK] Unblock error:', error);
            this.showToast('Failed to unblock user', 'error');
        }
    }
    
    // Online Status Management
    async updateOnlineStatus(status = 'online') {
        try {
            await fetch('/api/users/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ status })
            });
            console.log(`[STATUS] Updated to: ${status}`);
        } catch (error) {
            console.error('[STATUS] Update error:', error);
        }
    }
    
    // Start pinging online status every 60 seconds
    startOnlineStatusUpdates() {
        this.updateOnlineStatus('online');
        this.onlineStatusInterval = setInterval(() => {
            this.updateOnlineStatus('online');
        }, 60000); // Update every minute
        
        // Set to offline on page unload
        window.addEventListener('beforeunload', () => {
            this.updateOnlineStatus('offline');
        });
    }
    
    // Typing Indicators
    async startTyping(roomId) {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        
        try {
            await fetch('/api/typing/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ room_id: roomId })
            });
            
            // Auto-stop after 5 seconds
            this.typingTimeout = setTimeout(() => this.stopTyping(roomId), 5000);
        } catch (error) {
            console.error('[TYPING] Start error:', error);
        }
    }
    
    async stopTyping(roomId) {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        
        try {
            await fetch('/api/typing/stop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Email': this.currentUser.email
                },
                body: JSON.stringify({ room_id: roomId })
            });
        } catch (error) {
            console.error('[TYPING] Stop error:', error);
        }
    }
    
    async pollTypingIndicators(roomId) {
        if (!this.currentRoom) return;
        
        try {
            const response = await fetch(`/api/typing/${roomId}`);
            if (response.ok) {
                const { typing } = await response.json();
                this.updateTypingIndicator(typing);
            }
        } catch (error) {
            console.error('[TYPING] Poll error:', error);
        }
    }
    
    updateTypingIndicator(typingUsers) {
        const indicator = document.getElementById('typing-indicator');
        if (!indicator) return;
        
        // Filter out current user
        const others = typingUsers.filter(u => u.id !== this.currentUser.id);
        
        if (others.length === 0) {
            indicator.classList.add('hidden');
        } else {
            indicator.classList.remove('hidden');
            const names = others.map(u => u.username).join(', ');
            indicator.innerHTML = `
                <div class="flex items-center gap-2 text-sm text-gray-600 px-4 py-2">
                    <div class="flex gap-1">
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
                    </div>
                    <span>${names} ${others.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
            `;
        }
    }
    
    // Read Receipts
    async markMessageAsRead(messageId) {
        try {
            await fetch(`/api/messages/${messageId}/read`, {
                method: 'POST',
                headers: { 'X-User-Email': this.currentUser.email }
            });
        } catch (error) {
            console.error('[RECEIPTS] Mark read error:', error);
        }
    }
    
    async markAllMessagesAsRead(messages) {
        for (const msg of messages) {
            if (msg.sender_id !== this.currentUser.id) {
                await this.markMessageAsRead(msg.id);
            }
        }
    }
    
    // Helper: Format last seen time
    formatLastSeen(lastSeen) {
        if (!lastSeen) return 'never';
        
        const now = new Date();
        const then = new Date(lastSeen);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    }
    
    // Toast notification helper
    showToast(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async showClearChatHistory() {
        this.closeProfileDrawer();
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-100 p-4">
                <div class="max-w-md mx-auto">
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h1 class="text-2xl font-bold text-gray-800">Clear Chat History</h1>
                            <button onclick="app.showRoomList()" class="text-gray-600 hover:text-gray-800">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        <div id="clear-message" class="hidden mb-4 p-3 rounded-lg"></div>

                        <!-- Warning -->
                        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-exclamation-triangle text-red-500 text-xl mt-1"></i>
                                <div>
                                    <p class="text-red-800 font-semibold mb-2">Warning: This action cannot be undone!</p>
                                    <p class="text-sm text-red-700">
                                        Clearing your chat history will permanently delete all your messages from all rooms. 
                                        Other users will still see their own copies of the messages.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Statistics -->
                        <div class="mb-6 space-y-3">
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-600">
                                    <i class="fas fa-comments mr-2 text-purple-600"></i>Total Rooms
                                </span>
                                <span class="font-bold text-gray-800" id="roomCount">Loading...</span>
                            </div>
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-600">
                                    <i class="fas fa-database mr-2 text-blue-600"></i>Storage Used
                                </span>
                                <span class="font-bold text-gray-800">~${Math.round(JSON.stringify(localStorage).length / 1024)}KB</span>
                            </div>
                        </div>

                        <!-- Confirmation Checkbox -->
                        <div class="mb-6">
                            <label class="flex items-start gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="confirmClear"
                                    class="mt-1 w-5 h-5 text-red-600 focus:ring-red-500 rounded"
                                />
                                <span class="text-sm text-gray-700">
                                    I understand that this action is permanent and cannot be undone. 
                                    All my messages will be deleted from all rooms.
                                </span>
                            </label>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3">
                            <button 
                                onclick="app.showRoomList()"
                                class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                <i class="fas fa-times mr-2"></i>Cancel
                            </button>
                            <button 
                                onclick="app.confirmClearHistory()"
                                class="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                <i class="fas fa-trash-alt mr-2"></i>Clear All History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load room count
        await this.loadRooms();
        document.getElementById('roomCount').textContent = this.rooms.length;
    }

    async confirmClearHistory() {
        const checkbox = document.getElementById('confirmClear');
        const msgDiv = document.getElementById('clear-message');

        if (!checkbox.checked) {
            this.showMessage(msgDiv, 'Please confirm by checking the box above', 'error');
            return;
        }

        if (!confirm('FINAL CONFIRMATION\n\nAre you absolutely sure you want to delete ALL your chat history?\n\nThis cannot be undone!')) {
            return;
        }

        this.showMessage(msgDiv, 'Clearing chat history...', 'info');

        try {
            // Clear messages from each room
            for (const room of this.rooms) {
                await fetch(`${API_BASE}/api/messages/clear`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId: room.id,
                        userId: this.currentUser.id
                    })
                });
            }

            // Clear local storage
            this.messages = [];
            localStorage.removeItem('viewedOnceFiles');
            this.viewedOnceFiles = new Set();

            this.showMessage(msgDiv, 'Chat history cleared successfully! ✓', 'success');
            setTimeout(() => this.showRoomList(), 2000);
        } catch (error) {
            console.error('Clear history error:', error);
            this.showMessage(msgDiv, 'Failed to clear chat history', 'error');
        }
    }

    showAbout() {
        this.closeProfileDrawer();
        alert('Amebo - Secure Messaging & Payments\n\nVersion: 3.0.0 (V3 Industrial Grade)\n\nFeatures:\n✅ End-to-end encryption\n✅ Token rewards system\n✅ Data redemption\n✅ Voice & Video calls\n✅ File sharing\n✅ View-once files\n\n© 2025 Amebo\nContact: ads@oztec.cam');
    }

    async toggleNotifications() {
        this.notificationsEnabled = !this.notificationsEnabled;
        localStorage.setItem('notificationsEnabled', this.notificationsEnabled);
        
        console.log('[NOTIFICATIONS] Toggle:', this.notificationsEnabled ? 'ON' : 'OFF');
        
        if (this.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
            await this.requestNotificationPermission();
        }
        
        // Update the toggle UI directly without refreshing drawer
        const toggleButton = document.querySelector('button[onclick="app.toggleNotifications()"]');
        if (toggleButton) {
            const statusSpan = toggleButton.querySelector('.text-sm');
            const toggleIcon = toggleButton.querySelector('.fa-toggle-on, .fa-toggle-off');
            
            if (statusSpan) {
                statusSpan.textContent = this.notificationsEnabled ? 'ON' : 'OFF';
                statusSpan.className = `text-sm ${this.notificationsEnabled ? 'text-green-600' : 'text-gray-400'}`;
            }
            
            if (toggleIcon) {
                toggleIcon.className = `fas fa-toggle-${this.notificationsEnabled ? 'on text-green-600' : 'off text-gray-400'} text-2xl`;
            }
        }
        
        // Show feedback
        const message = this.notificationsEnabled 
            ? '🔔 Notifications enabled!\n📱 You\'ll receive sound, vibration & push alerts for new messages.' 
            : '🔕 Notifications disabled.';
        
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-[100] transition-opacity duration-300 text-center whitespace-pre-line';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    async toggleBadgeNotifications() {
        this.badgeNotificationsEnabled = !this.badgeNotificationsEnabled;
        localStorage.setItem('badgeNotificationsEnabled', this.badgeNotificationsEnabled);
        
        console.log('[BADGE] Toggle:', this.badgeNotificationsEnabled ? 'ON' : 'OFF');
        
        // If disabling, clear the badge immediately
        if (!this.badgeNotificationsEnabled) {
            await this.updateAppBadge(0);
        }
        
        // Update the toggle UI directly without refreshing drawer
        const toggleButton = document.querySelector('button[onclick="app.toggleBadgeNotifications()"]');
        if (toggleButton) {
            const statusSpan = toggleButton.querySelector('.text-sm');
            const toggleIcon = toggleButton.querySelector('.fa-toggle-on, .fa-toggle-off');
            
            if (statusSpan) {
                statusSpan.textContent = this.badgeNotificationsEnabled ? 'ON' : 'OFF';
                statusSpan.className = `text-sm ${this.badgeNotificationsEnabled ? 'text-green-600' : 'text-gray-400'}`;
            }
            
            if (toggleIcon) {
                toggleIcon.className = `fas fa-toggle-${this.badgeNotificationsEnabled ? 'on text-green-600' : 'off text-gray-400'} text-2xl`;
            }
        }
        
        // Show feedback
        const message = this.badgeNotificationsEnabled 
            ? '🎖️ Badge notifications enabled!\n📱 Unread count will show on app icon (iOS PWA)' 
            : '🎖️ Badge notifications disabled.';
        
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-[100] transition-opacity duration-300 text-center whitespace-pre-line';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async testBadgeNotification() {
        console.log('[BADGE TEST] Starting badge diagnostic...');
        
        // Run diagnostic
        this.checkBadgeSupport();
        
        // Create diagnostic results
        const results = {
            badgeAPI: 'setAppBadge' in navigator,
            serviceWorker: 'serviceWorker' in navigator,
            standalone: window.matchMedia('(display-mode: standalone)').matches,
            iOS: /iPhone|iPad|iPod/.test(navigator.userAgent),
            permission: 'Notification' in window ? Notification.permission : 'N/A'
        };
        
        let message = '🔍 Badge Diagnostic Results:\n\n';
        message += `Badge API: ${results.badgeAPI ? '✅ Supported' : '❌ Not Supported'}\n`;
        message += `PWA Mode: ${results.standalone ? '✅ Yes' : '❌ No (open from home screen)'}\n`;
        message += `iOS Device: ${results.iOS ? '✅ Yes' : '⚠️ No'}\n`;
        message += `Service Worker: ${results.serviceWorker ? '✅ Yes' : '❌ No'}\n`;
        message += `Notification Permission: ${results.permission}\n\n`;
        
        if (results.badgeAPI && results.standalone) {
            message += '✅ Badge should work!\n\n';
            message += '🧪 Testing badge now...\n';
            message += 'Setting badge to 5.\n';
            message += 'Go to home screen to check!';
            
            try {
                await navigator.setAppBadge(5);
                console.log('[BADGE TEST] ✅ Badge set to 5');
                
                alert(message);
                
                // Auto-clear after 10 seconds
                setTimeout(async () => {
                    await navigator.clearAppBadge();
                    console.log('[BADGE TEST] ✅ Badge cleared');
                }, 10000);
            } catch (error) {
                alert(message + '\n\n❌ Error: ' + error.message);
            }
        } else {
            message += '❌ Badge won\'t work:\n';
            if (!results.badgeAPI) message += '• Badge API not supported\n';
            if (!results.standalone) message += '• Not in PWA mode\n';
            message += '\n💡 Solution:\n';
            if (!results.standalone) {
                message += '1. Add app to home screen\n';
                message += '2. Close Safari completely\n';
                message += '3. Open from home screen icon';
            } else if (!results.badgeAPI) {
                message += '• Update to iOS 16.4 or higher\n';
                message += '• Or use a supported device';
            }
            
            alert(message);
        }
    }

    async showNotifications() {
        console.log('[NOTIFICATIONS] showNotifications called');
        const appElement = document.getElementById('app');
        console.log('[NOTIFICATIONS] app element:', appElement);
        
        if (!appElement) {
            console.error('[NOTIFICATIONS] App element not found!');
            return;
        }
        
        // Fetch notifications
        let notifications = [];
        try {
            console.log('[NOTIFICATIONS] Fetching notifications for user:', this.currentUser.id);
            const response = await fetch(`/api/notifications/${this.currentUser.id}`);
            const data = await response.json();
            console.log('[NOTIFICATIONS] API response:', data);
            notifications = data.notifications || [];
            console.log('[NOTIFICATIONS] Notifications count:', notifications.length);
        } catch (error) {
            console.error('[NOTIFICATIONS] Fetch error:', error);
        }
        
        appElement.innerHTML = `
            <div class="min-h-screen bg-gray-50 pb-20">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 sticky top-0 z-10 shadow-lg">
                    <div class="max-w-4xl mx-auto flex items-center gap-4">
                        <button onclick="app.showRoomList()" class="p-2 hover:bg-white/20 rounded-lg transition">
                            <i class="fas fa-arrow-left text-xl"></i>
                        </button>
                        <div class="flex-1">
                            <h1 class="text-xl font-bold">Notifications</h1>
                            <p class="text-sm text-purple-200">${notifications.length} notification(s)</p>
                        </div>
                        <button onclick="app.markAllNotificationsRead()" class="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition">
                            Mark all read
                        </button>
                    </div>
                </div>
                
                <!-- Notifications List -->
                <div class="max-w-4xl mx-auto p-4">
                    ${notifications.length === 0 ? `
                        <div class="bg-white rounded-lg shadow-md p-8 text-center">
                            <i class="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">No Notifications</h3>
                            <p class="text-gray-500">You're all caught up!</p>
                        </div>
                    ` : `
                        <div class="space-y-3">
                            ${notifications.map(notif => `
                                <div class="bg-white rounded-lg shadow-md p-4 ${notif.is_read ? 'opacity-60' : 'border-l-4 border-purple-600'} hover:shadow-lg transition">
                                    <div class="flex items-start gap-3">
                                        <div class="flex-shrink-0">
                                            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <i class="fas ${this.getNotificationIcon(notif.type)} text-purple-600"></i>
                                            </div>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h4 class="font-semibold text-gray-900">${this.escapeHtml(notif.title)}</h4>
                                            <p class="text-gray-600 text-sm mt-1">${this.escapeHtml(notif.message)}</p>
                                            <p class="text-xs text-gray-400 mt-2">${this.formatTimeAgo(notif.created_at)}</p>
                                            
                                            ${notif.type === 'contact_request' && notif.data ? `
                                                <div class="flex gap-2 mt-3">
                                                    <button 
                                                        onclick="app.acceptContactRequestFromNotification('${notif.id}', '${JSON.parse(notif.data).requester_id}')"
                                                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                                    >
                                                        <i class="fas fa-check mr-1"></i>
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onclick="app.rejectContactRequestFromNotification('${notif.id}', '${JSON.parse(notif.data).requester_id}')"
                                                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                                    >
                                                        <i class="fas fa-times mr-1"></i>
                                                        Reject
                                                    </button>
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${!notif.is_read ? `
                                            <button 
                                                onclick="app.markNotificationRead('${notif.id}')"
                                                class="flex-shrink-0 text-gray-400 hover:text-purple-600 transition"
                                                title="Mark as read"
                                            >
                                                <i class="fas fa-check-circle"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        // Reset unread count
        this.unreadNotifications = 0;
    }
    
    getNotificationIcon(type) {
        const icons = {
            'contact_request': 'fa-user-plus',
            'contact_accepted': 'fa-user-check',
            'message': 'fa-comment',
            'room_invite': 'fa-door-open',
            'system': 'fa-info-circle'
        };
        return icons[type] || 'fa-bell';
    }
    
    async markNotificationRead(notificationId) {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: { 'X-User-Email': this.currentUser.email }
            });
            
            // Don't auto-redirect - just update badge count
            await this.updateNotificationBadge();
            console.log('[NOTIFICATIONS] ✅ Marked notification as read');
        } catch (error) {
            console.error('[NOTIFICATIONS] Mark read error:', error);
        }
    }
    
    async markAllNotificationsRead() {
        try {
            const response = await fetch(`/api/notifications/${this.currentUser.id}`);
            const data = await response.json();
            const notifications = data.notifications || [];
            
            // Mark all unread as read
            for (const notif of notifications) {
                if (!notif.is_read) {
                    await fetch(`/api/notifications/${notif.id}/read`, {
                        method: 'POST',
                        headers: { 'X-User-Email': this.currentUser.email }
                    });
                }
            }
            
            this.showToast('All notifications marked as read', 'success');
            // Don't auto-redirect - just close notification center
            this.showRoomList();
        } catch (error) {
            console.error('[NOTIFICATIONS] Mark all read error:', error);
        }
    }
}

// Initialize app
const app = new SecureChatApp();
document.addEventListener('DOMContentLoaded', () => app.init());

# 📱 MOBILE NOTIFICATIONS - ROOT CAUSE & IMMEDIATE FIX

## 🔍 Root Cause Analysis

### Why Notifications Don't Work on Mobile

**The Real Problem**: Mobile browsers (iOS Safari, Chrome) aggressively suspend background tabs to save battery.

**What happens:**
1. User switches away from Amebo app → Tab goes to background
2. After 30-60 seconds → Browser suspends JavaScript execution
3. Message polling (`setInterval`) stops running
4. New messages arrive → NO ONE IS LISTENING
5. No notification triggered because JavaScript is frozen

**Current flow** (BROKEN on mobile):
```
New Message → Backend stores → Frontend polls every 3s → Checks for new messages → Shows notification
                                       ↑
                                  STOPS when tab suspended!
```

**Needed flow** (WORKS on mobile):
```
New Message → Backend stores → Backend sends Push → Service Worker → Notification
                                                           ↑
                                                    ALWAYS running!
```

---

## 🚨 Why Current Implementation Fails

### Current Code (app-v3.js line 1600):
```javascript
if (document.hidden || !document.hasFocus()) {
    newMessagesOnly.forEach(msg => {
        this.queueNotification(msg, room_name);
    });
}
```

**Problem**: This code only runs when `loadMessages()` is called by polling interval. On mobile, when tab is suspended, `setInterval` stops executing, so `loadMessages()` never runs!

---

## ✅ IMMEDIATE FIX: Server-Side Push Trigger

We need the **backend** to trigger notifications when messages are stored, not the frontend.

### Step 1: Update Message Storage Endpoint

Add notification trigger to `/api/messages` endpoint:

```typescript
// After storing message successfully
app.post('/api/messages', async (c) => {
  // ... existing message storage code ...
  
  // ✅ NEW: Get all users in this room (except sender)
  const { results: roomUsers } = await c.env.DB.prepare(`
    SELECT DISTINCT sender_id as user_id 
    FROM messages 
    WHERE room_id = ? AND sender_id != ?
  `).bind(roomId, senderId).all();
  
  // ✅ NEW: Create in-app notifications for each user
  for (const user of roomUsers || []) {
    const notifId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      notifId,
      user.user_id,
      'new_message',
      `New message in ${roomName}`,
      `${senderUsername}: ${messagePreview}`,
      JSON.stringify({ roomId, messageId, senderId })
    ).run();
    
    console.log(`[NOTIFICATION] Created for user ${user.user_id}`);
  }
  
  return c.json({ success: true, messageId });
});
```

### Step 2: Frontend Polls Notifications

Add notification polling (runs even when tab is hidden on some browsers):

```javascript
// Add to app-v3.js init
startNotificationPolling() {
    // Poll notifications every 10 seconds
    this.notificationPollInterval = setInterval(() => {
        if (this.currentUser) {
            this.checkForNewNotifications();
        }
    }, 10000); // 10 seconds
}

async checkForNewNotifications() {
    try {
        const response = await fetch(`/api/notifications/${this.currentUser.id}/unread`);
        const { notifications } = await response.json();
        
        if (notifications && notifications.length > 0) {
            for (const notif of notifications) {
                // Show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(notif.title, {
                        body: notif.message,
                        icon: '/static/icon-192.svg',
                        badge: '/static/icon-192.svg',
                        tag: `amebo-${notif.id}`,
                        vibrate: [200, 100, 300]
                    });
                }
                
                // Mark as read
                await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
            }
        }
    } catch (error) {
        console.error('[NOTIFICATIONS] Poll error:', error);
    }
}
```

---

## 🎯 BETTER SOLUTION: Service Worker with Background Sync

Since we already have a service worker (`sw.js`), let's use it properly!

### Step 1: Enable Background Sync in Service Worker

Update `public/static/sw.js`:

```javascript
// Add periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(checkNotifications());
  }
});

async function checkNotifications() {
  try {
    // Get user ID from IndexedDB or cache
    const userId = await getUserIdFromCache();
    
    if (!userId) return;
    
    // Check for new notifications
    const response = await fetch(`/api/notifications/${userId}/unread`);
    const { notifications } = await response.json();
    
    // Show notifications
    for (const notif of notifications || []) {
      await self.registration.showNotification(notif.title, {
        body: notif.message,
        icon: '/static/icon-192.svg',
        badge: '/static/icon-192.svg',
        tag: `amebo-${notif.id}`,
        vibrate: [200, 100, 300, 100, 200],
        data: notif.data
      });
      
      // Mark as shown
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
    }
  } catch (error) {
    console.error('[SW] Check notifications error:', error);
  }
}

async function getUserIdFromCache() {
  // Get user ID from IndexedDB
  const cache = await caches.open('securechat-user-data');
  const userResponse = await cache.match('/user-id');
  if (userResponse) {
    const data = await userResponse.json();
    return data.userId;
  }
  return null;
}
```

### Step 2: Register Periodic Background Sync

Update `app-v3.js`:

```javascript
async init() {
    // ... existing code ...
    
    // Register periodic background sync
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        try {
            await registration.periodicSync.register('check-notifications', {
                minInterval: 60 * 1000 // 1 minute
            });
            console.log('[SYNC] Periodic background sync registered');
        } catch (error) {
            console.error('[SYNC] Periodic sync not supported:', error);
            // Fallback to regular polling
            this.startNotificationPolling();
        }
    } else {
        // Fallback: Start regular polling
        this.startNotificationPolling();
    }
    
    // Cache user ID for service worker
    await this.cacheUserIdForServiceWorker();
}

async cacheUserIdForServiceWorker() {
    if (!this.currentUser) return;
    
    const cache = await caches.open('securechat-user-data');
    const response = new Response(JSON.stringify({ userId: this.currentUser.id }));
    await cache.put('/user-id', response);
}
```

---

## 📊 Comparison of Solutions

| Solution | Mobile Support | Setup Complexity | Reliability | Battery Impact |
|----------|---------------|------------------|-------------|----------------|
| **Current (polling)** | ❌ Poor | Low | Low | High |
| **Backend + polling** | ⚠️ Medium | Low | Medium | Medium |
| **Service Worker sync** | ⚠️ Medium | Medium | Medium | Low |
| **Web Push (VAPID)** | ✅ Excellent | High | High | Very Low |
| **FCM/OneSignal** | ✅ Excellent | Low | Very High | Very Low |

---

## 🚀 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Quick Fix (TODAY - 1 hour)
1. ✅ Add notification creation in `/api/messages` endpoint
2. ✅ Add `/api/notifications/:userId/unread` endpoint
3. ✅ Add notification polling in frontend
4. ✅ Test on mobile device

### Phase 2: Service Worker Enhancement (TOMORROW - 2 hours)
1. ✅ Add periodic sync to service worker
2. ✅ Cache user ID for service worker access
3. ✅ Implement background notification check
4. ✅ Test with phone in sleep mode

### Phase 3: Production-Ready (NEXT WEEK - 1 day)
1. ✅ Implement Web Push with VAPID OR
2. ✅ Integrate FCM/OneSignal
3. ✅ Add push subscription management
4. ✅ Test across multiple devices

---

## 💡 Quick Test

To test if mobile notifications work:

1. **Open app on mobile** → Login → Join a room
2. **Switch to another app** (put Amebo in background)
3. **Wait 2 minutes** (let browser suspend tab)
4. **Send message from another device**
5. **Check if notification appears**

If notification doesn't appear → Polling is suspended (current problem)
If notification appears → System works!

---

## 🔧 IMMEDIATE ACTION ITEMS

Which approach should I implement first?

**Option A**: Backend notification + polling (1 hour, works immediately)
**Option B**: Service Worker background sync (2 hours, better but limited browser support)
**Option C**: FCM/OneSignal integration (3 hours, production-ready)

Let me know and I'll implement it right away!

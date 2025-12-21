# iOS Badge Notifications Troubleshooting Guide

## Current Status
✅ **Backend**: Creates notifications automatically when messages are sent  
✅ **Frontend**: Polls for unread notifications every 15 seconds  
✅ **Badge API**: Implemented with iOS 16.4+ support  
✅ **Service Worker**: Handles badge updates  
⚠️ **Issue**: Badge notifications not appearing on iPhone home screen icon

## How Badge Notifications Work

### Flow:
1. **Message Sent** → Backend creates notification in DB
2. **Frontend Polls** (every 15s) → Fetches unread notifications
3. **Badge Updated** → Calls `navigator.setAppBadge(count)`
4. **Service Worker** → Also sets badge via service worker
5. **Badge Shows** → Red badge on iPhone home screen icon
6. **User Opens Room** → Badge cleared to 0

## iOS Requirements Checklist

### ✅ Must Have:
1. **iOS 16.4 or later** - Badge API only works on iOS 16.4+
2. **PWA Mode** - App MUST be saved to home screen
3. **Standalone Mode** - App must be opened from home screen icon
4. **Badge Toggle ON** - Badge Notifications toggle must be enabled in settings
5. **Notification Permission** - Browser notification permission granted

### How to Test:

#### Step 1: Verify iOS Version
```
Settings → General → About → Software Version
Must be iOS 16.4 or higher
```

#### Step 2: Install PWA to Home Screen
```
1. Open app in Safari: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. Tap Share icon (bottom center)
3. Tap "Add to Home Screen"
4. Tap "Add"
5. Close Safari
```

#### Step 3: Open from Home Screen
```
1. Find "Amebo" icon on home screen
2. Tap to open (NOT from Safari)
3. App must open in standalone mode (no Safari UI)
```

#### Step 4: Enable Badge Notifications
```
1. In app: Tap Profile icon (top right)
2. Tap "Notifications" section
3. Enable "Badge Notifications" toggle (should be green)
4. Console should show: "[BADGE] Badge notifications enabled"
```

#### Step 5: Enable Message Notifications
```
1. In same settings area
2. Enable "Message Notifications" toggle
3. Allow browser notifications when prompted
```

#### Step 6: Test Badge
```
1. Keep app open, check console for:
   "[NOTIFICATIONS] 📡 Starting notification polling (every 15s)"
   "[BADGE] ✅ Badge set to: X"
   
2. Send a test message from another device
3. Wait 15 seconds (polling interval)
4. Background the app (go to home screen)
5. Check app icon for red badge number
```

## Diagnostic Console Commands

### Check Badge API Support:
```javascript
console.log('Badge API:', 'setAppBadge' in navigator);
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches);
```

### Manually Test Badge:
```javascript
// Set badge to 5
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(5);
  console.log('Badge set to 5');
}

// Clear badge
if ('clearAppBadge' in navigator) {
  navigator.clearAppBadge();
  console.log('Badge cleared');
}
```

### Check Settings:
```javascript
console.log('Badge enabled:', localStorage.getItem('badgeNotificationsEnabled'));
console.log('Notifications enabled:', localStorage.getItem('notificationsEnabled'));
console.log('Current user:', localStorage.getItem('currentUser'));
```

## Common Issues & Solutions

### Issue 1: "Badge API not supported"
**Cause**: iOS version < 16.4 or not in PWA mode  
**Solution**:
- Update iOS to 16.4+
- Remove app from home screen and re-add
- Open from home screen icon (not Safari)

### Issue 2: Badge not showing after message
**Cause**: Polling hasn't run yet or badge toggle is off  
**Solution**:
- Wait 15 seconds for next poll
- Check console for "[BADGE] ✅ Badge set to: X"
- Verify badge toggle is ON in settings
- Background the app (go to home screen)

### Issue 3: Badge shows in console but not on icon
**Cause**: Not running in standalone PWA mode  
**Solution**:
1. Force close app
2. Remove from home screen
3. Re-add to home screen
4. Open ONLY from home screen icon
5. Verify standalone mode: `window.matchMedia('(display-mode: standalone)').matches`

### Issue 4: Badge clears immediately
**Cause**: Opening a room clears badge  
**Solution**:
- Badge is designed to clear when room is opened
- Stay on room list to see badge persist
- Check console for badge clear events

### Issue 5: Notifications not created
**Cause**: Backend not creating notifications  
**Solution**:
```bash
# Check database
curl http://localhost:3000/api/notifications/USER_ID/unread

# Should return:
# {"notifications": [...]}
```

## Testing Script

Run this test sequence:

### Device 1 (iPhone - Receiver):
```
1. Install PWA to home screen
2. Open from home screen
3. Login
4. Enable badge notifications
5. Check console for polling start
6. Join test room
7. Go to home screen (background app)
8. Wait for message...
```

### Device 2 (Sender):
```
1. Login to same account
2. Join same test room
3. Send message: "Test badge notification"
4. Wait 15 seconds
```

### Expected Result on iPhone:
- After 15 seconds, red badge appears on app icon
- Badge number = unread message count
- When app is opened, badge clears

## iOS Badge Behavior Notes

### When Badge Updates:
- ✅ App in background (home screen)
- ✅ App closed completely
- ✅ Phone locked
- ✅ Do Not Disturb mode

### When Badge Doesn't Work:
- ❌ App open in Safari (not PWA)
- ❌ iOS < 16.4
- ❌ Badge toggle disabled
- ❌ Not installed to home screen

## Alternative: Service Worker Push Events

If Badge API still doesn't work, we can implement true Push Notifications:

### Option A: Web Push (VAPID)
```typescript
// Requires VAPID keys and push subscription
// More complex but works without app open
```

### Option B: Firebase Cloud Messaging (FCM)
```javascript
// Requires Firebase setup
// Best for production apps
```

### Option C: OneSignal
```javascript
// Third-party service
// Easy to implement
```

## Current Implementation

### Frontend (`app-v3.js`):
```javascript
// Poll every 15 seconds
startNotificationPolling() {
  setInterval(async () => {
    const { notifications } = await fetch(`/api/notifications/${userId}/unread`);
    await this.updateAppBadge(notifications.length);
  }, 15000);
}

// Update badge
async updateAppBadge(count) {
  if (this.badgeNotificationsEnabled && 'setAppBadge' in navigator) {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  }
}
```

### Backend (`index.tsx`):
```typescript
// Create notification when message is sent
app.post('/api/messages/send', async (c) => {
  // ... save message
  
  // Create notification for all room members
  for (const member of members) {
    await c.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?)
    `).bind(member.user_id, 'new_message', '💬 New Message', `From ${sender}`, JSON.stringify({roomId})).run();
  }
});

// Get unread notifications
app.get('/api/notifications/:userId/unread', async (c) => {
  const notifications = await c.env.DB.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? AND is_read = 0
    ORDER BY created_at DESC
  `).bind(userId).all();
  
  return c.json({ notifications });
});
```

## Next Steps

If badge still doesn't work after following all steps:

1. **Verify iOS version** is 16.4+
2. **Test Badge API manually** in console
3. **Check standalone mode** is active
4. **Review console logs** for errors
5. **Test with another iOS device** to rule out device-specific issues

## Contact

If issues persist, provide:
- iOS version
- Console logs from app
- Screenshot of settings toggles
- Video of test process

---

**Last Updated**: 2025-12-21  
**Status**: Badge API implemented, awaiting device testing confirmation

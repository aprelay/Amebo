# 🔔 Push Notifications Setup Guide

Complete guide to enable push notifications for SecureChat & Pay app.

---

## 🎯 Overview

Push notifications allow users to receive message alerts even when the app is closed or in the background. This guide covers both local development and production deployment.

**Features:**
- ✅ New message notifications
- ✅ Room invites
- ✅ Payment confirmations
- ✅ Call notifications
- ✅ Works on mobile and desktop
- ✅ PWA integration (works even when browser is closed)

---

## 📋 Prerequisites

- Service Worker registered (✅ already done)
- HTTPS connection (✅ Cloudflare provides this)
- Push API support (✅ all modern browsers)

---

## 🔐 Step 1: Generate VAPID Keys

VAPID keys are used to identify your application with push services.

### Generate Keys:

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

**Output:**
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U

Private Key:
UUxI4O8-FXScxOMv_ZTQ3FhqSfVg2KwRZeGVeR8-LIc
=======================================

```

### Save Keys Securely:

**For Local Development:**
Update `.dev.vars`:
```bash
cd /home/user/webapp

# Add these lines to .dev.vars:
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=UUxI4O8-FXScxOMv_ZTQ3FhqSfVg2KwRZeGVeR8-LIc
```

**For Production:**
```bash
# Set VAPID public key
npx wrangler pages secret put VAPID_PUBLIC_KEY --project-name webapp

# Set VAPID private key
npx wrangler pages secret put VAPID_PRIVATE_KEY --project-name webapp
```

---

## 🔧 Step 2: Update Frontend Code

### Update app.js with Your VAPID Public Key:

Open `/home/user/webapp/public/static/app.js` and find the `subscribeToNotifications()` method:

```javascript
subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: this.urlBase64ToUint8Array(
    'YOUR_VAPID_PUBLIC_KEY'  // ⚠️ Replace with your actual public key
  )
});
```

**Replace with your actual public key:**
```javascript
subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: this.urlBase64ToUint8Array(
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
  )
});
```

---

## 📱 Step 3: Database Migration

Already done! Migration `0003_push_notifications.sql` includes:

```sql
CREATE TABLE push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subscription_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Step 4: Backend Implementation

### Install web-push Library (for sending notifications):

```bash
cd /home/user/webapp
npm install web-push
```

### Update Backend to Send Notifications:

The backend endpoint `/api/notifications/send` is already created. To send actual push notifications, you need to implement the Web Push protocol.

**Example implementation (add to src/index.tsx):**

```typescript
import webpush from 'web-push';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  c.env.VAPID_PUBLIC_KEY,
  c.env.VAPID_PRIVATE_KEY
);

// Send notification
const pushSubscription = JSON.parse(result.subscription_data);
const payload = JSON.stringify({
  title: title,
  body: body,
  icon: '/static/icon-192.svg',
  badge: '/static/icon-192.svg',
  data: data
});

await webpush.sendNotification(pushSubscription, payload);
```

---

## ✅ Step 5: Testing Notifications

### Enable Notifications:

1. **Open app**: http://localhost:3000
2. **Login** with a username
3. **Grant permission**: Click "Allow" when prompted
4. You'll see: "🔔 Notifications Enabled!"

### Test New Message Notification:

1. **Device 1**: Login as "Alice", create room "test123"
2. **Device 2**: Login as "Bob", join room "test123"
3. **Device 2**: Minimize/close the app
4. **Device 1**: Send a message "Hello!"
5. **Device 2**: Should receive notification 🎉

### Manual Test:

Test the subscription endpoint:
```bash
curl -X POST http://localhost:3000/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    }
  }'
```

---

## 📲 Step 6: Platform-Specific Setup

### iOS (iPhone/iPad):

**Requirements:**
- iOS 16.4+ (for PWA push notifications)
- App must be **installed to home screen**
- Not just Safari browser

**Steps:**
1. Open app in Safari
2. Tap **Share** button
3. Tap **"Add to Home Screen"**
4. Open app from home screen
5. Grant notification permission

**Note:** iOS PWA push notifications are limited. For full iOS support, consider native app.

### Android (Chrome/Edge):

**Fully supported!** Works in both:
- Browser (Chrome, Edge, Firefox)
- PWA (installed to home screen)

**Steps:**
1. Open app in Chrome
2. Tap **"Install app"** prompt
3. Grant notification permission
4. Done! 🎉

### Desktop (Chrome/Edge/Firefox):

**Fully supported!**

**Steps:**
1. Open app in browser
2. Click **"Allow"** for notifications
3. Done! Works even with browser closed (if PWA installed)

---

## 🔍 Troubleshooting

### Notifications Not Working:

1. **Check browser support:**
   ```javascript
   console.log('Notification' in window); // Should be true
   console.log(Notification.permission); // Should be "granted"
   ```

2. **Check service worker:**
   - Open DevTools → Application → Service Workers
   - Should show "activated and running"

3. **Check subscription:**
   ```javascript
   navigator.serviceWorker.ready.then(registration => {
     registration.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub);
     });
   });
   ```

4. **Check VAPID keys:**
   - Ensure public key matches in frontend and backend
   - Keys should be URL-safe Base64 encoded

### Permission Denied:

- **Reset permissions**: Browser Settings → Site Settings → Notifications
- **iOS**: Must be installed as PWA
- **Incognito/Private**: Notifications not supported

### Notifications Not Received:

1. **Check network**: Push services require internet
2. **Check browser open**: Some browsers require browser running
3. **Check push subscription**: May expire after some time
4. **Re-subscribe**: App automatically re-subscribes on login

---

## 📊 Notification Types

### 1. New Message Notification:
```javascript
{
  title: "New message from Alice",
  body: "Hello, how are you?",
  icon: "/static/icon-192.svg",
  tag: "message-123",
  data: {
    type: "message",
    roomId: "room-id",
    messageId: "message-id"
  }
}
```

### 2. Room Invite:
```javascript
{
  title: "Room Invite",
  body: "Bob invited you to 'Work Chat'",
  icon: "/static/icon-192.svg",
  tag: "invite-456",
  data: {
    type: "invite",
    roomCode: "work123"
  }
}
```

### 3. Payment Confirmation:
```javascript
{
  title: "Payment Received",
  body: "₦5,000 from Alice",
  icon: "/static/icon-192.svg",
  tag: "payment-789",
  data: {
    type: "payment",
    amount: 5000,
    currency: "NGN"
  }
}
```

### 4. Incoming Call:
```javascript
{
  title: "Incoming Call",
  body: "Alice is calling...",
  icon: "/static/icon-192.svg",
  tag: "call-101",
  requireInteraction: true,
  actions: [
    { action: "answer", title: "Answer" },
    { action: "decline", title: "Decline" }
  ],
  data: {
    type: "call",
    roomId: "room-id",
    callType: "video"
  }
}
```

---

## 🎨 Customization

### Notification Actions:

Add buttons to notifications:
```javascript
registration.showNotification('Title', {
  body: 'Body text',
  actions: [
    { action: 'view', title: 'View', icon: '/icons/view.png' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
});
```

### Handle Action Clicks:

In `public/static/sw.js`:
```javascript
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open app
    clients.openWindow('/');
  }
});
```

---

## 💰 Cost Breakdown

**Push Notifications are FREE!**

- ✅ No cost for sending/receiving
- ✅ Handled by browser push services (FCM, APNs, etc.)
- ✅ No third-party service fees
- ✅ No subscription limits

---

## 🔒 Security Best Practices

1. **Never expose VAPID private key** in frontend code
2. **Always use HTTPS** (required for service workers)
3. **Validate subscriptions** on backend before saving
4. **Encrypt sensitive data** in notification payload
5. **Implement rate limiting** to prevent notification spam

---

## 📚 Additional Resources

- **Web Push Protocol**: https://web.dev/push-notifications-overview/
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Notification API**: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- **web-push library**: https://github.com/web-push-libs/web-push

---

## ✅ Checklist

- [ ] Generated VAPID keys
- [ ] Added keys to `.dev.vars`
- [ ] Updated VAPID public key in `app.js`
- [ ] Applied database migration
- [ ] Tested notification permission
- [ ] Tested sending notifications
- [ ] Tested on multiple devices
- [ ] Set up production secrets
- [ ] Deployed to Cloudflare Pages

---

**🎉 Congratulations! Your app now has push notifications!**

Users can receive message alerts, call notifications, and payment confirmations even when the app is closed. This significantly improves user engagement and makes your app feel more like a native mobile application.

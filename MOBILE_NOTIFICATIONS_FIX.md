# 🔧 MOBILE NOTIFICATIONS FIX - Web Push Implementation

## 🚨 Current Problem

**Issue**: Mobile notifications not working because the app uses basic browser `Notification` API instead of Web Push API.

**Key Differences:**

| Feature | Browser Notifications | Web Push Notifications |
|---------|----------------------|------------------------|
| **Works when app closed** | ❌ NO | ✅ YES |
| **Works on locked device** | ❌ NO | ✅ YES |
| **Background delivery** | ❌ NO | ✅ YES |
| **Requires** | Just permission | VAPID keys + Service Worker |
| **Reliability** | Low | High |

**Current implementation**: Using `new Notification()` in frontend
**Needed**: Web Push API with VAPID keys and proper backend

---

## ✅ Solution: Implement Web Push

### Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push.

```bash
# Install web-push library
npm install web-push --save-dev

# Generate VAPID keys
npx web-push generate-vapid-keys
```

**Output example:**
```
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjaDTbVJWszKS...

Private Key:
XYZ123abc456def...
```

### Step 2: Configure Environment Variables

Add to `.dev.vars` (local) and Cloudflare secrets (production):

```bash
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjaDTbVJWszKS...
VAPID_PRIVATE_KEY=XYZ123abc456def...
VAPID_SUBJECT=mailto:ap@ac-payable.com
```

**For Cloudflare Pages:**
```bash
npx wrangler pages secret put VAPID_PUBLIC_KEY
npx wrangler pages secret put VAPID_PRIVATE_KEY
npx wrangler pages secret put VAPID_SUBJECT
```

### Step 3: Update Backend (src/index.tsx)

#### 3a. Install web-push for Cloudflare Workers

```typescript
// Import web-push functionality
// Note: In Cloudflare Workers, we'll use native Web Crypto API
// and fetch() to send push notifications directly

// Helper function to send Web Push notification
async function sendWebPush(
  subscription: any,
  payload: any,
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
) {
  try {
    const subscriptionObj = typeof subscription === 'string' 
      ? JSON.parse(subscription) 
      : subscription;

    // Create JWT for VAPID authentication
    const vapidHeaders = await generateVAPIDHeaders(
      subscriptionObj.endpoint,
      vapidKeys.subject,
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    // Encrypt payload
    const encryptedPayload = await encryptPayload(
      JSON.stringify(payload),
      subscriptionObj.keys.p256dh,
      subscriptionObj.keys.auth
    );

    // Send push notification
    const response = await fetch(subscriptionObj.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        ...vapidHeaders
      },
      body: encryptedPayload
    });

    if (!response.ok) {
      throw new Error(`Push failed: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('[WEB PUSH] Send error:', error);
    throw error;
  }
}

// Update send notification endpoint
app.post('/api/notifications/send', async (c) => {
  try {
    const { userId, title, body, data } = await c.req.json();
    
    if (!userId || !title) {
      return c.json({ error: 'User ID and title required' }, 400);
    }

    // Get user's push subscription
    const result = await c.env.DB.prepare(\`
      SELECT subscription_data FROM push_subscriptions WHERE user_id = ?
    \`).bind(userId).first();

    if (!result) {
      return c.json({ error: 'No push subscription found for user' }, 404);
    }

    // Get VAPID keys from environment
    const vapidKeys = {
      publicKey: c.env.VAPID_PUBLIC_KEY || '',
      privateKey: c.env.VAPID_PRIVATE_KEY || '',
      subject: c.env.VAPID_SUBJECT || 'mailto:ap@ac-payable.com'
    };

    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      console.error('[WEB PUSH] VAPID keys not configured');
      return c.json({ error: 'Push notifications not configured' }, 500);
    }

    // Send Web Push notification
    const payload = { title, body, data };
    await sendWebPush(result.subscription_data, payload, vapidKeys);
    
    return c.json({ 
      success: true, 
      message: 'Push notification sent successfully'
    });
  } catch (error: any) {
    console.error('[WEB PUSH] Send error:', error);
    return c.json({ 
      error: 'Failed to send notification',
      details: error.message 
    }, 500);
  }
});
```

### Step 4: Update Frontend (app-v3.js)

#### 4a. Add Push Subscription

```javascript
async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('[NOTIFICATIONS] ✅ Permission granted');
                
                // Subscribe to push notifications
                await this.subscribeToPushNotifications();
            }
        } catch (error) {
            console.error('[NOTIFICATIONS] Permission error:', error);
        }
    }
}

async subscribeToPushNotifications() {
    try {
        // Check if service worker is ready
        const registration = await navigator.serviceWorker.ready;
        
        // Get VAPID public key from backend
        const response = await fetch('/api/notifications/vapid-public-key');
        const { publicKey } = await response.json();
        
        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(publicKey)
        });
        
        // Send subscription to backend
        await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.currentUser.id,
                subscription: subscription
            })
        });
        
        console.log('[PUSH] ✅ Subscribed to push notifications');
    } catch (error) {
        console.error('[PUSH] Subscription error:', error);
    }
}

// Helper function to convert VAPID key
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
```

#### 4b. Trigger Push When Message Arrives

```javascript
async handleIncomingMessage(encryptedMessage, roomId) {
    // ... existing decryption code ...
    
    // If app is in background, trigger push notification via backend
    if (document.hidden && this.currentUser) {
        await fetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: this.currentUser.id,
                title: \`New message in \${roomName}\`,
                body: \`\${sender}: \${messagePreview}\`,
                data: {
                    roomId: roomId,
                    messageId: message.id,
                    senderId: message.sender_id
                }
            })
        });
    }
}
```

### Step 5: Add VAPID Public Key Endpoint

```typescript
// Get VAPID public key for frontend
app.get('/api/notifications/vapid-public-key', async (c) => {
  const publicKey = c.env.VAPID_PUBLIC_KEY || '';
  
  if (!publicKey) {
    return c.json({ error: 'VAPID not configured' }, 500);
  }
  
  return c.json({ publicKey });
});
```

---

## 🎯 Alternative: Simple Solution Using Firebase Cloud Messaging (FCM)

If Web Push is too complex, use Firebase:

### Benefits:
- ✅ Handles all the crypto/VAPID complexity
- ✅ Works on all mobile browsers
- ✅ Free tier includes 10M messages/month
- ✅ Easy to integrate

### Steps:

1. **Create Firebase project**: console.firebase.google.com
2. **Get FCM Server Key**: Project Settings > Cloud Messaging
3. **Add Firebase SDK** to frontend:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js"></script>
```

4. **Initialize Firebase**:
```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "amebo-chat",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();
messaging.requestPermission()
  .then(() => messaging.getToken())
  .then(token => {
    // Send token to backend
    fetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ userId, fcmToken: token })
    });
  });
```

5. **Send notification from backend**:
```typescript
await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': \`key=\${FCM_SERVER_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: userFcmToken,
    notification: {
      title: 'New Message',
      body: 'You have a new message!',
      icon: '/static/icon-192.svg'
    },
    data: { roomId, messageId }
  })
});
```

---

## 🚀 Quick Fix for Immediate Results

**Easiest solution**: Use a push notification service

### Option 1: OneSignal (Recommended)
```javascript
// Add to HTML
<script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"></script>

// Initialize
window.OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "YOUR_ONESIGNAL_APP_ID"
  });
});

// Send notification from backend
await fetch('https://onesignal.com/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Authorization': \`Basic \${ONESIGNAL_API_KEY}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    include_player_ids: [userPlayerId],
    headings: { en: "New Message" },
    contents: { en: "You have a new message!" }
  })
});
```

---

## 📝 Summary

**Current Issue**: App uses basic `Notification` API → only works when app is open

**Solutions** (pick one):

1. **DIY Web Push** ✅ Full control, more complex
   - Generate VAPID keys
   - Implement encryption/JWT
   - Handle push subscriptions

2. **Firebase FCM** ✅ Easy, free, reliable
   - Add Firebase SDK
   - Get FCM token
   - Send via FCM API

3. **OneSignal** ✅ Easiest, free tier
   - One script tag
   - Dashboard for testing
   - Works immediately

**Recommendation**: Start with **OneSignal** for immediate results, migrate to Web Push later if needed.

---

## 🔨 Implementation Priority

1. **Immediate**: Add OneSignal (1 hour)
2. **Short-term**: Implement FCM (1 day)
3. **Long-term**: DIY Web Push (2-3 days)

Which solution would you like me to implement?

# 🔍 MESSAGING DEBUG GUIDE

## Issue: Messages not showing after sending

### Step 1: Check if update deployed
1. Open: https://github.com/aprelay/Amebo/actions
2. Look for latest workflow: "🚀 CRITICAL: INSTANT REAL-TIME MESSAGING"
3. Should show ✅ green checkmark

### Step 2: Force update on your device
**Desktop:**
```javascript
// Open console (F12) and run:
caches.keys().then(keys => {
  keys.forEach(k => caches.delete(k));
  console.log('✅ Caches cleared');
});

navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(r => r.unregister());
  console.log('✅ SW unregistered');
});

// Then HARD REFRESH: Ctrl+Shift+R
```

**Mobile:**
1. Close app completely
2. Clear browser cache (Settings → Safari/Chrome → Clear data)
3. Reopen app

### Step 3: Test sending message with console open
1. Open chat with another user
2. Open browser console (F12)
3. Type a message: "test123"
4. Press Enter
5. **COPY ALL LOGS** and share them

Look for these logs:
```
[SEND] 📤 Sending message: test123
[SEND] 🔒 Message encrypted
[SEND] 📥 Server response: {...}
[SEND] ✅ Message sent successfully!
[SEND] 🔄 Reloading messages...
[LOAD] Loading messages for room...
```

### Step 4: Check for errors
Common errors to look for:
- `[SEND] ❌ Error sending message`
- `[LOAD] Already loading messages, skipping`
- `Failed to fetch`
- `500 Internal Server Error`

### Step 5: Manual deployment check
If auto-deploy failed, manual deploy:
1. Download: https://www.genspark.ai/api/files/s/[LATEST]
2. Extract `webapp/dist/`
3. Upload to Cloudflare Pages (Production)

---

## Quick Diagnostic Commands:

**Check SW version:**
```javascript
caches.keys().then(keys => console.log('Cache version:', keys));
// Should show: ["amebo-v10"]
```

**Check if polling is active:**
```javascript
console.log('Polling active:', !!window.app?.messagePoller);
```

**Force load messages:**
```javascript
if (window.app) {
  window.app.loadMessages().then(() => console.log('✅ Messages loaded'));
}
```

**Check current room:**
```javascript
console.log('Current room:', window.app?.currentRoom);
console.log('Messages:', window.app?.messages?.length);
```

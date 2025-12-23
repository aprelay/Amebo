# 🔄 Auto-Update PWA System

## ✅ What's Implemented

Your Amebo app now has **automatic updates** that work without requiring users to reinstall!

### **How It Works**

1. **Service Worker Versioning**
   - Cache version is tracked in `sw.js`
   - When you deploy updates, increment `CACHE_VERSION`
   - Old caches are automatically deleted

2. **Automatic Update Check**
   - Checks for updates every 60 seconds
   - Immediately downloads new version when available
   - Activates automatically (no user action needed)

3. **User Notification**
   - Shows toast: "✨ App updated! Refresh for latest features."
   - Auto-reloads page after 3 seconds
   - User sees new version instantly

---

## 🚀 How to Deploy Updates (Your Workflow)

### **Every Time You Make Changes:**

1. **Update Cache Version** (Important!)
   ```javascript
   // In public/static/sw.js - Change this number:
   const CACHE_VERSION = 3; // Increment this! (was 2, now 3)
   ```

2. **Build & Deploy**
   ```bash
   npm run build
   # Upload dist/ folder to Cloudflare Pages
   ```

3. **What Happens Automatically:**
   - Users open the app
   - Service worker detects new version (different CACHE_VERSION)
   - Downloads new files in background
   - Shows "App updated!" notification
   - Auto-reloads page
   - User sees latest version! ✨

---

## 📱 User Experience

### **First Install:**
```
1. User visits https://amebo-app.pages.dev
2. Clicks "Add to Home Screen"
3. App installs
```

### **After You Deploy Update:**
```
1. User opens app from home screen
2. After 1-60 seconds: "✨ App updated! Refresh for latest features."
3. Page auto-reloads (3 seconds)
4. User sees new version!
```

**No reinstall needed!** 🎉

---

## 🔧 Technical Details

### **Files Modified:**

1. **public/static/sw.js**
   - Added `CACHE_VERSION` counter
   - Enhanced install/activate handlers
   - Sends update messages to app
   - Auto-cleanup of old caches

2. **src/index.tsx**
   - Enhanced service worker registration
   - 60-second update check interval
   - Listens for SW_UPDATED messages
   - Shows toast notification
   - Auto-reloads page

### **Update Flow:**

```
Deploy New Version
    ↓
User Opens App
    ↓
SW checks version (every 60s)
    ↓
New version detected!
    ↓
Download new files
    ↓
Activate new SW
    ↓
Delete old caches
    ↓
Notify app: "SW_UPDATED"
    ↓
Show toast: "App updated!"
    ↓
Auto-reload after 3s
    ↓
User sees new version ✅
```

---

## ⚠️ Important: Remember to Increment Version!

**Every time you deploy, change this in `public/static/sw.js`:**

```javascript
const CACHE_VERSION = 2; // ← Change to 3, then 4, then 5, etc.
```

**If you forget**, users will keep seeing the old cached version!

---

## 🧪 Testing Updates

### **Test 1: Manual Update**
```javascript
// In browser console:
navigator.serviceWorker.getRegistration().then(reg => reg.update());
```

### **Test 2: Force Reload**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### **Test 3: Check Version**
```javascript
// In browser console:
caches.keys().then(keys => console.log(keys));
// Should show: ["amebo-v2"] or whatever version
```

---

## 📊 Update Frequency

- **Production**: Updates check every 60 seconds
- **Manual check**: User can close/reopen app
- **Automatic**: No user action needed
- **Network efficient**: Only downloads if version changed

---

## 🎯 Benefits

✅ **No reinstall** - Users never delete/reinstall  
✅ **Automatic** - Updates happen in background  
✅ **Fast** - Only downloads changed files  
✅ **Smooth** - Auto-reload after notification  
✅ **Offline-first** - Works even offline (cached version)  

---

## 🐛 Troubleshooting

### **"Updates not working"**
- Did you increment `CACHE_VERSION`?
- Check console: `[PWA] New version found`
- Try hard refresh: Ctrl+Shift+R

### **"Old version stuck"**
- Clear browser cache manually
- Unregister SW: Settings → Application → Service Workers → Unregister
- Delete cache: Application → Cache Storage → Delete all
- Reload page

### **"Update notification not showing"**
- Check `window.app.showToast` exists
- Check console for errors
- Page will auto-reload anyway (fallback)

---

## 🔄 Version History

- **v1**: Basic service worker
- **v2**: Auto-update system with notifications (current)

---

## 💡 Future Enhancements

Possible improvements:
- Add "Update now" button instead of auto-reload
- Show changelog/what's new after update
- Skip auto-reload if user is typing
- Background sync for offline updates

---

**Your app now updates automatically! Users will always have the latest version without reinstalling! 🎉**

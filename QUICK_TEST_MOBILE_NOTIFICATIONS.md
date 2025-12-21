# 📱 Quick Test Guide - Mobile Notifications

## 🎯 3-Minute Test

### Setup (1 minute)
1. **Open app on mobile:** https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. **Login/Register** with any email
3. **Tap your avatar** (top-left) → Profile drawer opens
4. **Tap "Message Notifications"** → Toggle to ON (green)
5. **Allow notifications** when browser asks

### Test (2 minutes)

#### Method 1: Two Devices
1. **Device A (Phone):**
   - Join room: `test123`
   - **Lock phone or minimize app**
   
2. **Device B (Computer/Another Phone):**
   - Join same room: `test123`
   - Send message: `Testing notifications!`
   
3. **Device A should:**
   - ✅ Vibrate (short-long-short pattern)
   - ✅ Beep (800Hz sound)
   - ✅ Show push notification

#### Method 2: Single Device
1. Join a room on your phone
2. **Minimize the browser** (don't close, just go to home screen)
3. Wait 10 seconds
4. **Open app on another tab/device** and send a message
5. **Your phone should notify** (vibrate + sound + push)

---

## ✅ What You Should Experience

### Visual:
```
┌─────────────────────────────────────┐
│ 🎯 Amebo                            │
├─────────────────────────────────────┤
│ New message in test123              │
│                                     │
│ TestUser: Testing notifications!    │
│                                     │
│ Just now                            │
└─────────────────────────────────────┘
```

### Physical:
- **Vibration Pattern:** buzz-BUZZ-buzz (0.8 seconds total)
- **Sound:** Pleasant "ding" beep (0.3 seconds)

### Timing:
- Notification appears **immediately** when message arrives
- Auto-dismisses after **6 seconds**
- Clicking notification **opens/focuses app**

---

## 🐛 Not Working?

### Quick Fixes:
1. **Check toggle:** Profile → Notifications → Should be ON (green)
2. **Browser permission:** Settings → Notifications → Allow for this site
3. **App must be hidden:** Minimize/lock phone - won't notify if visible
4. **Try again:** Toggle OFF → ON to reset

### Still Not Working?
```javascript
// Open browser console (on desktop) and check logs:
[NOTIFICATIONS] 📱 Showing mobile notification for message: 12345
[NOTIFICATIONS] ✓ Mobile vibration triggered
[NOTIFICATIONS] ✓ Browser notification shown
```

If you see these logs, it's working! If not:
- Refresh page
- Clear browser cache
- Try incognito/private mode

---

## 🎉 Success Checklist

After testing, you should have experienced:
- [ ] Phone vibrated with pattern
- [ ] Heard notification sound
- [ ] Saw push notification card
- [ ] Notification showed sender + message preview
- [ ] Clicking notification focused app
- [ ] Notification auto-dismissed after 6 seconds

---

## 📱 Mobile-Specific Tips

### iOS Safari:
- For best experience, **Add to Home Screen** (PWA mode)
- Check **Settings → Notifications → Safari** is enabled
- Silent mode switch won't block vibration

### Android Chrome:
- **Settings → Site Settings → Notifications** must allow
- Vibration works even in DND mode
- Battery optimization won't affect (brief wake lock)

---

## 🔗 Need More Info?
See full documentation: [MOBILE_NOTIFICATIONS.md](MOBILE_NOTIFICATIONS.md)

**Live App:** https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

**Contact:** ads@oztec.cam

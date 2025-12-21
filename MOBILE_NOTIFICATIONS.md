# 📱 Mobile Notifications - Complete Guide

## Overview
Amebo now features a **comprehensive mobile notification system** with vibration, sound, and push notifications for real-time message alerts.

## Live App
**Test Here:** https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

---

## 🎯 Key Features

### 1. **Vibration Feedback** 📳
- **Pattern:** Short-Long-Short (200ms - 300ms - 200ms)
- **Works on:** iOS Safari, Android Chrome, and all modern mobile browsers
- **Silent Mode:** Vibrates even when phone is on silent!

### 2. **Audio Notification** 🔔
- **Sound:** Pleasant 800Hz beep (300ms duration)
- **Volume:** 30% to avoid being jarring
- **Technology:** Web Audio API (works offline)

### 3. **Push Notifications** 💬
- **Title:** "New message in [Room Name]"
- **Body:** "[Username]: Message preview..."
- **Icon:** Amebo logo
- **Auto-dismiss:** 6 seconds (longer for mobile readability)
- **Click Action:** Focuses app window and navigates to room

### 4. **Wake Lock** 🔋
- Briefly wakes device (2 seconds) to ensure notification delivery
- Works even when phone screen is locked
- Automatic release to preserve battery

---

## 🚀 How to Enable

### Step 1: Enable in Profile Settings
1. Tap your **avatar/username** in the top-left corner
2. In the drawer, tap **"Message Notifications"**
3. Toggle to **ON** (green)

### Step 2: Grant Browser Permissions
- Your browser will ask: **"Allow notifications?"**
- Tap **"Allow"**

### Step 3: Test It!
1. Open the app on **Device A** (e.g., your phone)
2. Join a room and enable notifications
3. **Minimize the app or lock your phone**
4. Send a message from **Device B** (e.g., computer or another phone)
5. **Device A** should:
   - **Vibrate** (short-long-short pattern)
   - **Play sound** (800Hz beep)
   - **Show push notification** (with message preview)

---

## 📱 Mobile Experience

### What You'll Feel/Hear/See:
```
New Message Arrives
    ↓
1. 📳 VIBRATE (200-100-300-100-200ms pattern)
2. 🔔 SOUND (800Hz beep, 0.3s)
3. 💬 PUSH (notification card with preview)
4. ⏰ Auto-dismiss after 6 seconds
```

### Notification Content Example:
```
┌─────────────────────────────────────┐
│ 🎯 Amebo                            │
├─────────────────────────────────────┤
│ New message in Tech Chat            │
│                                     │
│ Alice: Hey! Check out this new...  │
│                                     │
│ 👆 Tap to open                      │
└─────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Browser Support
| Feature | iOS Safari | Android Chrome | Desktop Chrome | Firefox |
|---------|-----------|----------------|----------------|---------|
| Vibration | ✅ | ✅ | ❌ (no vibrator) | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ✅ |
| Sound | ✅ | ✅ | ✅ | ✅ |
| Wake Lock | ⚠️ Limited | ✅ | ✅ | ⚠️ Limited |

### Code Architecture

**1. Vibration Pattern:**
```javascript
navigator.vibrate([200, 100, 300, 100, 200]);
// Pattern: vibrate 200ms, pause 100ms, vibrate 300ms, pause 100ms, vibrate 200ms
```

**2. Notification Options:**
```javascript
{
  body: "Username: Message preview...",
  icon: "/static/amebo-logo.png",
  badge: "/static/amebo-logo.png",
  vibrate: [200, 100, 300, 100, 200],
  renotify: true,
  timestamp: Date.now(),
  silent: false,
  requireInteraction: false
}
```

**3. Smart Triggering:**
```javascript
// Only notify when:
✓ App is hidden (document.hidden || !document.hasFocus())
✓ Message is from another user (not self)
✓ Notifications are enabled in settings
✓ Browser permission is granted
```

**4. Wake Lock (Mobile):**
```javascript
if ('wakeLock' in navigator && document.hidden) {
  const wakeLock = await navigator.wakeLock.request('screen');
  setTimeout(() => wakeLock.release(), 2000);
}
```

---

## 🎛️ User Controls

### Profile Settings → Notifications
- **Label:** "Message Notifications"
- **Sublabel:** "📱 Sound + Vibration + Push"
- **Toggle:** ON (green) / OFF (gray)
- **Feedback:** Toast message confirming state

### Toggle Feedback:
```
✅ ON:  "🔔 Notifications enabled!
        📱 You'll receive sound, vibration & push alerts for new messages."

❌ OFF: "🔕 Notifications disabled."
```

---

## 🐛 Troubleshooting

### No Vibration?
1. Check if notifications are **ON** in Profile Settings
2. **Android:** Ensure vibration is enabled in system settings
3. **iOS:** Check that phone is not in "Do Not Disturb" mode
4. **Desktop:** Vibration not supported (no hardware)

### No Sound?
1. Check phone volume (not muted)
2. **iOS:** Check ringer/silent switch on side
3. Try toggling notifications **OFF → ON**
4. Browser might need interaction first - tap screen once

### No Push Notification?
1. Check browser permission: **Settings → Site Settings → Notifications**
2. Ensure notifications are **ON** in Profile Settings
3. Test by sending message from another device
4. **iOS Safari:** Must add to Home Screen for full PWA experience

### Notifications While App is Open?
**By Design!** Notifications only show when:
- App is **minimized/backgrounded**
- Phone screen is **locked**
- Browser tab is **inactive**

This prevents duplicate alerts when you're already reading messages.

---

## 📊 Notification Flow Diagram

```
User Sends Message (Device B)
        ↓
Backend: Message saved to database
        ↓
Device A: Polling detects new message (every 3s)
        ↓
CHECK: Is app hidden/backgrounded?
        ├─ NO  → Skip notification (user is actively viewing)
        └─ YES → Continue ↓
        
CHECK: Is message from self?
        ├─ YES → Skip notification (don't notify for own messages)
        └─ NO  → Continue ↓
        
CHECK: Are notifications enabled?
        ├─ NO  → Skip notification
        └─ YES → Continue ↓
        
TRIGGER NOTIFICATION:
    1. Vibrate (200-100-300-100-200ms)
    2. Play sound (800Hz, 0.3s)
    3. Show push notification
    4. Request wake lock (2s)
    5. Auto-dismiss after 6s
```

---

## 🎨 Visual Indicators

### Notification Toggle (Profile Settings):
```
┌─────────────────────────────────────────────────┐
│ 🔔  Message Notifications           ON   [TOGGLE] │
│     📱 Sound + Vibration + Push                  │
└─────────────────────────────────────────────────┘
```

### Bell Icon (Header):
```
🔔 (with red badge showing unread count)
```

---

## 🔐 Privacy & Security

### What We Track:
- Message ID (to avoid duplicate notifications)
- Room ID (for click-to-navigate)
- Sender ID (to avoid self-notification)

### What We DON'T Track:
- Message content is only shown in notification preview (50 chars max)
- No data sent to external servers
- All notifications are browser-native (no third-party services)

### Permissions Required:
1. **Notification Permission** - Required for push notifications
2. **Wake Lock** (optional) - Improves delivery on locked devices

---

## 🚦 Status Indicators

### Console Logs (for debugging):
```javascript
[NOTIFICATIONS] 📱 Showing mobile notification for message: 12345
[NOTIFICATIONS] ✓ Mobile vibration triggered
[NOTIFICATIONS] ✓ Browser notification shown
[NOTIFICATIONS] ✓ Wake lock acquired for notification delivery
[NOTIFICATIONS] Wake lock released
```

---

## 📈 Future Enhancements (Phase 3)

### Planned Features:
- [ ] **Custom vibration patterns** (user-selectable)
- [ ] **Sound selection** (choose from multiple notification sounds)
- [ ] **Do Not Disturb hours** (auto-disable during sleep)
- [ ] **Per-room notification settings** (mute specific rooms)
- [ ] **Rich notifications** (inline reply on Android)
- [ ] **Notification grouping** (bundle multiple messages)
- [ ] **Persistent notification** (for ongoing chats)

---

## 🎓 Best Practices

### For Developers:
1. **Test on real devices** - Simulators don't support vibration
2. **Respect battery** - Keep wake locks brief (max 2s)
3. **User consent** - Always request permissions explicitly
4. **Graceful fallback** - Handle permission denials smoothly

### For Users:
1. **Enable on first use** - Grant permissions when prompted
2. **Test thoroughly** - Send test message to verify setup
3. **Adjust as needed** - Toggle OFF during meetings/sleep
4. **Battery conscious** - Wake locks are brief by design

---

## 📞 Support

### Having Issues?
1. Check this guide's **Troubleshooting** section
2. Test in **Private/Incognito mode** (clears old permissions)
3. Try different browser (Chrome recommended on Android)
4. Contact: **ads@oztec.cam**

---

## 🎉 Success Criteria

✅ **You'll know it works when:**
1. Phone vibrates with short-long-short pattern
2. Hear pleasant beep sound
3. See notification card with message preview
4. Tapping notification opens/focuses app
5. Notification auto-dismisses after 6 seconds

---

## 📝 Changelog

### v1.1.0 (Current) - Mobile Notification Enhancement
- ✅ Added vibration pattern (200-100-300-100-200ms)
- ✅ Implemented Wake Lock API for locked devices
- ✅ Enhanced notification metadata (timestamp, data payload)
- ✅ Extended auto-close to 6 seconds for mobile
- ✅ Added renotify flag for repeated alerts
- ✅ Updated Profile Settings UI with mobile labels
- ✅ Improved toggle feedback messages

### v1.0.0 - Initial Notification System
- ✅ Browser push notifications
- ✅ Web Audio API sound (800Hz beep)
- ✅ Smart detection (hidden app only)
- ✅ Profile Settings toggle
- ✅ Permission handling

---

## 🔗 Related Documentation
- [Profile Settings Guide](PROFILE_SETTINGS_PLAN.md)
- [Advertiser Login Fix](ADVERTISER_LOGIN_FIXED.md)
- [README](README.md)

---

**Git Commit:** `52295f3` - "ENHANCED: Mobile notification features with vibration"

**Last Updated:** December 20, 2025

**Status:** ✅ **FULLY IMPLEMENTED & LIVE**

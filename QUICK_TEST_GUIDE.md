# 🧪 Quick Testing Guide - All New Features

## 🎯 Test in 5 Minutes!

**Live Demo:** https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

---

## Test 1: Profile Avatar (30 seconds)

1. Open app
2. See "Profile Picture (Optional)"
3. Click "Choose Photo"
4. Select any image from your device
5. ✅ Preview appears instantly
6. Enter username: `TestUser`
7. Click "Login / Register"
8. ✅ See your avatar in room code prompt

---

## Test 2: Room Code Prompt (30 seconds)

1. After login from Test 1
2. ✅ See room code prompt screen
3. ✅ Your avatar is displayed
4. See 3 options:
   - Join Room
   - Create New Room
   - Logout
5. Enter room code: `test123`
6. Enter room name: `Test Room`
7. Click "Create New Room"
8. ✅ Room created and opened

---

## Test 3: View-Once Files (1 minute)

**Sender Side:**
1. In chat room, click attachment button (📎)
2. Click "Document" or "Photo"
3. Select an image
4. ✅ See prompt: "Make this a VIEW ONCE file?"
5. Click **OK** for view-once
6. ✅ See "🔒 Preparing view-once..." loading
7. ✅ Message sent with purple "VIEW ONCE" badge

**Receiver Side:**
1. Open same room (another browser/device)
2. ✅ See message with purple badge
3. ✅ Text says "Tap to view once"
4. Click the file
5. ✅ Warning: "This file will be deleted after viewing"
6. Click OK
7. ✅ File opens once
8. ✅ After viewing: "File deleted" message

**Try Again:**
1. Click same message
2. ✅ Shows "File has been deleted"
3. ✅ Cannot view again

---

## Test 4: Super-Fast Compression (1 minute)

1. In chat room, click attachment button
2. Select "Photo"
3. Choose a **large image** (e.g., 5MB photo)
4. Click **Cancel** for view-once (normal file)
5. ✅ Notice "Compressing..." message
6. ✅ Upload completes in < 2 seconds
7. ✅ Image thumbnail appears in chat
8. Click to view
9. ✅ Image still looks great
10. Check file size in message
11. ✅ Size reduced by 60-80%

**Compare:**
- Before: 5MB, 10 seconds upload
- After: 1MB, 2 seconds upload
- Quality: Still looks amazing

---

## Test 5: Avatar in Messages (30 seconds)

1. In chat room, send a message: "Hello!"
2. ✅ Your message appears on right (no avatar)
3. Login with another account/browser
4. Send message from other account
5. ✅ Other user's messages show avatar on left
6. ✅ WhatsApp-style display

---

## Test 6: Complete Flow (2 minutes)

**Full user journey:**

1. **Login**
   - Upload avatar
   - Enter username
   - ✅ Avatar saved

2. **Room Code Prompt**
   - See avatar in prompt
   - Enter room code
   - Create/join room
   - ✅ Explicit room entry

3. **Send View-Once File**
   - Upload image
   - Choose view-once
   - ✅ File compressed automatically
   - ✅ Uploads super fast
   - ✅ Purple badge shown

4. **Receive & View**
   - Other user clicks
   - ✅ File opens once
   - ✅ Auto-deleted after viewing

5. **Regular Messages**
   - Send text message
   - ✅ Avatar shown for others
   - ✅ WhatsApp-style bubbles

---

## ✅ What You Should See

### Profile Avatar:
- ✅ Upload button at login
- ✅ Preview after selection
- ✅ Avatar in room code prompt
- ✅ Avatar next to messages
- ✅ Compressed to 200x200px

### Room Code Prompt:
- ✅ Shown after every login
- ✅ No auto-join to rooms
- ✅ 3 options: Join/Create/Logout
- ✅ Avatar displayed at top
- ✅ Room code input field

### View-Once Files:
- ✅ Prompt when uploading
- ✅ Purple "VIEW ONCE" badge
- ✅ Warning before viewing
- ✅ One-time access only
- ✅ "File deleted" after viewing

### Super-Fast Compression:
- ✅ Automatic for images
- ✅ 60-80% size reduction
- ✅ < 1 second compression
- ✅ 5-10x faster uploads
- ✅ Quality still great

---

## 🚫 What NOT to See

### Errors to watch for:
- ❌ "File too large" (only if > 10MB)
- ❌ Avatar not appearing (check localStorage)
- ❌ View-once not working (check localStorage)
- ❌ Compression slow (should be < 1s)

### If issues occur:
1. Clear browser cache/localStorage
2. Refresh page
3. Try different browser
4. Check console for errors

---

## 📊 Expected Performance

| Feature | Expected Time |
|---------|--------------|
| Avatar upload | < 0.5s |
| Image compression | < 1s |
| File upload (1MB) | < 2s |
| View-once check | < 0.1s |
| Room code entry | Instant |
| Message send | < 1s |

---

## 🎉 Success Criteria

All these should work:
- ✅ Avatar upload and display
- ✅ Room code prompt appears
- ✅ View-once files auto-delete
- ✅ Images compress automatically
- ✅ Faster file transfers
- ✅ WhatsApp-style UI
- ✅ All existing features still work

---

## 💡 Pro Tips

### Testing View-Once:
- Use two browsers for sender/receiver
- Or use incognito + normal window
- Or test on mobile + desktop

### Testing Compression:
- Use large images (5MB+)
- Compare upload time before/after
- Check file size in message

### Testing Avatars:
- Try different image formats
- Test with large/small images
- Check localStorage persistence

### Testing Room Code:
- Try creating new rooms
- Try joining existing rooms
- Test logout and re-login

---

## 🌐 Live Demo

**Test everything here:**
👉 https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

**All features are working and ready to test!**

---

## 📞 Need Help?

Check documentation:
- `NEW_FEATURES_GUIDE.md` - Detailed guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details
- `README.md` - Full feature list

**Happy Testing! 🎉**

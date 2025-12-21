# Enhanced Features Testing Guide

## 🎯 All 5 Features Implemented & Ready to Test!

Test URL: **https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai**

---

## 🧪 Testing Checklist

### ✅ Feature 1: Contact Requests

**Test Scenario:**
1. **User A**: Login as `administracion@elipower.com`
2. **User B**: Login as `test@example.com` (different browser)

**Steps:**
1. User A → Search Users → Find User B
2. User A → Click **"Add Contact"** button (blue user-plus icon)
3. User B → Open Profile → **Contact Requests**
4. User B → See User A's request → Click **✓ (green check)**
5. Both users → Go to **My Contacts** → See each other!

**Expected Results:**
- ✅ User B sees request with timestamp
- ✅ After accept, both appear in each other's contacts
- ✅ Can message each other directly from contacts
- ✅ Toast notification shows "Contact request sent!" / "accepted!"

**Alternative:** User B can click **✗ (red X)** to reject

---

### ✅ Feature 2: Block/Unblock Users

**Test Scenario:**
Continue with User A & B from above

**Steps:**
1. User A → Search Users → Find User B
2. User A → Click **"Block"** button (red ban icon)
3. Confirm blocking
4. User A → Profile → **Blocked Users** → See User B
5. User B → Try to message User A → Should fail
6. User A → Blocked Users → Click **"Unblock"** → User B unblocked

**Expected Results:**
- ✅ User B added to blocked list immediately
- ✅ User B removed from contacts automatically
- ✅ User B cannot send messages or DMs to User A
- ✅ User B doesn't appear in User A's search results
- ✅ After unblock, User B can interact again
- ✅ Toast notifications for block/unblock actions

---

### ✅ Feature 3: Online Status

**Test Scenario:**
With User A & B as contacts

**Steps:**
1. User A → Stay on the app (keep browser open)
2. User B → Go to **My Contacts**
3. User B → Look for User A's avatar → See **green dot** (online)
4. User A → Close the browser/tab
5. Wait 2 minutes
6. User B → Refresh contacts → See "Last seen 2m ago"

**Expected Results:**
- ✅ Green dot appears for online users
- ✅ Online status updates every 60 seconds
- ✅ "Last seen X ago" shows for offline users
- ✅ Last seen respects privacy settings (if enabled)
- ✅ Format: "just now", "5m ago", "2h ago", "3d ago"

---

### ✅ Feature 4: Typing Indicators

**Test Scenario:**
User A & B in a DM or group chat

**Steps:**
1. User A → Open chat with User B
2. User B → Open same chat
3. User A → Start typing in the message input
4. User B → Look below the messages → See typing indicator

**Expected Appearance:**
```
• • •  administracion is typing...
```

**Additional Tests:**
- Type for 5+ seconds → Indicator auto-stops
- Stop typing → Indicator disappears immediately
- Multiple users typing → "John, Alice are typing..."

**Expected Results:**
- ✅ Beautiful animated dots (• • •)
- ✅ Shows username of who's typing
- ✅ Updates in real-time (3s polling)
- ✅ Auto-stops after 5 seconds of no activity
- ✅ Multiple users supported

---

### ✅ Feature 5: Read Receipts

**Test Scenario:**
User A sends messages to User B

**Steps:**
1. User A → Open chat with User B
2. User A → Send a message: "Hello! Testing read receipts"
3. User B → Don't open the chat yet
4. Wait 3 seconds
5. User B → Open the chat with User A
6. User A → See the message status change

**Backend Process (automatic):**
- When User B opens chat, all messages are marked as read
- Backend stores read receipts in `message_receipts` table
- User A can query `/api/messages/{messageId}/receipts` to see who read

**Expected Results:**
- ✅ Messages auto-marked as read when viewing
- ✅ Read receipts stored with timestamp
- ✅ Multiple users can read same message (group chats)
- ✅ Can query who read each message

**Future UI Enhancement:**
- Show checkmarks (✓ sent, ✓✓ read)
- Blue ticks for read messages
- Timestamp of when read

---

## 📋 Complete Feature Test Matrix

| Feature | User A | User B | Expected Outcome |
|---------|--------|--------|------------------|
| **Contact Request** | Send request | Accept | Both in contacts |
| **Block User** | Block B | Try to message | Message fails |
| **Online Status** | Stay online | View contacts | Green dot shows |
| **Typing Indicator** | Type message | View chat | "A is typing..." |
| **Read Receipt** | Send message | Open chat | Message marked read |

---

## 🎨 UI/UX Testing

### Profile Drawer Sections

**Contacts Section (new!):**
- Contact Requests
- My Contacts  
- Blocked Users

**Test Navigation:**
1. Click profile avatar (top left)
2. See new "Contacts" section
3. Click each menu item
4. Verify proper navigation and back button

---

### User Search Enhancements

**Action Buttons (3 new buttons):**
1. **Message** (green) - Start DM
2. **Add Contact** (blue) - Send request
3. **Block** (red) - Block user

**Test:**
1. Search for a user
2. See all 3 buttons
3. Click each one
4. Verify toast notifications

---

### Contact Requests Page

**Elements to verify:**
- Request list with avatars
- Requester username & email
- Request timestamp
- Accept button (green ✓)
- Reject button (red ✗)

**Test:**
- Accept a request → Updates immediately
- Reject a request → Disappears from list

---

### My Contacts Page

**Elements to verify:**
- Contact list with avatars
- Online status (green dot or "Last seen")
- Message button (green)
- Remove button (red user-times icon)

**Test:**
- Click message → Opens DM
- Click remove → Confirm → Contact removed

---

### Blocked Users Page

**Elements to verify:**
- Blocked users list with red background
- Block reason (if provided)
- Block timestamp
- Unblock button (green unlock)

**Test:**
- Unblock user → User removed from list
- Search for unblocked user → They appear again

---

### Typing Indicator (in chat)

**Location:** Below messages, above input

**Elements to verify:**
- Animated dots (• • •) with bounce effect
- Username text
- Proper grammar ("is" vs "are")
- Hidden state when no one typing

**Test:**
- Open chat in 2 browsers
- Type in one → See in other
- Stop typing → Indicator disappears

---

## 🔧 Developer Testing

### Backend API Tests

**Contact Requests:**
```bash
# Send request
curl -X POST http://localhost:3000/api/contacts/request \
  -H "X-User-Email: user1@test.com" \
  -H "Content-Type: application/json" \
  -d '{"contact_id": "user2-id"}'

# Get requests
curl http://localhost:3000/api/contacts/requests \
  -H "X-User-Email: user2@test.com"

# Accept request
curl -X POST http://localhost:3000/api/contacts/accept \
  -H "X-User-Email: user2@test.com" \
  -H "Content-Type: application/json" \
  -d '{"requester_id": "user1-id"}'
```

**Block Users:**
```bash
# Block user
curl -X POST http://localhost:3000/api/users/block \
  -H "X-User-Email: user1@test.com" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user2-id", "reason": "Spam"}'

# Get blocked
curl http://localhost:3000/api/users/blocked \
  -H "X-User-Email: user1@test.com"

# Unblock
curl -X DELETE http://localhost:3000/api/users/block/user2-id \
  -H "X-User-Email: user1@test.com"
```

**Online Status:**
```bash
# Update status
curl -X POST http://localhost:3000/api/users/status \
  -H "X-User-Email: user1@test.com" \
  -H "Content-Type: application/json" \
  -d '{"status": "online"}'

# Get online users in room
curl http://localhost:3000/api/rooms/room-id/online
```

**Typing Indicators:**
```bash
# Start typing
curl -X POST http://localhost:3000/api/typing/start \
  -H "X-User-Email: user1@test.com" \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-id"}'

# Stop typing
curl -X POST http://localhost:3000/api/typing/stop \
  -H "X-User-Email: user1@test.com" \
  -H "Content-Type: application/json" \
  -d '{"room_id": "room-id"}'

# Get who's typing
curl http://localhost:3000/api/typing/room-id
```

**Read Receipts:**
```bash
# Mark as read
curl -X POST http://localhost:3000/api/messages/msg-id/read \
  -H "X-User-Email: user1@test.com"

# Get receipts
curl http://localhost:3000/api/messages/msg-id/receipts
```

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Read receipts UI not yet shown in messages** (backend ready, UI coming soon)
2. **Online status doesn't sync across tabs** (updates every 60s)
3. **Typing indicator polling uses 3s interval** (can increase if needed)
4. **No notification for contact requests** (UI only, no push)

### Future Enhancements:
- [ ] Show read receipt checkmarks in messages
- [ ] WebSocket for real-time typing/online status
- [ ] Push notifications for contact requests
- [ ] Group typing indicator ("3 people are typing...")
- [ ] Presence "away" status (idle detection)

---

## 📊 Database Schema

### New Tables Created:

**typing_status:**
- room_id, user_id (composite PK)
- started_at (timestamp)

**message_receipts:**
- message_id, user_id (composite PK)
- read_at (timestamp)

**blocked_users:**
- user_id, blocked_user_id (composite PK)
- blocked_at (timestamp)
- reason (optional text)

**users (new columns):**
- last_seen (timestamp)
- online_status (text: 'online', 'offline', 'away')

---

## 🎉 Success Criteria

### All Features Working If:
- ✅ Can send and accept contact requests
- ✅ Contacts show with online status
- ✅ Can block/unblock users successfully
- ✅ Blocked users cannot interact
- ✅ Typing indicator shows in real-time
- ✅ Messages marked as read automatically
- ✅ No console errors
- ✅ All toast notifications appear
- ✅ UI is responsive and smooth

---

## 💡 Testing Tips

1. **Use 2+ browsers** for multi-user testing
2. **Open DevTools Console** to see logs:
   - `[CONTACTS]` - Contact operations
   - `[BLOCK]` - Block/unblock operations
   - `[STATUS]` - Online status updates
   - `[TYPING]` - Typing indicators
   - `[RECEIPTS]` - Read receipts

3. **Check Network tab** for API calls
4. **Use incognito/private windows** for separate users
5. **Hard refresh** (Ctrl+Shift+R) if features don't work

---

## 🚀 Quick Start Guide

1. Open: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. Register/Login: `administracion@elipower.com`
3. Click Profile → See **Contacts** section
4. Search Users → Test all 3 buttons
5. Open a chat → Start typing → See indicator (use 2 browsers)

---

**ALL FEATURES ARE LIVE AND READY TO TEST!**

Happy testing! 🎊

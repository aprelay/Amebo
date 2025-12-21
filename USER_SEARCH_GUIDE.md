# User Search & Direct Messaging Guide

## 🎯 Overview

The new User Search & Direct Messaging feature allows users to:
- **Find other users** by username or email
- **Start private 1-on-1 chats** instantly
- **Control privacy** with granular settings
- **Manage contacts** with request/accept workflow

---

## 🚀 Features

### 1. User Search
- **Real-time search** as you type
- Search by **username or email**
- View user **profiles with avatars**
- **One-click messaging**

### 2. Direct Messaging
- **Instant private chats** without room codes
- **Automatic DM room creation**
- **WhatsApp-style interface**
- **E2E encryption** (same as group chats)

### 3. Privacy Controls
Located in: **Profile Drawer → Privacy → Privacy Settings**

#### Profile Searchability
- **ON**: Anyone can find you in search
- **OFF**: You're hidden from search results

#### Message Privacy
- **Anyone**: Anyone can send you DMs
- **Contacts Only**: Only approved contacts can message you
- **Nobody**: No one can start new chats (ultra-private mode)

#### Last Seen Privacy
- **Everyone**: All users see when you were last online
- **Contacts Only**: Only your contacts see last seen
- **Nobody**: No one sees your last seen status

### 4. Contact System (Coming Soon)
- Send contact requests
- Accept/reject requests
- Manage contact list
- Privacy enforcement

---

## 📱 How to Use

### Finding and Messaging Users

1. **Open the App**
   - Login with your email: `administracion@elipower.com` (or any email)
   
2. **Access User Search**
   - On the main room list page, find the **"Find Users"** card
   - Click **"Search Users"** button (green button with magnifying glass icon)

3. **Search for Users**
   - Type at least **2 characters** in the search box
   - Search by **username** (e.g., "john") or **email** (e.g., "john@example.com")
   - Results appear instantly as you type

4. **Start a Chat**
   - Click the **"Message"** button (green) next to any user
   - If successful, opens direct chat immediately
   - If user has privacy settings, you'll see an error message

### Managing Privacy Settings

1. **Open Privacy Settings**
   - Tap your **profile avatar** or menu icon (top left)
   - Scroll to **"Privacy"** section
   - Click **"Privacy Settings"**

2. **Configure Searchability**
   - Toggle the switch to enable/disable profile discovery
   - Green = Searchable, Gray = Hidden

3. **Set Message Privacy**
   - Choose who can message you:
     * **Anyone**: Open to all (default)
     * **Contacts Only**: Need approval first
     * **Nobody**: Ultra-private mode

4. **Configure Last Seen**
   - Choose who sees your online status:
     * **Everyone**: All users
     * **Contacts Only**: Approved contacts
     * **Nobody**: Hidden from all

5. **Save Settings**
   - Click **"Save Settings"** button
   - Settings apply immediately

---

## 🔒 Privacy Enforcement

### Backend API Protection

All privacy settings are enforced on the backend:

1. **Search API** (`/api/users/search`)
   - Only returns users with `is_searchable = true`
   - Filters out hidden profiles

2. **Direct Message API** (`/api/rooms/direct`)
   - Checks recipient's `message_privacy` setting
   - Returns appropriate error if not allowed
   - Respects contact-only restrictions

3. **Last Seen Display**
   - Filtered based on `last_seen_privacy` setting
   - Only shows to authorized users

### Error Messages

- **"User privacy settings don't allow direct messages"**
  - User set message privacy to "Nobody"
  
- **"You need to be contacts with this user to send messages"**
  - User set message privacy to "Contacts Only"
  - Send a contact request first

- **"No users found"**
  - User might have disabled searchability
  - Or username/email doesn't exist

---

## 🧪 Testing Guide

### Test Scenario 1: Basic User Search

1. **Register two users:**
   - User A: `administracion@elipower.com`
   - User B: `test@example.com`

2. **Login as User A**
   - Go to room list
   - Click "Search Users"

3. **Search for User B**
   - Type "test" in search box
   - Should see User B in results

4. **Start Chat**
   - Click "Message" button
   - Should open direct chat
   - Send a message to verify E2E encryption works

### Test Scenario 2: Privacy Settings

1. **Login as User B**
   - Open Profile → Privacy Settings
   - Turn OFF searchability
   - Set message privacy to "Contacts Only"
   - Save settings

2. **Login as User A**
   - Search for User B again
   - User B should NOT appear in results

3. **Try Direct Message**
   - If you have the direct room already open
   - Messages still work (existing rooms preserved)
   - New users can't find User B

### Test Scenario 3: Privacy Modes

**Test "Nobody" Mode:**
1. User B sets message privacy to "Nobody"
2. User A tries to message User B
3. Should see error: "User privacy settings don't allow direct messages"

**Test "Contacts Only" Mode:**
1. User B sets message privacy to "Contacts Only"
2. User A tries to message (not contacts yet)
3. Should see error: "You need to be contacts with this user"

**Test Hidden Last Seen:**
1. User B sets last seen to "Nobody"
2. User A views User B's profile
3. Should not see "last seen" timestamp

---

## 💡 Tips & Best Practices

### For Users

1. **Start with Open Settings**
   - Default is searchable + anyone can message
   - Good for new users building network

2. **Gradually Restrict**
   - As you get more contacts, switch to "Contacts Only"
   - Prevents spam from unknown users

3. **Use Search Wisely**
   - Search by exact username for best results
   - Email search is case-insensitive

4. **Privacy First**
   - If you value privacy, disable searchability
   - Set message privacy to "Contacts Only" or "Nobody"

### For Testing

1. **Use Multiple Browsers**
   - Chrome for User A
   - Firefox/Safari for User B
   - Test search and messaging

2. **Clear LocalStorage**
   - Clear cache between tests
   - Ensures fresh state

3. **Check Console Logs**
   - Look for `[SEARCH]`, `[DM]`, `[PRIVACY]` tags
   - Helps debug issues

---

## 🔧 Technical Details

### Database Schema

**Users Table - New Columns:**
```sql
- is_searchable (BOOLEAN) DEFAULT 1
- message_privacy (TEXT) DEFAULT 'anyone'
- last_seen_privacy (TEXT) DEFAULT 'everyone'
```

**Contacts Table:**
```sql
- user_id (TEXT) - User who owns the contact list
- contact_id (TEXT) - The contact user
- status (TEXT) - 'pending', 'accepted', 'blocked'
- created_at (DATETIME)
```

**Chat Rooms - New Column:**
```sql
- room_type (TEXT) DEFAULT 'group'
  - 'group': Multi-user room with room code
  - 'direct': 1-on-1 private message room
```

### API Endpoints

**User Search:**
```http
GET /api/users/search?q=query
Headers: X-User-Email: your-email@example.com

Response:
[
  {
    "id": "user-id",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "https://..."
  }
]
```

**Create Direct Message:**
```http
POST /api/rooms/direct
Headers: 
  X-User-Email: your-email@example.com
  Content-Type: application/json

Body:
{
  "recipient_id": "target-user-id"
}

Response:
{
  "room": {
    "room_code": "dm_user1_user2",
    "room_type": "direct",
    "members": [...]
  }
}
```

**Update Privacy Settings:**
```http
POST /api/users/privacy
Headers:
  X-User-Email: your-email@example.com
  Content-Type: application/json

Body:
{
  "is_searchable": true,
  "message_privacy": "anyone",
  "last_seen_privacy": "everyone"
}

Response:
{
  "success": true
}
```

---

## 🐛 Troubleshooting

### Issue: "User not found" but user exists

**Solution:**
- User might have disabled searchability
- Check privacy settings as that user

### Issue: Can't send message to user

**Solution:**
- Check recipient's message privacy setting
- If "Contacts Only", send contact request first
- If "Nobody", messaging is disabled

### Issue: Search results empty

**Solution:**
- Type at least 2 characters
- Check spelling of username/email
- User might be hidden (searchability off)

### Issue: Privacy settings not saving

**Solution:**
- Check browser console for errors
- Verify you're logged in
- Hard refresh (Ctrl+Shift+R)

---

## 📊 Feature Status

✅ **Completed:**
- User search by username/email
- Direct message room creation
- Privacy settings UI
- Backend privacy enforcement
- Real-time search results
- WhatsApp-style DM interface

🚧 **Coming Soon:**
- Contact request UI
- Block user feature
- Typing indicators in DMs
- Read receipts
- Last seen timestamps
- Online/offline status

---

## 🎉 Success Metrics

After implementing this feature:
- ✅ Users can find each other without sharing room codes
- ✅ Private 1-on-1 chats work seamlessly
- ✅ Privacy controls are comprehensive and enforceable
- ✅ Backend APIs protect user preferences
- ✅ UI is intuitive and WhatsApp-inspired

---

**Test URL:** https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

**Login Email:** `administracion@elipower.com` (or register any email)

**Need Help?** Check console logs for detailed debugging info!

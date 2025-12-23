# Swipe to Delete FAQ

## ❓ What does "Swipe to Delete" do?

**Swipe to delete a chat does NOT remove the contact.** It only:

✅ **Leaves the chat room**
✅ **Removes the chat from your list** 
✅ **You can rejoin anytime** using the room code
✅ **Messages remain** for other members
❌ **Does NOT delete the contact** from your contacts list

---

## 🔄 What's the difference?

### **Swipe to Delete Chat:**
- **Location:** Room list page (chat list)
- **Action:** Swipe left on a chat → Click delete button
- **What it does:** Calls `/api/rooms/${roomId}/leave`
- **Result:** You leave the room, chat disappears from your list
- **Contact status:** Contact remains in your contacts list
- **Can rejoin?** ✅ Yes, with the room code

### **Remove Contact:**
- **Location:** Contacts page
- **Action:** Click remove button on contact card
- **What it does:** Calls `/api/contacts/${contactId}` (DELETE)
- **Result:** Contact is removed from your contacts list
- **Chat status:** Existing chats remain (you're still in the room)
- **Can re-add?** ✅ Yes, by adding them again

---

## 🎯 When to use each:

| Situation | Use |
|-----------|-----|
| Want to clean up chat list | **Swipe to Delete Chat** |
| Still want to contact person later | **Swipe to Delete Chat** (keep contact) |
| Don't want to see person in contacts | **Remove Contact** |
| Want to completely disconnect | **Remove Contact** + **Delete Chat** |

---

## 💬 The Confirmation Dialog Says:

```
Delete "Room Name"?

This will:
• Remove the chat from your list
• You can rejoin with the room code later
• Messages will remain for other members
```

**Notice:** It says "remove from your list", NOT "delete contact"

---

## 🔧 Technical Details:

### Swipe to Delete Implementation:
```javascript
async deleteRoom(roomId) {
    // Calls: POST /api/rooms/${roomId}/leave
    // Result: User leaves room
    // Then: await this.loadRooms() - Reloads room list
}
```

### Remove Contact Implementation:
```javascript
async removeContact(contactId) {
    // Calls: DELETE /api/contacts/${contactId}
    // Result: Contact removed from contacts table
    // Then: await this.loadMyContacts() - Reloads contacts
}
```

---

## ⚠️ Stack Overflow Issue (Unrelated):

The "Maximum call stack size exceeded" error you're experiencing is **NOT related to swipe to delete**.

### Root Cause:
- Voice note sending triggers `loadMessages()`
- Polling also calls `loadMessages()` every 3 seconds
- Both can run simultaneously → race condition → stack overflow

### Fix Applied:
✅ Pause polling before sending voice notes
✅ Resume polling after sending completes
✅ Recording guard prevents multiple recordings

**Commits:**
- `a5431a3` - Polling pause fix
- `1d3d8e9` - Recording guard
- `6ade412` - Remove old gesture code

---

## ✅ Summary:

| Feature | Removes Chat | Removes Contact |
|---------|--------------|-----------------|
| **Swipe to Delete** | ✅ Yes | ❌ No |
| **Remove Contact** | ❌ No | ✅ Yes |

**To fully disconnect:** Do both!

---

## 🎯 Recommended Workflow:

1. **Casual cleanup:** Just swipe to delete chats
2. **Stop talking to someone:** Remove contact (keeps chat history if needed)
3. **Complete removal:** Remove contact + Delete chat
4. **Rejoin chat:** Use room code (even if contact removed)

---

**Questions?** Check the code:
- Swipe: `confirmDeleteRoom()` → `deleteRoom()` (line 1972)
- Contact: `removeContact()` (line 8818)

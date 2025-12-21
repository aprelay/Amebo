# 🔐 PIN Reset Feature - Complete Guide

## Overview
Users can now reset their forgotten PIN using a security question verification system. This feature provides a secure way to recover access to token gifting functionality without requiring email verification.

---

## 🎯 Features

### 1. **Security Question Setup**
- Users can set up a security question when creating their PIN
- Choice of 6 common security questions:
  - What is your mother's maiden name?
  - What was the name of your first pet?
  - What city were you born in?
  - What is your favorite food?
  - What was your childhood nickname?
  - What is the name of your favorite teacher?
- Answers are case-insensitive (normalized to lowercase)
- Minimum 3 characters required for answers

### 2. **Forgot PIN Workflow**
- "Forgot PIN?" link available in token gift modal
- Loads user's security question
- Prompts for answer and new PIN
- Verifies answer before resetting PIN
- Shows remaining attempts on failed verification

### 3. **Security & Rate Limiting**
- **Answer Hashing**: SHA-256 encryption for stored answers
- **Rate Limiting**: Maximum 5 reset attempts per hour
- **Attempt Tracking**: Counters reset after 1 hour
- **Error Messages**: Clear feedback with remaining attempts
- **No PIN Exposure**: PINs never logged or exposed in responses

---

## 🚀 User Flow

### Setting Up Security Question (First Time)

1. **During PIN Setup**:
   ```
   User creates PIN → See tip about security question
   Click "Setup a security question" → Select question & answer
   ```

2. **When Needing Reset**:
   ```
   Click "Forgot PIN?" → If no question set, prompted to setup
   Select question → Enter answer → Save
   ```

### Resetting PIN (With Security Question Set)

1. **Initiate Reset**:
   ```
   Token Gift Modal → Click "Forgot PIN?" → Loads security question
   ```

2. **Verify & Reset**:
   ```
   Enter answer → Enter new 4-digit PIN → Confirm PIN
   Click "Reset PIN" → Verification → PIN reset successfully
   ```

3. **Success**:
   ```
   Modal shows: "✅ PIN reset successfully!"
   Automatically returns to token gift modal
   Can immediately use new PIN for gifting
   ```

### Rate Limiting Behavior

**Scenario 1: Correct Answer**
```
Attempt 1: Wrong answer → "Incorrect answer (4 attempts remaining)"
Attempt 2: Correct answer → "✅ PIN reset successfully!"
Counter resets to 0
```

**Scenario 2: Max Attempts Reached**
```
Attempts 1-5: All wrong answers
Attempt 6: "Too many reset attempts. Please try again in 1 hour."
Shows remaining time: "Try again in 47 minutes"
```

**Scenario 3: After 1 Hour**
```
After 1+ hours pass → Counter automatically resets
User gets fresh 5 attempts
```

---

## 🗄️ Database Schema

### Migration 0008: PIN Reset

```sql
-- Add security questions for PIN reset
ALTER TABLE users ADD COLUMN security_question TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN security_answer TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN pin_reset_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_pin_reset DATETIME DEFAULT NULL;
```

### Database Fields

| Field | Type | Description |
|-------|------|-------------|
| `security_question` | TEXT | User's chosen security question |
| `security_answer` | TEXT | SHA-256 hashed answer (lowercase) |
| `pin_reset_attempts` | INTEGER | Number of failed reset attempts |
| `last_pin_reset` | DATETIME | Timestamp of last reset attempt |

---

## 🔌 API Endpoints

### 1. Set Security Question
```http
POST /api/users/pin/security-question
Content-Type: application/json

{
  "userId": "user-123",
  "question": "What is your mother's maiden name?",
  "answer": "smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Security question set successfully"
}
```

**Validation:**
- Answer must be at least 3 characters
- Answer is normalized to lowercase and trimmed
- Answer is SHA-256 hashed before storage

---

### 2. Get Security Question
```http
GET /api/users/:userId/security-question
```

**Success Response:**
```json
{
  "success": true,
  "question": "What is your mother's maiden name?"
}
```

**Error Response (No Question Set):**
```json
{
  "error": "No security question set"
}
```

---

### 3. Reset PIN
```http
POST /api/users/pin/reset
Content-Type: application/json

{
  "userId": "user-123",
  "answer": "smith",
  "newPin": "1234"
}
```

**Success Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "PIN reset successfully"
}
```

**Error Response (Wrong Answer):**
```json
{
  "error": "Incorrect answer",
  "verified": false,
  "remainingAttempts": 4
}
```

**Error Response (Rate Limited):**
```json
{
  "error": "Too many reset attempts. Please try again in 1 hour.",
  "remainingTime": 47
}
```

**Validation:**
- New PIN must be exactly 4 digits
- Answer is case-insensitive
- Rate limiting enforced (5 attempts per hour)

---

## 💻 Frontend Functions

### Core Functions

#### 1. `showForgotPinModal()`
Opens the forgot PIN modal and loads security question.

```javascript
app.showForgotPinModal()
```

**Behavior:**
- Closes token gift modal
- Shows loading spinner
- Calls `loadSecurityQuestion()`
- Renders reset form or setup prompt

---

#### 2. `loadSecurityQuestion()`
Fetches user's security question from backend.

```javascript
await app.loadSecurityQuestion()
```

**Two Paths:**
1. **Question Exists**: Shows reset form with question
2. **No Question**: Prompts user to setup security question

---

#### 3. `submitPinReset()`
Submits PIN reset request with security answer.

```javascript
await app.submitPinReset()
```

**Validation:**
- Answer length ≥ 3 characters
- New PIN is exactly 4 digits
- PIN confirmation matches

**Success:**
- Shows success message
- Closes forgot PIN modal after 1.5s
- Opens token gift modal for immediate use

---

#### 4. `showSetupSecurityQuestionModal()`
Opens modal to setup a new security question.

```javascript
app.showSetupSecurityQuestionModal()
```

**Features:**
- Dropdown with 6 predefined questions
- Answer input with validation
- Saves to backend via API

---

#### 5. `saveSecurityQuestion()`
Saves security question and answer to backend.

```javascript
await app.saveSecurityQuestion()
```

**Flow:**
```
Validate inputs → POST to API → Show success → Return to forgot PIN flow
```

---

## 🔒 Security Features

### 1. **Answer Hashing**
```javascript
// Backend hashing
const hashedAnswer = await crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(answer.toLowerCase().trim())
)
const answerHash = Array.from(new Uint8Array(hashedAnswer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')
```

**Benefits:**
- Answers never stored in plain text
- Case-insensitive comparison
- Trim whitespace for consistency
- SHA-256 industry standard

---

### 2. **Rate Limiting**
```javascript
// Check rate limiting
const now = new Date()
if (user.last_pin_reset) {
  const lastReset = new Date(user.last_pin_reset)
  const hoursSinceLastReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceLastReset < 1 && user.pin_reset_attempts >= 5) {
    return c.json({ 
      error: 'Too many reset attempts. Please try again in 1 hour.',
      remainingTime: Math.ceil((1 - hoursSinceLastReset) * 60) // minutes
    }, 429)
  }
}
```

**Protection Against:**
- Brute force attacks
- Automated guessing
- Repeated failed attempts

---

### 3. **Attempt Tracking**
```javascript
// Increment failed attempts
await c.env.DB.prepare(`
  UPDATE users 
  SET pin_reset_attempts = pin_reset_attempts + 1,
      last_pin_reset = ?
  WHERE id = ?
`).bind(now.toISOString(), userId).run()

// Show remaining attempts
const attempts = (user.pin_reset_attempts || 0) + 1
const remaining = 5 - attempts
console.log(`[PIN RESET] Failed attempt for user ${userId}. Attempts: ${attempts}/5`)
```

---

## 🎨 UI Components

### 1. Forgot PIN Link
```html
<button 
  onclick="app.showForgotPinModal()"
  class="text-xs text-purple-600 hover:text-purple-800 mt-2 underline"
>
  Forgot PIN?
</button>
```

**Location**: Token gift modal, below PIN input

---

### 2. Security Question Setup Tip
```html
<div class="mb-4 p-3 bg-yellow-50 rounded-lg">
  <p class="text-xs text-yellow-800">
    <i class="fas fa-shield-alt mr-2"></i>
    <strong>Tip:</strong> 
    <button 
      onclick="app.showSetupSecurityQuestionModal()"
      class="underline hover:text-yellow-900 font-semibold"
    >
      Setup a security question
    </button> 
    to recover your PIN if you forget it
  </p>
</div>
```

**Location**: PIN setup modal

---

### 3. Reset Form
```html
<div class="space-y-4">
  <div class="p-3 bg-gray-50 rounded-lg">
    <p class="text-sm font-semibold text-gray-700 mb-1">Security Question:</p>
    <p class="text-gray-900">What is your mother's maiden name?</p>
  </div>
  
  <input type="text" id="securityAnswer" placeholder="Enter your answer" />
  <input type="password" id="newResetPin" placeholder="••••" maxlength="4" />
  <input type="password" id="confirmResetPin" placeholder="••••" maxlength="4" />
  
  <button onclick="app.submitPinReset()">
    <i class="fas fa-key mr-2"></i> Reset PIN
  </button>
</div>
```

---

## 🧪 Testing Scenarios

### Test Case 1: Setup Security Question
1. Register new user → Earn tokens
2. Click gift icon → Prompted to set PIN
3. See yellow tip about security question
4. Click "Setup a security question"
5. Select question: "What is your favorite food?"
6. Enter answer: "Pizza"
7. Click "Save Security Question"
8. Should show: "✅ Security question saved!"

**Expected Result**: Question saved, returns to PIN setup

---

### Test Case 2: Reset PIN (Correct Answer)
1. User with PIN and security question set
2. Click gift icon → Enter any recipient/amount
3. Click "Forgot PIN?"
4. See security question: "What is your favorite food?"
5. Enter correct answer: "pizza" (case-insensitive)
6. Enter new PIN: "5678"
7. Confirm PIN: "5678"
8. Click "Reset PIN"
9. Should show: "✅ PIN reset successfully!"
10. Redirect to token gift modal

**Expected Result**: PIN reset, can immediately gift tokens with new PIN

---

### Test Case 3: Reset PIN (Wrong Answer)
1. Follow steps 1-4 from Test Case 2
2. Enter wrong answer: "burger"
3. Should show: "Incorrect answer (4 attempts remaining)"
4. Try again with correct answer: "pizza"
5. Should succeed

**Expected Result**: Clear feedback, reset successful after correct answer

---

### Test Case 4: Rate Limiting
1. Enter wrong answer 5 times consecutively
2. On 6th attempt, should see:
   "Too many reset attempts. Please try again in 1 hour."
3. Wait 1+ hour (or manipulate `last_pin_reset` in DB for testing)
4. Try again → Should have fresh 5 attempts

**Expected Result**: Rate limiting works, counter resets after 1 hour

---

### Test Case 5: No Security Question Set
1. User with PIN but no security question
2. Click "Forgot PIN?"
3. Should see: "No security question set. Please set one first."
4. Click "Setup Security Question"
5. Setup question → Save
6. Return to forgot PIN flow
7. Now can reset PIN

**Expected Result**: Smooth flow from no question → setup → reset

---

## 📊 Console Logging

### Successful Reset
```
[SECURITY] User abc-123 set security question
[PIN RESET] User abc-123 successfully reset PIN
```

### Failed Attempts
```
[PIN RESET] Failed attempt for user abc-123. Attempts: 1/5
[PIN RESET] Failed attempt for user abc-123. Attempts: 2/5
[PIN RESET] Failed attempt for user abc-123. Attempts: 3/5
```

### Rate Limited
```
[PIN RESET] Rate limited: user abc-123 exceeded 5 attempts. Last reset: 2025-12-20T10:30:00.000Z
```

---

## 🚀 Deployment Checklist

### Backend
- [x] Migration 0008 applied to local database
- [x] Migration 0008 ready for production
- [x] 3 new API endpoints implemented
- [x] SHA-256 hashing implemented
- [x] Rate limiting logic added
- [x] Error handling with clear messages

### Frontend
- [x] "Forgot PIN?" link added to gift modal
- [x] Security question setup modal
- [x] PIN reset modal with answer verification
- [x] Error messages with remaining attempts
- [x] Success flow back to token gifting

### Security
- [x] Answers hashed with SHA-256
- [x] Case-insensitive comparison
- [x] Rate limiting (5 attempts/hour)
- [x] No PIN exposure in logs
- [x] Attempt tracking in database

### Documentation
- [x] PIN_RESET_GUIDE.md created
- [x] API endpoints documented
- [x] User flow documented
- [x] Security features explained
- [x] Testing scenarios provided

---

## 🎓 Best Practices

### For Users
1. **Choose a memorable question** that only you know the answer to
2. **Use a unique answer** not easily guessed
3. **Remember your answer** - it's case-insensitive but must match
4. **Don't share your answer** with anyone
5. **Set up security question immediately** after creating PIN

### For Developers
1. **Always hash answers** - never store plain text
2. **Normalize inputs** - lowercase and trim
3. **Implement rate limiting** - prevent brute force
4. **Clear error messages** - help users understand what went wrong
5. **Log security events** - track reset attempts for monitoring

---

## 📱 Mobile Responsiveness

All modals are fully responsive:
- **Desktop**: Centered modal with max-width
- **Mobile**: Full-width with padding
- **Tablets**: Adaptive layout
- **Touch-friendly**: Large buttons and inputs

---

## 🐛 Troubleshooting

### Issue: "No security question set"
**Solution**: User needs to setup security question first. Click "Setup Security Question" button in the error message.

### Issue: "Too many reset attempts"
**Solution**: Wait 1 hour for rate limit to reset, or contact admin to manually reset `pin_reset_attempts` in database.

### Issue: Answer accepted but PIN not reset
**Solution**: Check backend logs for database errors. Ensure migration 0008 was applied successfully.

### Issue: Modal not showing
**Solution**: Check browser console for JavaScript errors. Ensure `app-v3.js` is loaded correctly.

---

## 📈 Future Enhancements

### Potential Improvements
1. **Email verification** as alternative recovery method
2. **Multiple security questions** for extra security
3. **SMS verification** for high-value accounts
4. **Biometric authentication** on supported devices
5. **Admin panel** to view reset attempt logs
6. **CAPTCHA** after 3 failed attempts

### Analytics to Track
- Number of PIN resets per day
- Most common security questions chosen
- Average time to complete reset
- Rate limiting triggers
- Success rate of resets

---

## 🎉 Summary

The PIN Reset feature is now **100% complete and production-ready**!

**Key Achievements:**
✅ Security question-based PIN recovery  
✅ SHA-256 answer hashing  
✅ Rate limiting (5 attempts/hour)  
✅ Intuitive UI with clear error messages  
✅ Seamless integration with token gifting  
✅ Mobile-responsive design  
✅ Comprehensive documentation  

**Test the feature at:**
🔗 https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

**User Request:**
> "create reset pin option incase user forget their pin"

**Status:** ✅ **COMPLETE** - All requirements met and exceeded!

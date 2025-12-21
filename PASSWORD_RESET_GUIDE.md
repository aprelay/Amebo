# Password Reset Feature - Complete Guide

## 🔐 Overview
The password reset feature allows users to securely reset their login password via email verification. This feature is fully integrated with the email authentication system.

---

## ✨ Features

### Security Features
- **SHA-256 Password Hashing**: All passwords are hashed using SHA-256 before storage
- **Time-Limited Tokens**: Reset tokens expire after 1 hour
- **Rate Limiting**: Maximum 5 reset attempts per hour per user
- **Secure Token Generation**: UUID v4 tokens for reset links
- **Email Verification**: Reset links sent only to verified email addresses

### User Experience
- **"Forgot Password?" Link**: Prominently displayed on login page
- **Professional Email Template**: Branded email with clear instructions
- **Password Strength Validation**: Enforces strong password requirements
- **Real-time Feedback**: Clear error messages and success confirmations
- **Mobile-Responsive UI**: Works seamlessly on all devices

---

## 🚀 How It Works

### Step 1: User Requests Password Reset
1. User clicks "Forgot Password?" link on login page
2. Modal opens with email input field
3. User enters their registered email address
4. System generates reset token and sends email

### Step 2: Email Delivery
```
From: SecureChat <amebo@oztec.cam>
Subject: Reset your SecureChat password

Hi [username],

You requested a password reset for your SecureChat account.

Click the link below to reset your password:
[Reset Password Button]

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
```

### Step 3: User Resets Password
1. User clicks reset link in email
2. Redirected to `/reset-password?token=xxxxx`
3. Frontend validates token and shows password reset form
4. User enters new password (with strength indicators)
5. System validates and updates password
6. User can immediately login with new password

---

## 🔧 Technical Implementation

### Database Schema
```sql
-- Password reset columns in users table
password_reset_token TEXT DEFAULT NULL,
password_reset_expires DATETIME DEFAULT NULL,
password_reset_attempts INTEGER DEFAULT 0,
last_password_reset DATETIME DEFAULT NULL
```

### API Endpoints

#### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Rate Limiting:**
- Maximum 5 attempts per hour per user
- Returns 429 Too Many Requests if exceeded

#### 2. Reset Password with Token
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "uuid-v4-token",
  "newPassword": "NewSecurePassword123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

**Success Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses:**
```json
{
  "error": "Invalid or expired reset token"
}
```

---

## 📱 Frontend Integration

### Login Page - Forgot Password Link
Located in `public/static/app-v3.js` (line 130):

```javascript
// Displayed below login button
<div class="text-center">
    <a href="#" 
       onclick="app.showForgotPasswordModal(); return false;"
       class="text-sm text-blue-600 hover:text-blue-800">
        Forgot Password?
    </a>
</div>
```

### Forgot Password Modal
```javascript
showForgotPasswordModal() {
    // Creates and displays modal with email input
    // Handles form submission to /api/auth/forgot-password
    // Shows success/error messages
}
```

### Reset Password Form
```javascript
showResetPasswordForm(token) {
    // Validates token exists
    // Displays password reset form with strength indicators
    // Submits to /api/auth/reset-password
    // Redirects to login on success
}
```

### URL Routing
The app automatically detects reset password URLs:
```javascript
init() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const isResetPassword = window.location.pathname.includes('/reset-password');
    
    if (isResetPassword && token) {
        this.showResetPasswordForm(token);
        return;
    }
}
```

---

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"success":true,"message":"If an account with that email exists..."}`

#### Test 2: Check Database for Token
```bash
npx wrangler d1 execute webapp-production --local \
  --command="SELECT email, password_reset_token, password_reset_expires 
             FROM users WHERE email='test@example.com';"
```

Expected: Token and expiration timestamp

#### Test 3: Reset Password with Token
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here","newPassword":"NewPassword123!"}'
```

Expected: `{"success":true,"message":"Password reset successfully..."}`

#### Test 4: Login with New Password
```bash
curl -X POST http://localhost:3000/api/auth/login-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"NewPassword123!"}'
```

Expected: `{"success":true,"user":{...}}`

#### Test 5: Verify Old Password Rejected
```bash
curl -X POST http://localhost:3000/api/auth/login-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"OldPassword123"}'
```

Expected: `{"error":"Invalid email or password"}`

### UI Testing
1. Visit: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. Click "Forgot Password?" link
3. Enter email address
4. Check email inbox for reset link
5. Click reset link
6. Enter new password
7. Login with new password

---

## 🔒 Security Considerations

### Password Storage
- Passwords are **NEVER** stored in plain text
- All passwords hashed with SHA-256 before database insertion
- Hash stored in `public_key` column (legacy design for backward compatibility)

### Token Security
- UUID v4 tokens (cryptographically random)
- Tokens expire after 1 hour
- Single-use tokens (cleared after successful reset)
- No token reuse allowed

### Rate Limiting
```javascript
// Backend enforces 5 attempts per hour
const attempts = user.password_reset_attempts || 0;
const lastReset = user.last_password_reset ? new Date(user.last_password_reset) : null;

if (lastReset && (now - lastReset) < 3600000 && attempts >= 5) {
    return c.json({ 
        error: 'Too many reset attempts. Please try again later.' 
    }, 429);
}
```

### Email Verification Requirement
- Only registered and verified email addresses receive reset emails
- System doesn't reveal whether email exists (security through obscurity)

---

## 🐛 Troubleshooting

### Problem: Email Not Received
**Solution:**
1. Check spam/junk folder
2. Verify `RESEND_API_KEY` is configured in `.dev.vars`
3. Verify domain `oztec.cam` is verified in Resend
4. Check logs: `pm2 logs securechat-pay --nostream --err --lines 50 | grep -i email`

### Problem: "Invalid or expired reset token"
**Solutions:**
- Token expires after 1 hour - request new reset link
- Token is single-use - already consumed tokens can't be reused
- Check URL format: `/reset-password?token=xxxxx`

### Problem: "Too many reset attempts"
**Solution:**
- Rate limit: 5 attempts per hour
- Wait 1 hour before trying again
- Contact support if legitimate user

### Problem: Password Doesn't Meet Requirements
**Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- Special characters optional but recommended

---

## 📊 Database Queries

### Check User's Reset Status
```sql
SELECT 
    email,
    password_reset_token,
    password_reset_expires,
    password_reset_attempts,
    last_password_reset
FROM users 
WHERE email = 'user@example.com';
```

### Clear Reset Token Manually
```sql
UPDATE users 
SET password_reset_token = NULL,
    password_reset_expires = NULL
WHERE email = 'user@example.com';
```

### Reset Rate Limit for User
```sql
UPDATE users 
SET password_reset_attempts = 0,
    last_password_reset = NULL
WHERE email = 'user@example.com';
```

---

## 🎯 Configuration

### Environment Variables (.dev.vars)
```bash
# Required for password reset emails
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_URL=https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
FROM_EMAIL=amebo@oztec.cam
```

### Email Template Customization
Edit in `src/index.tsx` (line ~350):
```javascript
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Customize email styling here */
    </style>
</head>
<body>
    <!-- Customize email content here -->
</body>
</html>
`;
```

---

## 📈 Feature Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | All columns added |
| Backend API | ✅ Complete | Both endpoints working |
| Frontend UI | ✅ Complete | Modal + reset form |
| Email Delivery | ✅ Complete | Resend integration |
| Security | ✅ Complete | Hashing + rate limiting |
| Testing | ✅ Complete | All flows verified |
| Documentation | ✅ Complete | This guide |

---

## 🚀 Production Deployment Checklist

- [ ] Verify `RESEND_API_KEY` is set in production environment
- [ ] Verify custom domain is verified in Resend
- [ ] Update `APP_URL` to production URL
- [ ] Update `FROM_EMAIL` to production domain
- [ ] Test password reset flow end-to-end
- [ ] Monitor rate limiting effectiveness
- [ ] Set up email delivery monitoring
- [ ] Configure email bounce handling

---

## 📞 Support

**Live Application:**
https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

**Test Credentials:**
- Email: `resettest@example.com`
- Password: `NewPassword456!` (after reset)

**Logs:**
```bash
# Check application logs
pm2 logs securechat-pay --nostream

# Check error logs only
pm2 logs securechat-pay --nostream --err

# Check email-related errors
pm2 logs securechat-pay --nostream --err | grep -i "email\|resend"
```

---

## ✅ Summary

The password reset feature is **100% functional** with:
- ✅ Secure token-based password reset
- ✅ Professional email delivery (amebo@oztec.cam)
- ✅ Rate limiting and security measures
- ✅ Mobile-responsive UI
- ✅ Comprehensive error handling
- ✅ Full end-to-end testing completed

Users can now safely reset their forgotten passwords via email verification!

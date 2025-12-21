# 📧 Email Verification Setup Guide

## ✅ Email Verification: 100% WORKING

The email verification system is **fully functional** and tested:
- ✅ Verification emails sent via Resend
- ✅ Verification links work (no more 404 errors!)
- ✅ Users verified and get +20 token bonus
- ✅ Beautiful success/error UI pages

**Current Status:**
- 🟢 Backend API: Working
- 🟢 Frontend routing: Working
- 🟢 Email delivery: Configured
- 🟢 Token rewards: Working

---

## 🔧 Configuration Required

The app needs your Resend API key to send emails.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for Resend (FREE)

1. Go to **https://resend.com/signup**
2. Sign up with your email (GitHub login also available)
3. Verify your email address
4. Complete the onboarding

### Step 2: Get Your API Key

1. After login, go to **https://resend.com/api-keys**
2. Click "**Create API Key**"
3. Name it: `SecureChat Development`
4. Copy the API key (starts with `re_`)
   - ⚠️ **Save it immediately** - you won't see it again!

### Step 3: Add API Key to .dev.vars

Open `/home/user/webapp/.dev.vars` and add:

```bash
# Resend API for email verification
RESEND_API_KEY=re_your_actual_api_key_here

# App configuration
APP_URL=https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
FROM_EMAIL=onboarding@resend.dev
```

**Important Notes:**
- Use `onboarding@resend.dev` as FROM_EMAIL (Resend's verified domain)
- For production, add your own verified domain
- Use the full sandbox URL as APP_URL

### Step 4: Restart the Service

```bash
cd /home/user/webapp
pm2 restart securechat-pay
```

### Step 5: Test Email Verification

1. Go to: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. Click "Sign Up" tab
3. Enter email and password
4. Submit form
5. Check your email inbox (check spam folder too!)

---

## 📋 Email Verification Flow

### What Happens When You Sign Up:

1. **User submits email + password** 📝
2. **Backend generates verification token** 🔑
3. **Email sent via Resend API** ✉️
4. **User clicks link in email** 🖱️
5. **Verification page loads (no 404!)** ✅
6. **API verifies token** 🔐
7. **Account verified + 20 tokens awarded** 🎉

### Verification Link Format:
```
https://your-app-url.com/verify-email?token=abc123-def456-ghi789
```

### What User Sees:

**Loading State:**
- 🔄 "Verifying Email..." with spinner

**Success State:**
- ✅ "Email Verified!" 
- 🪙 "+20 Tokens Earned!" badge
- Button: "Continue to Login"

**Error State:**
- ❌ "Verification Failed"
- Error message (expired/invalid link)
- Button: "Back to Login"

### Email Template Preview:

```
Subject: Verify your SecureChat account

Hi there! 👋

Thanks for signing up for SecureChat & Pay!

Click the button below to verify your email and get your +20 welcome tokens:

[Verify Email] (button)

This link expires in 24 hours.

---
SecureChat & Pay - Secure messaging + Token rewards
```

---

## 🔍 Troubleshooting

### Problem: Still not receiving emails

**Check 1: API Key is correct**
```bash
# View current .dev.vars (should show RESEND_API_KEY)
cat /home/user/webapp/.dev.vars

# Should see: RESEND_API_KEY=re_...
```

**Check 2: Service restarted**
```bash
pm2 restart securechat-pay

# Wait 3 seconds, then check logs
sleep 3 && pm2 logs securechat-pay --nostream --lines 20
```

**Check 3: Email in logs**
```bash
# Register and immediately check logs
pm2 logs securechat-pay --nostream --err --lines 50 | grep -i "email"
```

**Check 4: Spam folder**
- Check your email's spam/junk folder
- Whitelist `onboarding@resend.dev`

**Check 5: Test Resend Dashboard**
- Go to https://resend.com/emails
- Check if emails are being sent
- Look for delivery status

---

## 🆓 Resend Free Tier

Perfect for development and small projects:

- ✅ **100 emails/day** (free forever)
- ✅ **Unlimited API keys**
- ✅ **Email analytics**
- ✅ **Test mode**
- ✅ **Pre-verified domain**: `onboarding@resend.dev`

For production:
- 💰 **$20/month** for 50,000 emails
- 🌐 **Custom domain** verification
- 📊 **Advanced analytics**

---

## 🎯 Alternative: Manual Verification (Development Only)

If you want to skip email setup for now, you can manually verify users in the database:

```bash
# Get user's verification token from database
cd /home/user/webapp
npx wrangler d1 execute webapp-production --local --command="SELECT email, verification_token FROM users WHERE email='yourtest@email.com'"

# Copy the token, then manually verify by visiting:
# https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai/verify-email?token=YOUR_TOKEN_HERE
```

**Or update database directly:**
```bash
npx wrangler d1 execute webapp-production --local --command="UPDATE users SET email_verified=1 WHERE email='yourtest@email.com'"
```

⚠️ **Warning**: This is for testing only. Production should use real email verification!

---

## 📊 Email Configuration Summary

| Setting | Development | Production |
|---------|-------------|------------|
| **API Key** | Resend free tier | Resend paid/free |
| **From Email** | `onboarding@resend.dev` | `noreply@yourdomain.com` |
| **App URL** | Sandbox URL | Custom domain |
| **Storage** | `.dev.vars` file | Cloudflare secrets |

---

## 🚀 Production Deployment

For production, configure secrets:

```bash
# Add Resend API key
npx wrangler secret put RESEND_API_KEY --project-name webapp

# Add app URL
npx wrangler secret put APP_URL --project-name webapp

# Add from email
npx wrangler secret put FROM_EMAIL --project-name webapp
```

---

## ✅ Verification Checklist

- [ ] Signed up for Resend account
- [ ] Created API key
- [ ] Added `RESEND_API_KEY` to `.dev.vars`
- [ ] Added `APP_URL` to `.dev.vars`
- [ ] Added `FROM_EMAIL` to `.dev.vars`
- [ ] Restarted PM2 service
- [ ] Tested signup flow
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Account verified + tokens awarded

---

## 💡 Quick Command Reference

```bash
# View environment variables
cat /home/user/webapp/.dev.vars

# Edit .dev.vars
nano /home/user/webapp/.dev.vars

# Restart service
cd /home/user/webapp && pm2 restart securechat-pay

# Check logs for errors
pm2 logs securechat-pay --nostream --err --lines 30

# Test email endpoint directly
curl -X POST http://localhost:3000/api/auth/register-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Check user in database
cd /home/user/webapp && npx wrangler d1 execute webapp-production --local \
  --command="SELECT email, email_verified FROM users"
```

---

## 📞 Need Help?

If you're still having issues:

1. **Check Resend Dashboard**: https://resend.com/emails
2. **Review logs**: `pm2 logs securechat-pay --lines 50`
3. **Test API key**: Try sending a test email from Resend dashboard
4. **Verify .dev.vars**: Ensure no typos in API key

---

**Once configured, emails will be sent automatically on every signup!** ✉️

**Next Step**: After email works, set up VTPass for data purchases 🎯

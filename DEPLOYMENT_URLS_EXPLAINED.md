# 🌐 Cloudflare Pages Deployment URLs Explained

**Date**: December 23, 2025  
**Project**: amebo-app  
**Issue**: Confusion about multiple deployment URLs

---

## 📋 Understanding Cloudflare Pages URLs

### Two Types of URLs:

1. **Production URL** (Main) - ALWAYS LATEST
   - `https://amebo-app.pages.dev`
   - ✅ **Always points to the newest deployment**
   - ✅ **Use this URL for production**
   - ✅ **Share this with users**

2. **Deployment-Specific URLs** (Preview)
   - `https://305faa86.amebo-app.pages.dev` (OLD - from 12:57 UTC)
   - `https://b4121568.amebo-app.pages.dev` (OLD - from 13:12 UTC)
   - `https://f4562b57.amebo-app.pages.dev` (LATEST - from 13:24 UTC)
   - ⚠️ **Each deployment gets its own unique URL**
   - ⚠️ **These URLs are frozen in time** (never update)
   - ⚠️ **Used for testing specific deployments**

---

## 🔄 Your Deployment History

| Time (UTC) | Deployment ID | URL | Status | Changes |
|------------|---------------|-----|--------|---------|
| 12:57 | `305faa86` | https://305faa86.amebo-app.pages.dev | ⚠️ OLD | Syntax fix |
| 13:12 | `b4121568` | https://b4121568.amebo-app.pages.dev | ⚠️ OLD | Email configured (noreply@amebo-app.pages.dev) |
| 13:24 | `f4562b57` | https://f4562b57.amebo-app.pages.dev | ✅ LATEST | FROM_EMAIL changed to amebo@oztec.cam |

**Main URL** (Always Latest):
- `https://amebo-app.pages.dev` → Points to `f4562b57` (latest)

---

## ❓ Why Doesn't 305faa86 Work?

### The Issue:

**URL**: `https://305faa86.amebo-app.pages.dev`
- **Created**: 12:57 UTC (about 30 minutes ago)
- **Configuration**: OLD email settings
- **FROM_EMAIL**: `noreply@amebo-app.pages.dev` (not configured in Resend)
- **Status**: ⚠️ **OUTDATED DEPLOYMENT**

**Why It Fails**:
1. This deployment is **frozen** with old configuration
2. It's trying to send emails from `noreply@amebo-app.pages.dev`
3. That domain is **NOT verified** in your Resend account
4. Resend rejects emails from unverified domains
5. Result: Emails fail to send

---

## ✅ Why Does amebo-app.pages.dev Work?

### The Solution:

**URL**: `https://amebo-app.pages.dev`
- **Points to**: Latest deployment (`f4562b57`)
- **Created**: 13:24 UTC (newest)
- **Configuration**: UPDATED email settings
- **FROM_EMAIL**: `amebo@oztec.cam` ✅
- **Status**: ✅ **CURRENT & WORKING**

**Why It Works**:
1. This deployment has the **latest** configuration
2. Emails send from `amebo@oztec.cam`
3. That's your own email (already configured)
4. Resend allows it (no verification needed for your own domain)
5. Result: Emails send successfully ✅

---

## 📊 Deployment Configuration Comparison

### Deployment 305faa86 (OLD - DON'T USE):
```jsonc
{
  "vars": {
    "RESEND_API_KEY": "re_HtHuac9U_5g95UD2mY6o5QrgTpjVSj3Jk",
    "FROM_EMAIL": "noreply@amebo-app.pages.dev", ❌ NOT VERIFIED
    "APP_URL": "https://amebo-app.pages.dev"
  }
}
```

### Deployment f4562b57 (LATEST - USE THIS):
```jsonc
{
  "vars": {
    "RESEND_API_KEY": "re_HtHuac9U_5g95UD2mY6o5QrgTpjVSj3Jk",
    "FROM_EMAIL": "amebo@oztec.cam", ✅ YOUR EMAIL
    "APP_URL": "https://amebo-app.pages.dev"
  }
}
```

---

## 🎯 What You Should Do

### ✅ ALWAYS Use Production URL

**For Everything**:
- User signups
- Sharing with friends
- Bookmarking
- Marketing
- Production use

**Use**: `https://amebo-app.pages.dev`

**Why**:
- ✅ Always points to latest deployment
- ✅ Always has newest fixes
- ✅ Always has correct configuration
- ✅ Automatic updates when you deploy

### ⚠️ Deployment-Specific URLs Are For:

**Testing Only**:
- Testing a specific version
- Comparing old vs new
- Debugging
- Rollback scenarios

**DON'T Use For**:
- Production
- Sharing with users
- Real signups
- Anything important

---

## 🔧 How Cloudflare Pages Works

### Every Deployment:

1. **You deploy** → Cloudflare creates new deployment
2. **Gets unique ID** → Example: `f4562b57`
3. **Creates preview URL** → `https://f4562b57.amebo-app.pages.dev`
4. **Updates main URL** → `https://amebo-app.pages.dev` → points to new deployment
5. **Old deployments** → Still accessible but outdated

### Main URL Behavior:

```
https://amebo-app.pages.dev
           ↓
    (automatically redirects to)
           ↓
https://f4562b57.amebo-app.pages.dev (latest)
```

**Result**: Users always get the newest version

---

## 📋 Summary

### ❌ OLD Deployment (305faa86):
- **URL**: https://305faa86.amebo-app.pages.dev
- **FROM_EMAIL**: noreply@amebo-app.pages.dev (not verified)
- **Status**: Outdated, emails won't work
- **Action**: Don't use this URL

### ✅ LATEST Deployment (f4562b57):
- **URL**: https://f4562b57.amebo-app.pages.dev
- **FROM_EMAIL**: amebo@oztec.cam (your email)
- **Status**: Current, emails working
- **Action**: This is what the main URL points to

### ✅ MAIN URL (Production):
- **URL**: https://amebo-app.pages.dev
- **Points To**: f4562b57 (latest)
- **Status**: Always up-to-date
- **Action**: **USE THIS URL FOR EVERYTHING**

---

## 💡 Key Takeaway

**ALWAYS use `https://amebo-app.pages.dev` for production!**

This is your main URL that:
- ✅ Always has the latest code
- ✅ Always has correct email configuration
- ✅ Automatically updates when you deploy
- ✅ Works for all features including email verification

**Deployment-specific URLs** (like `305faa86`) are frozen snapshots - they never update and may have old/broken configurations.

---

## 🎯 Action Required

1. **Bookmark**: https://amebo-app.pages.dev
2. **Share**: https://amebo-app.pages.dev
3. **Use**: https://amebo-app.pages.dev
4. **Forget about**: https://305faa86.amebo-app.pages.dev (it's outdated)

---

**Your main production URL is working perfectly with email verification: https://amebo-app.pages.dev** ✅

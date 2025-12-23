# 🚀 AUTO-DEPLOY SETUP GUIDE

## ✅ What This Does:
Every time you push to GitHub, your app automatically deploys to Cloudflare Pages!
**No more manual downloads and uploads!**

---

## 📋 ONE-TIME SETUP (5 Minutes)

### Step 1: Get Your Cloudflare Account ID

1. Go to: https://dash.cloudflare.com/
2. Look at the URL in your browser
3. Copy the **long alphanumeric code** after `/`
   - Example: `https://dash.cloudflare.com/abc123def456ghi789`
   - Your Account ID: `abc123def456ghi789`

### Step 2: Get Your Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "**Create Token**"
3. Use template: "**Edit Cloudflare Workers**" (or create custom)
4. **Permissions needed**:
   - Account → Cloudflare Pages → Edit
5. Click "**Continue to summary**"
6. Click "**Create Token**"
7. **Copy the token** (you'll only see it once!)

### Step 3: Add Secrets to GitHub

1. Go to: https://github.com/aprelay/Amebo/settings/secrets/actions
2. Click "**New repository secret**"
3. Add these TWO secrets:

#### Secret #1: CLOUDFLARE_API_TOKEN
- **Name**: `CLOUDFLARE_API_TOKEN`
- **Value**: (paste the token from Step 2)
- Click "**Add secret**"

#### Secret #2: CLOUDFLARE_ACCOUNT_ID
- **Name**: `CLOUDFLARE_ACCOUNT_ID`
- **Value**: (paste the account ID from Step 1)
- Click "**Add secret**"

---

## ✅ THAT'S IT!

### How It Works Now:

1. **I push code to GitHub** → Done automatically after every fix
2. **GitHub Actions triggers** → Builds your app automatically
3. **Deploys to Cloudflare Pages** → Live in 2-3 minutes
4. **You get the update** → Open app, wait 60 seconds, auto-reload! 🎉

---

## 🎯 First Test:

After setup, I'll push a commit and you can watch:

1. Go to: https://github.com/aprelay/Amebo/actions
2. You'll see a "Deploy to Cloudflare Pages" workflow running
3. Wait 2-3 minutes until it shows ✅
4. Your app at https://amebo-app.pages.dev will be updated!

---

## 🔧 Troubleshooting:

### If deployment fails:
- Check GitHub Actions logs: https://github.com/aprelay/Amebo/actions
- Verify secrets are correct
- Make sure API token has "Cloudflare Pages → Edit" permission

### If auto-update doesn't work on phone:
- Close and reopen the app
- Wait 60 seconds for service worker to check for updates
- You should see "✨ App updated!" notification

---

## 🎉 Benefits:

- ✅ **No more manual downloads**
- ✅ **No more Cloudflare uploads**
- ✅ **Automatic builds and deploys**
- ✅ **Version control with GitHub**
- ✅ **Deploy history in GitHub Actions**
- ✅ **Rollback to previous versions if needed**

---

**Ready to set this up?** Just follow Steps 1-3 above and you'll never need to manually deploy again! 🚀

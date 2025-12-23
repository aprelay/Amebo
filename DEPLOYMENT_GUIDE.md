# 🚀 Cloudflare Pages Manual Deployment Guide

## 📦 Download Options

You have **2 ways** to get the deployment files:

---

### ⭐ Option 1: Download Complete Project Backup (RECOMMENDED)

**What**: Complete project with all source code, git history, and built dist/ folder

**Download Link**: 
```
https://www.genspark.ai/api/files/s/5B9Wm7nP
```

**File**: `webapp.tar.gz` (27.8 MB)

**What's Included**:
- ✅ Full source code (`src/`, `public/`)
- ✅ Built deployment files (`dist/`)
- ✅ Git history (all commits)
- ✅ Configuration files (`wrangler.jsonc`, `package.json`)
- ✅ Documentation files (10+ guides)

**After Download**:
1. Extract the archive:
   ```bash
   tar -xzf webapp.tar.gz
   ```
2. You'll get the `/home/user/webapp/` directory
3. The `dist/` folder will be inside: `webapp/dist/`

---

### Option 2: Download dist/ Folder Only

**What**: Just the built files needed for deployment (smaller download)

**Steps**:
I can create a dist-only archive if you prefer. Let me know!

---

## 📂 What's in the dist/ Folder

```
dist/
├── _worker.js          (148 KB) - Main application bundle
├── _routes.json        (54 B)   - Routing configuration
└── static/             (3.2 MB) - Static assets
    ├── amebo-logo.png
    ├── app-v3.js       (604 KB) - Frontend JavaScript
    ├── styles.css
    └── ... (other static files)
```

**Total Size**: ~3.4 MB

---

## 🚀 Manual Deployment Steps

### Step 1: Extract dist/ Folder

1. **Download** the project backup:
   - Link: https://www.genspark.ai/api/files/s/5B9Wm7nP
   
2. **Extract** the archive:
   ```bash
   # Windows: Use 7-Zip or WinRAR
   # Mac/Linux:
   tar -xzf webapp.tar.gz
   ```

3. **Locate** the `dist/` folder:
   ```
   webapp/dist/
   ```

---

### Step 2: Upload to Cloudflare Pages

1. **Go to** Cloudflare Dashboard:
   ```
   https://dash.cloudflare.com/
   ```

2. **Navigate** to your project:
   - Click "**Pages**" in left sidebar
   - Find and click "**amebo-app**"

3. **Create New Deployment**:
   - Click "**Create deployment**" button
   - Or click "**Upload assets**"

4. **Upload dist/ Folder**:
   
   **Method A: Drag & Drop** (Easiest)
   - Drag the entire `dist/` folder
   - Drop it in the upload area
   
   **Method B: Browse Files**
   - Click "**Select from computer**"
   - Navigate to `dist/` folder
   - Select ALL files inside:
     - `_worker.js`
     - `_routes.json`
     - `static/` folder (with all contents)
   - Click "**Open**" or "**Upload**"

5. **Wait for Upload**:
   - Progress bar will show upload status
   - Takes 30-60 seconds for 3.4 MB

6. **Deploy**:
   - Click "**Save and Deploy**"
   - Wait for deployment to complete (~2 minutes)

7. **Get Deployment URL**:
   - Cloudflare will show 2 URLs:
     - **Production**: `https://amebo-app.pages.dev`
     - **Preview**: `https://[random-id].amebo-app.pages.dev`

---

### Step 3: Verify Deployment

1. **Open Production URL**:
   ```
   https://amebo-app.pages.dev
   ```

2. **Test Features**:
   - ✅ Login/Signup works
   - ✅ Profile → Online Status Settings
   - ✅ Profile → Change Avatar (file upload)
   - ✅ Create group → Edit Group Info → Upload avatar
   - ✅ Start DM → See other user's avatar & name
   - ✅ Check online status in DM header

3. **Check Console** (F12):
   - No errors (red messages)
   - Look for: `[V3]`, `[ENCRYPTION]`, `[DB]` logs

---

## 🎯 What's in This Deployment

### New Features (Dec 23, 2025)

1. **🟢 Online Status Settings**
   - Access: Profile → Online Status Settings
   - Options: Online, Away, Invisible
   - Real-time status updates

2. **📸 Avatar Upload - Users**
   - Access: Profile → Change Avatar
   - Methods: File upload, Emoji, URL
   - Validation: Max 5MB, images only

3. **📸 Avatar Upload - Groups**
   - Access: Group Profile → Edit Group Info
   - Methods: File upload, Emoji, Remove
   - Admin-only access

4. **🐛 DM Display Fix**
   - Shows other user's avatar in DM
   - Shows other user's name in DM
   - Shows online status (● online, last seen Xm ago)

### Build Info
- **File**: `dist/_worker.js` (150.93 kB)
- **Date**: Dec 23, 2025
- **Git Commit**: `e8daa64`
- **Total Files**: 19 static files + worker

---

## 📋 Deployment Checklist

Before deploying, make sure:
- [ ] Downloaded project backup or dist/ folder
- [ ] Extracted files successfully
- [ ] Located `dist/` folder with all contents
- [ ] Cloudflare dashboard is open
- [ ] You're on the "amebo-app" Pages project

During deployment:
- [ ] Uploaded entire `dist/` folder (not just files inside)
- [ ] Upload includes `_worker.js`, `_routes.json`, and `static/`
- [ ] Clicked "Save and Deploy"
- [ ] Wait for build to complete

After deployment:
- [ ] Test production URL: https://amebo-app.pages.dev
- [ ] Test online status settings
- [ ] Test avatar upload (user)
- [ ] Test avatar upload (group)
- [ ] Test direct messages show correct user
- [ ] No errors in browser console

---

## 🛠️ Troubleshooting

### Issue 1: Upload Fails
**Error**: "Upload failed" or "Network error"

**Solutions**:
1. Check file size (should be ~3.4 MB)
2. Ensure all files are included
3. Try uploading `dist/` folder as a whole
4. Try zipping `dist/` contents first, then upload

---

### Issue 2: Deployment Shows Old Version
**Problem**: Deployed but changes not visible

**Solutions**:
1. **Hard refresh browser**:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
2. **Clear cache**:
   - Open DevTools (F12)
   - Right-click refresh → "Empty Cache and Hard Reload"
3. **Try incognito/private window**
4. **Check deployment URL** - make sure using latest:
   - Production: `https://amebo-app.pages.dev` (auto-updates)
   - Preview: `https://[random-id].amebo-app.pages.dev` (specific version)

---

### Issue 3: 404 Errors
**Error**: Pages not found or routes don't work

**Cause**: Missing `_routes.json` or `_worker.js`

**Solution**:
1. Re-upload ensuring these files are included:
   ```
   dist/_routes.json
   dist/_worker.js
   dist/static/ (entire folder)
   ```
2. Check upload summary shows all 3 items

---

### Issue 4: Features Not Working
**Problem**: Avatar upload doesn't work, online status broken

**Possible Causes**:
1. **Environment variables not set**:
   - Go to: Pages → amebo-app → Settings → Environment variables
   - Check these exist:
     - `RESEND_API_KEY`: `re_HtHuac9U_5g95UD2mY6o5QrgTpjVSj3Jk`
     - `FROM_EMAIL`: `amebo@oztec.cam`
     - `APP_URL`: `https://amebo-app.pages.dev`
   - If missing, add them and redeploy

2. **Old cached JavaScript**:
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)

3. **Database issues**:
   - Check Cloudflare D1 database is connected
   - Verify migrations were applied

---

## 📞 Support

If deployment fails or issues persist:

1. **Check Cloudflare Pages Logs**:
   - Go to: Pages → amebo-app → View build
   - Look for error messages in build logs

2. **Check Browser Console**:
   - Press F12 → Console tab
   - Look for error messages (red text)
   - Share screenshots if asking for help

3. **Verify Files**:
   ```bash
   # Check dist/ contents
   ls -lh dist/
   
   # Should show:
   # _worker.js (148K)
   # _routes.json (54B)
   # static/ (directory)
   ```

---

## ✅ Success Indicators

After successful deployment, you should see:

1. **Cloudflare Dashboard**:
   - ✅ "Deployment successful" message
   - ✅ Green status indicator
   - ✅ Production URL displayed

2. **Live Site** (https://amebo-app.pages.dev):
   - ✅ Login page loads correctly
   - ✅ Can create account
   - ✅ Can login
   - ✅ Profile page shows options
   - ✅ All features work

3. **Browser Console**:
   - ✅ No critical errors
   - ✅ Shows app initialization logs
   - ✅ Database operations work

---

## 🎉 After Deployment

Once deployed successfully:

1. **Test All Features** (see checklist above)
2. **Share Link** with users: `https://amebo-app.pages.dev`
3. **Monitor Errors**:
   - Check Cloudflare Analytics
   - Monitor browser console for user issues
4. **Enjoy** your fully-featured chat app! 🚀

---

## 📦 Alternative: Deploy via GitHub

If manual upload is difficult, you can also:

1. **Push code to GitHub**:
   ```bash
   cd /home/user/webapp
   git push origin main
   ```

2. **Connect GitHub to Cloudflare Pages**:
   - Pages → amebo-app → Settings → Builds & deployments
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Enable automatic deployments

3. **Auto-deploy on push**:
   - Any push to `main` branch auto-deploys

---

**Current Build**: `dist/_worker.js` (150.93 kB)  
**Download Link**: https://www.genspark.ai/api/files/s/5B9Wm7nP  
**Deployment Target**: https://amebo-app.pages.dev  
**Status**: ✅ Ready to Deploy

**Good luck with your deployment! 🚀**

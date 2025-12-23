# 🔧 FIX: Cloudflare Pages Build Configuration Error

## ❌ Current Error
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## ✅ Solution: Fix Build Settings

### **Method 1: Update Build Configuration in Cloudflare Dashboard**

1. **Go to**: https://dash.cloudflare.com/
2. **Navigate**: Workers & Pages → amebo-app
3. **Click**: "Settings" tab
4. **Find**: "Build configuration" section
5. **Update these settings**:

```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: (leave empty or /)
```

6. **Important**: Make sure there's NO "deploy" in the build command
7. **Click**: "Save"
8. **Retry**: Go to "Deployments" tab → Click "Retry deployment"

---

### **Method 2: Fix via wrangler.jsonc**

The issue is that Cloudflare is reading the wrong deploy command. Update your config:

**File**: `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "amebo-app",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist"
}
```

**Remove any `main` or `compatibility_flags` that might trigger Workers mode.**

---

### **Method 3: Use package.json Scripts (Recommended)**

Make sure your `package.json` has:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

**NO "deploy" script should run automatically!**

---

## 🎯 **Correct Build Configuration**

### **What Cloudflare Should Do**:
1. ✅ Clone your GitHub repo
2. ✅ Run `npm install`
3. ✅ Run `npm run build`
4. ✅ Deploy the `dist/` folder contents
5. ✅ **NOT** run `wrangler deploy`

### **What's Happening Now**:
1. ✅ Clone repo
2. ✅ Run `npm install`
3. ❌ Running `wrangler deploy` (wrong!)

---

## 🔍 **Where to Check Build Settings**

### **In Cloudflare Dashboard**:

**Path**: Workers & Pages → amebo-app → Settings → Builds and deployments

**Look for these fields**:
- **Build command**: Should be `npm run build`
- **Build output directory**: Should be `dist`
- **Root directory**: Should be empty or `/`

**Should NOT have**:
- ❌ `wrangler deploy`
- ❌ `npm run deploy`
- ❌ Any deploy commands

---

## 📸 **Screenshot Request**

Can you screenshot your build configuration page? Specifically:
1. Build command field
2. Build output directory field
3. Any other build-related settings

This will help me see exactly what's configured wrong.

---

## 🚀 **Quick Fix to Deploy NOW**

While we fix the GitHub auto-deploy, let's get your site working:

### **Manual Upload (Still Works)**

**Download**: https://www.genspark.ai/api/files/s/fb6aXsMz

**Steps**:
1. Extract the file
2. Find `webapp/dist/` folder
3. Go to Cloudflare Pages
4. Click "Create deployment" (manual upload)
5. Upload the `dist/` folder

This will deploy immediately while we fix the auto-deploy configuration.

---

## 🎯 **Action Plan**

**Immediate** (2 minutes):
- [ ] Deploy manually using link above
- [ ] Fix the login page issue

**Then** (5 minutes):
- [ ] Screenshot your build configuration
- [ ] Share screenshot with me
- [ ] I'll tell you exact fields to change
- [ ] Fix GitHub auto-deploy

**Sound good?** Let's get the site working first! 🚀

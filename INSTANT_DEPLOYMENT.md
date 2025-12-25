# 🚀 INSTANT DEPLOYMENT - All Devices < 1 Minute

## Overview

This system automatically deploys updates to ALL devices (mobile, desktop, PWA) in less than 1 minute with automatic cache busting.

---

## 🎯 Features

✅ **Auto-increment Service Worker** - No manual version bumps  
✅ **Instant deployment** - Updates live in < 1 minute  
✅ **Auto cache busting** - All devices get fresh updates  
✅ **Git auto-commit** - Changes tracked automatically  
✅ **Verification** - Confirms deployment success  
✅ **File watcher** - Optional auto-deploy on file changes  

---

## 📦 Quick Start

### Option 1: Manual Instant Deploy

Deploy once:

```bash
# Set your API token first
export CLOUDFLARE_API_TOKEN="your-token-here"

# Run instant deployment
npm run deploy:instant
# OR
./deploy-instant.sh
```

**Result**: Updates deployed to all devices in < 1 minute

---

### Option 2: Auto-Deploy on File Changes

Watch for changes and auto-deploy:

```bash
# Set your API token first
export CLOUDFLARE_API_TOKEN="your-token-here"

# Start file watcher
npm run deploy:watch
# OR
./deploy-watch.sh
```

**What it does:**
- Watches `src/` and `public/` for file changes
- Auto-deploys 30 seconds after last change
- Runs continuously until you press `Ctrl+C`

---

## 🔧 How It Works

### 5-Step Deployment Process

#### **Step 1: Auto-increment Service Worker**
```bash
Current: const CACHE_VERSION = 41
New:     const CACHE_VERSION = 42
```
- Automatically bumps version
- Forces all devices to clear cache

#### **Step 2: Build Application**
```bash
NODE_OPTIONS='--max-old-space-size=4096' vite build
```
- Compiles TypeScript
- Bundles assets
- Optimizes code

#### **Step 3: Deploy to Cloudflare**
```bash
wrangler pages deploy dist --project-name amebo-app
```
- Uploads to Cloudflare Pages
- Deploys to global edge network
- Returns deployment URL

#### **Step 4: Git Commit**
```bash
git add public/sw.js dist/sw.js src/
git commit -m "Auto-deploy: Service Worker v42 - 2025-12-25 21:30:00"
git push origin main
```
- Commits Service Worker version bump
- Tracks deployment history
- Keeps GitHub in sync

#### **Step 5: Verify Deployment**
```bash
curl https://amebo-app.pages.dev/sw.js
# Checks: CACHE_VERSION = 42
```
- Confirms new version is live
- Validates deployment success

---

## 📊 Timeline

```
0:00  - Start deployment
0:05  - Service Worker version bumped (v41 → v42)
0:10  - Build complete (dist/_worker.js)
0:25  - Deployed to Cloudflare Pages
0:35  - Git commit & push complete
0:40  - Verification successful
0:45  - ✅ COMPLETE - All devices will update
```

**Total Time**: ~45 seconds (< 1 minute)

---

## 🌍 Device Update Timeline

Once deployed, devices update as follows:

| Device Type | Update Time | How |
|------------|-------------|-----|
| **Desktop Browser** | Immediate | Next page refresh |
| **Mobile Browser** | 1-5 seconds | Next page load |
| **PWA (Installed)** | 5-30 seconds | Service Worker detects update |
| **Cached App** | < 1 minute | Service Worker forces reload |

**Users don't need to manually clear cache!**

---

## 🎮 Usage Examples

### Example 1: Fix a Bug and Deploy

```bash
# 1. Fix the bug in your code
vim src/index.tsx

# 2. Deploy instantly
export CLOUDFLARE_API_TOKEN="your-token"
npm run deploy:instant

# 3. Done! Bug fix live in < 1 minute
```

### Example 2: Continuous Development

```bash
# 1. Start auto-deploy watcher
export CLOUDFLARE_API_TOKEN="your-token"
npm run deploy:watch

# 2. Make changes to your code
vim src/index.tsx
# (saves automatically)

# 3. Watcher detects change and auto-deploys
# 4. Continue coding, each save auto-deploys after 30s cooldown
```

### Example 3: Multiple Quick Fixes

```bash
export CLOUDFLARE_API_TOKEN="your-token"

# Fix 1
vim src/index.tsx
npm run deploy:instant

# Fix 2 (wait 30s or Service Worker conflict)
sleep 30
vim src/index.tsx
npm run deploy:instant

# Fix 3
sleep 30
vim src/index.tsx
npm run deploy:instant
```

---

## ⚙️ Configuration

### Environment Variables

**Required:**
```bash
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
```

**Optional:**
```bash
# Change project name (default: amebo-app)
export PROJECT_NAME="your-project-name"

# Change branch (default: main)
export BRANCH="production"
```

### Deployment Cooldown

Auto-deploy watcher has a 30-second cooldown to prevent deployment spam:

```bash
# In deploy-watch.sh
DEPLOY_COOLDOWN=30  # seconds
```

Change this value to adjust cooldown time.

---

## 🔍 Troubleshooting

### Problem: "CLOUDFLARE_API_TOKEN not set"

**Solution:**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

Get your token from:
https://dash.cloudflare.com/profile/api-tokens

---

### Problem: "Build failed"

**Check:**
```bash
# Test build manually
npm run build

# Check for TypeScript errors
npm run cf-typegen
```

---

### Problem: "Deployment verification failed"

**Possible causes:**
- Cloudflare propagation delay (wait 10 seconds)
- DNS caching
- Old Service Worker still active

**Solution:**
```bash
# Wait a bit longer
sleep 10

# Check production manually
curl https://amebo-app.pages.dev/sw.js | grep CACHE_VERSION
```

---

### Problem: "Git push failed"

**Possible causes:**
- No changes to commit
- Merge conflicts
- Authentication issues

**Solution:**
```bash
# Check git status
git status

# Pull latest changes first
git pull origin main

# Try deploy again
npm run deploy:instant
```

---

## 📝 Best Practices

### ✅ DO:

- Set `CLOUDFLARE_API_TOKEN` environment variable
- Wait 30 seconds between manual deployments
- Test changes locally before deploying
- Use `deploy:watch` for active development
- Verify deployment before announcing to users

### ❌ DON'T:

- Deploy multiple times within 30 seconds
- Deploy with build errors
- Deploy without testing locally
- Manually edit Service Worker version (script does it)
- Deploy to production without testing

---

## 🚨 Emergency Rollback

If you need to rollback to a previous version:

### Method 1: Git Revert

```bash
# Find the commit to revert to
git log --oneline | head -10

# Revert to specific commit
git revert <commit-hash>
git push origin main

# Deploy the reverted version
npm run deploy:instant
```

### Method 2: Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com
2. Select: amebo-app project
3. Click: Deployments
4. Find: Previous working deployment
5. Click: "Rollback to this deployment"

---

## 📊 Monitoring

### Check Current Version

```bash
# Production version
curl -s https://amebo-app.pages.dev/sw.js | grep CACHE_VERSION

# Latest deployment
curl -s https://332bed16.amebo-app.pages.dev/sw.js | grep CACHE_VERSION
```

### View Recent Deployments

```bash
npx wrangler pages deployment list --project-name amebo-app
```

### Check Deployment Logs

```bash
# View Cloudflare logs
npx wrangler pages deployment tail --project-name amebo-app
```

---

## 🎯 Success Criteria

A successful deployment means:

✅ Service Worker version incremented  
✅ Build completed without errors  
✅ Cloudflare deployment succeeded  
✅ Git commit and push successful  
✅ Production verification passed  
✅ Devices receive update within 1 minute  

---

## 🔗 Related Files

- `deploy-instant.sh` - Main deployment script
- `deploy-watch.sh` - File watcher script
- `package.json` - NPM scripts
- `public/sw.js` - Service Worker (auto-versioned)
- `vite.config.ts` - Build configuration
- `wrangler.toml` - Cloudflare configuration

---

## 📚 Additional Resources

- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Vite Build**: https://vitejs.dev/guide/build.html
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler

---

## ✅ Summary

With this instant deployment system:

- **Make changes** → **Run `npm run deploy:instant`** → **Live in < 1 minute**
- **All devices update automatically** (no manual cache clearing)
- **Service Worker handles cache busting**
- **Git tracks all deployments**
- **Verification confirms success**

🎉 **Deploy with confidence - updates reach all users instantly!**

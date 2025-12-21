# 🚀 Cloudflare Pages Deployment Guide

## ✅ Your App is Ready to Deploy!

**Current Status:**
- ✅ WhatsApp-style UI - Complete
- ✅ Etherscan API integration - Active
- ✅ All features tested - Working
- ✅ Code committed to git - Ready

**What's needed:** Cloudflare API Key for deployment

---

## 📋 Step-by-Step Deployment

### Step 1: Get Cloudflare API Token

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Login to your account (or create free account)

2. **Create API Token:**
   - Click **"Create Token"**
   - Select **"Edit Cloudflare Workers"** template
   - OR use **"Custom token"** with these permissions:
     - Account: Cloudflare Pages - Edit
     - Account: D1 - Edit
     - User: User Details - Read

3. **Copy the Token:**
   - Format looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Keep it safe (you can't see it again)

4. **Add to Deploy Tab:**
   - Go to **Deploy tab** in the sidebar
   - Paste your Cloudflare API token
   - Click Save

---

### Step 2: Create Production Database

Once your API key is configured, run these commands:

```bash
# Create production D1 database
cd /home/user/webapp
npx wrangler d1 create webapp-production
```

**Copy the output** which looks like:
```
✅ Successfully created DB 'webapp-production'

[[d1_databases]]
binding = "DB"
database_name = "webapp-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

### Step 3: Update wrangler.jsonc

Update the database_id in `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2025-12-20",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "PASTE_YOUR_DATABASE_ID_HERE"
    }
  ]
}
```

---

### Step 4: Apply Database Migrations

```bash
# Apply migrations to production database
cd /home/user/webapp
npm run db:migrate:prod
```

You should see:
```
✅ Migration 0001_initial_schema.sql applied successfully
```

---

### Step 5: Deploy to Cloudflare Pages

```bash
# Create Pages project
cd /home/user/webapp
npx wrangler pages project create webapp --production-branch main

# Deploy
npm run deploy:prod
```

**You'll get URLs like:**
```
✨ Success! Uploaded 10 files

✨ Deployment complete! Take a peek over at
   https://xxxxxxxx.webapp.pages.dev
```

---

### Step 6: Add Etherscan API Key to Production

```bash
# Add your Etherscan API key
echo "CASFXD2JXFRW211VRWYT9DJR47CG7TTWQQ" | npx wrangler pages secret put ETHERSCAN_API_KEY --project-name webapp
```

---

## 🎯 Quick Command Summary

After setting up Cloudflare API key in Deploy tab:

```bash
cd /home/user/webapp

# 1. Create database
npx wrangler d1 create webapp-production

# 2. Update wrangler.jsonc with database_id
# (Manual step - edit the file)

# 3. Apply migrations
npm run db:migrate:prod

# 4. Create project
npx wrangler pages project create webapp --production-branch main

# 5. Deploy
npm run deploy:prod

# 6. Add Etherscan key
echo "CASFXD2JXFRW211VRWYT9DJR47CG7TTWQQ" | npx wrangler pages secret put ETHERSCAN_API_KEY --project-name webapp
```

---

## 🌐 After Deployment

Your app will be live at:
- **Production:** `https://webapp.pages.dev`
- **Branch:** `https://main.webapp.pages.dev`

### Test Your Deployed App:
1. Open the URL on your phone
2. Install as PWA (Add to Home Screen)
3. Create a room and share the code
4. Test encrypted messaging
5. Check Ethereum balance with real address

---

## 🔑 Managing Secrets in Production

### Add Secrets:
```bash
# Etherscan (already have this)
npx wrangler pages secret put ETHERSCAN_API_KEY --project-name webapp

# Paystack (when ready)
npx wrangler pages secret put PAYSTACK_SECRET_KEY --project-name webapp
```

### List Secrets:
```bash
npx wrangler pages secret list --project-name webapp
```

### Delete Secrets:
```bash
npx wrangler pages secret delete SECRET_NAME --project-name webapp
```

---

## 📊 Monitoring Your App

### View Logs:
```bash
# Real-time logs
npx wrangler pages deployment tail --project-name webapp

# List deployments
npx wrangler pages deployments list --project-name webapp
```

### Analytics:
- Go to: https://dash.cloudflare.com
- Select your account
- Click on **Pages** → **webapp**
- View **Analytics** tab

---

## 🔄 Updating Your App

### After Making Changes:

```bash
cd /home/user/webapp

# 1. Make your changes
# 2. Test locally
npm run build
pm2 restart securechat-pay

# 3. Commit
git add .
git commit -m "Your changes"

# 4. Deploy
npm run deploy:prod
```

---

## 🆘 Troubleshooting

### "Not authenticated" error:
- Go to **Deploy tab**
- Re-enter your Cloudflare API token
- Try again

### "Database not found" error:
```bash
# List your databases
npx wrangler d1 list

# If missing, create it
npx wrangler d1 create webapp-production
```

### "Project already exists" error:
```bash
# Skip the project create step
# Go directly to deploy:
npm run deploy:prod
```

### Deployment fails:
```bash
# Clean build and try again
rm -rf dist
npm run build
npm run deploy:prod
```

---

## 💰 Cost Estimate

### Free Tier Includes:
- **500 builds/month** - More than enough
- **Unlimited requests** - No limits
- **Unlimited bandwidth** - No limits
- **100K D1 reads/day** - Great for starting
- **1K D1 writes/day** - Good for small-medium usage

### When You'll Need to Upgrade:
- **>1K messages/day** → Upgrade to Workers Paid ($5/month)
  - Gets: 25M reads, 50M writes/month
- **Very unlikely** for personal/small business use

---

## ✅ Deployment Checklist

- [ ] Cloudflare API token added in Deploy tab
- [ ] Production database created
- [ ] wrangler.jsonc updated with database_id
- [ ] Database migrations applied
- [ ] Pages project created
- [ ] First deployment successful
- [ ] Etherscan API key added
- [ ] App tested in production
- [ ] PWA installation verified
- [ ] Custom domain added (optional)

---

## 🎉 After Successful Deployment

### Share Your App:
1. Get your production URL
2. Share with friends/testers
3. Create a room and share the code
4. Test the WhatsApp-style interface!

### Install as PWA:
1. Open URL on phone
2. Add to Home Screen
3. Use like native app

### Monitor Usage:
- Check Cloudflare Analytics
- Monitor D1 database usage
- Watch for errors in logs

---

## 📞 Need Help?

### Resources:
- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **D1 Docs:** https://developers.cloudflare.com/d1/

### Common Commands:
```bash
# Check wrangler version
npx wrangler --version

# Login to Cloudflare
npx wrangler login

# Check authentication
npx wrangler whoami

# View help
npx wrangler pages --help
```

---

## 🚀 Ready to Deploy!

**Next Steps:**
1. **Go to Deploy tab** → Add your Cloudflare API token
2. **Run the commands above** to deploy
3. **Get your live URL** and test
4. **Share your app** with the world! 🎉

---

**Your app is production-ready with:**
- ✅ WhatsApp-style UI
- ✅ Military-grade encryption
- ✅ Etherscan integration
- ✅ PWA capabilities
- ✅ Mobile-optimized

**Just add your Cloudflare API key and deploy!** 🚀

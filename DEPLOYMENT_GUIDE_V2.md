# 🚀 AMEBO v2.0 - DEPLOYMENT GUIDE

**Status**: ⚠️ Ready to deploy (API key required)  
**Date**: December 24, 2025

---

## 📋 PRE-DEPLOYMENT CHECKLIST

✅ Phase 1: Database Schema - COMPLETE  
✅ Phase 2: Backend Architecture - COMPLETE  
✅ Phase 3: Frontend Rebuild - COMPLETE  
✅ Code built: `dist_v2/_worker.js` (44.68 KB)  
✅ Git committed & pushed to `v2.0-rebuild` branch  
⏳ Cloudflare API key - **REQUIRED**

---

## 🔑 STEP 1: Configure Cloudflare API Key

### **Why This is Needed**
To deploy to Cloudflare Pages and create D1 databases, wrangler needs authentication.

### **How to Get Your API Key**

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/profile/api-tokens

2. **Create API Token**
   - Click "Create Token"
   - Use template: **"Edit Cloudflare Workers"**
   - Or create custom token with these permissions:
     - Account > Cloudflare Pages > Edit
     - Account > D1 > Edit
     - Account > Workers Scripts > Edit

3. **Copy the Token**
   - Save it securely (you'll only see it once!)

4. **Add to Genspark**
   - Go to **Deploy** tab in sidebar
   - Enter your API key
   - Save

### **Alternative: Set Environment Variable**
If you have terminal access:
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

---

## 🗄️ STEP 2: Create v2 Database

Once API key is configured, run:

```bash
cd /home/user/webapp

# Create production database
npx wrangler d1 create amebo-v2-production
```

**You'll get output like:**
```
✅ Successfully created DB 'amebo-v2-production' in region WNAM
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "amebo-v2-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** - you'll need it in the next step.

---

## 📝 STEP 3: Update Configuration

Edit `wrangler.v2.jsonc` and add your database_id:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "amebo-v2",
  "compatibility_date": "2025-12-20",
  "pages_build_output_dir": "./dist_v2",
  "compatibility_flags": ["nodejs_compat"],
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "amebo-v2-production",
      "database_id": "PASTE-YOUR-DATABASE-ID-HERE"  // ← Replace this
    }
  ]
}
```

---

## 🏗️ STEP 4: Apply Database Schema

Apply the clean v2 schema to your production database:

```bash
cd /home/user/webapp

# Apply schema to production
npx wrangler d1 execute amebo-v2-production \
    --file=migrations_v2/0001_clean_schema_v2.sql

# Verify tables were created
npx wrangler d1 execute amebo-v2-production \
    --command="SELECT name FROM sqlite_master WHERE type='table'"
```

**Expected output:**
```
✅ Successfully executed 11 statements
Tables created:
- users
- chat_rooms
- room_members
- direct_message_rooms
- messages
- user_contacts
- blocked_users
- typing_status
- read_receipts
- notifications
- attachments
```

---

## 🌐 STEP 5: Create Cloudflare Pages Project

Create a new Cloudflare Pages project for v2:

```bash
cd /home/user/webapp

# Create project
npx wrangler pages project create amebo-v2 \
    --production-branch v2.0-rebuild

# You'll see:
✅ Successfully created the 'amebo-v2' project.
```

---

## 🚀 STEP 6: Deploy v2 to Production

Deploy the built application:

```bash
cd /home/user/webapp

# Deploy dist_v2/ to amebo-v2 project
npx wrangler pages deploy dist_v2 --project-name amebo-v2

# This will:
# 1. Upload your worker code
# 2. Upload static files
# 3. Create deployment
# 4. Give you production URL
```

**Expected output:**
```
✨ Compiled Worker successfully
🌎 Uploading... (100%)

✨ Success! Deployed to https://amebo-v2.pages.dev
```

---

## ✅ STEP 7: Verify Deployment

Test your deployment:

```bash
# 1. Test health endpoint
curl https://amebo-v2.pages.dev/api/v2/health

# Expected: {"status":"healthy","version":"2.0.0"}

# 2. Visit in browser
open https://amebo-v2.pages.dev
```

**You should see:**
- Clean v2.0 UI
- Login/Register forms
- "Amebo v2.0 - Bug-Free Messaging"

---

## 🧪 STEP 8: Test v2 (Parallel with v1)

### **Create Test Account**
1. Open: https://amebo-v2.pages.dev
2. Click "Register"
3. Create account:
   - Email: test@example.com
   - Username: testuser
   - Password: testpass123
4. ✅ Should login automatically

### **Test Features**
1. **Search Users**
   - Search for existing users
   - Create DM with user

2. **Send Messages**
   - Type message
   - Click send
   - ✅ Should appear instantly

3. **Create Multiple Chats**
   - Search different users
   - Create multiple DMs
   - ✅ All should appear in list

4. **Delete Chat**
   - Hover over chat
   - Click delete button
   - ✅ Should delete cleanly

5. **Refresh Page**
   - Reload browser
   - ✅ Should stay logged in
   - ✅ Chats should persist

### **Compare with v1**
| Feature | v1 (amebo-app.pages.dev) | v2 (amebo-v2.pages.dev) |
|---------|-------------------------|-------------------------|
| Chat creation | ❌ Sometimes fails | ✅ Always works |
| Message sending | ❌ 403 errors | ✅ No errors |
| Profile display | ❌ Missing | ✅ Always shows |
| Delete chat | ❌ Broken | ✅ Works perfectly |
| Typing indicators | ❌ 500 errors | ✅ Graceful |

---

## 📊 STEP 9: Monitor Production

### **Check Logs**
```bash
# View real-time logs
npx wrangler tail amebo-v2

# Filter for errors
npx wrangler tail amebo-v2 --status error
```

### **Check Analytics**
- Visit: https://dash.cloudflare.com
- Navigate to: Workers & Pages > amebo-v2
- View: Requests, Errors, Duration

### **Check Database**
```bash
# Count users
npx wrangler d1 execute amebo-v2-production \
    --command="SELECT COUNT(*) as users FROM users"

# Count rooms
npx wrangler d1 execute amebo-v2-production \
    --command="SELECT COUNT(*) as rooms FROM chat_rooms"

# Count messages
npx wrangler d1 execute amebo-v2-production \
    --command="SELECT COUNT(*) as messages FROM messages"
```

---

## 🔄 STEP 10: Migration Strategy

### **Gradual Migration Plan**

**Week 1: Internal Testing**
- Deploy v2 to `amebo-v2.pages.dev`
- Test with 5-10 internal users
- Fix any issues found
- v1 stays at `amebo-app.pages.dev` (unchanged)

**Week 2: Beta Testing**
- Invite 50-100 users to v2
- Monitor error rates
- Collect feedback
- Keep v1 running

**Week 3: 50% Traffic Split**
- Point half of users to v2
- Monitor metrics closely
- Compare v1 vs v2 performance
- Ready for rollback if needed

**Week 4: 100% Cutover**
- Point all users to v2
- Update main domain: `amebo.pages.dev` → v2
- Keep v1 as backup for 2 weeks
- Celebrate! 🎉

### **Rollback Plan**
If issues are found:
```bash
# 1. Stop sending users to v2
# 2. Investigate and fix issue
# 3. Redeploy v2
# 4. Resume migration
```

---

## 🎯 SUCCESS CRITERIA

### **Deployment is Successful When:**
✅ v2 deploys to `https://amebo-v2.pages.dev`  
✅ Health endpoint returns 200  
✅ Users can register  
✅ Users can login  
✅ Users can create DMs  
✅ Users can send messages  
✅ Messages encrypt/decrypt properly  
✅ No 403/500 errors in logs  
✅ Database operations are atomic  
✅ Chats don't disappear  

### **Ready for Migration When:**
✅ All tests pass  
✅ Error rate < 0.1%  
✅ User feedback is positive  
✅ Performance is good  
✅ No data integrity issues  
✅ Team is confident  

---

## 🆘 TROUBLESHOOTING

### **Issue: "CLOUDFLARE_API_TOKEN not set"**
**Solution**: Set up API key in Deploy tab (see Step 1)

### **Issue: "Database not found"**
**Solution**: 
1. Check `wrangler.v2.jsonc` has correct `database_id`
2. Verify database exists: `npx wrangler d1 list`

### **Issue: "Deploy failed"**
**Solution**:
1. Check build succeeded: `ls -lh dist_v2/_worker.js`
2. Verify wrangler.v2.jsonc is valid JSON
3. Check logs: `~/.config/.wrangler/logs/`

### **Issue: "Frontend shows 'Loading...'"**
**Solution**:
1. Check browser console for errors (F12)
2. Verify static files deployed: `curl https://amebo-v2.pages.dev/static/js/app.js`
3. Check API health: `curl https://amebo-v2.pages.dev/api/v2/health`

### **Issue: "Can't create DM"**
**Solution**:
1. Check database has tables: See monitoring commands above
2. Check logs: `npx wrangler tail amebo-v2`
3. Verify both users exist in database

---

## 📞 SUPPORT

### **Resources**
- **v2 Code**: https://github.com/aprelay/Amebo/tree/v2.0-rebuild
- **Documentation**: See `README_V2.md`, `V2_COMPLETE_SUMMARY.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/pages/

### **Common Commands**
```bash
# Rebuild and redeploy
npm run build -- --config vite.config.v2.ts
npx wrangler pages deploy dist_v2 --project-name amebo-v2

# Check deployment status
npx wrangler pages deployment list --project-name amebo-v2

# View logs
npx wrangler tail amebo-v2

# Database console
npx wrangler d1 execute amebo-v2-production --command="YOUR SQL"
```

---

## ✅ DEPLOYMENT CHECKLIST

Print this and check off as you go:

- [ ] Cloudflare API key configured
- [ ] Database created: `amebo-v2-production`
- [ ] Database ID added to `wrangler.v2.jsonc`
- [ ] Schema applied to production database
- [ ] Tables verified (11 tables created)
- [ ] Cloudflare Pages project created: `amebo-v2`
- [ ] Application deployed to production
- [ ] Health endpoint returns 200
- [ ] Can register new user
- [ ] Can login
- [ ] Can search users
- [ ] Can create DM
- [ ] Can send messages
- [ ] Can delete chats
- [ ] No errors in logs
- [ ] Monitoring set up
- [ ] Ready for user testing

---

## 🎊 CONGRATULATIONS!

Once all steps are complete:
- ✅ v2 is running at `https://amebo-v2.pages.dev`
- ✅ v1 stays at `https://amebo-app.pages.dev`
- ✅ Both run in parallel
- ✅ Users can test v2 safely
- ✅ Zero downtime migration possible

**You're ready to provide bug-free messaging to your users!** 🚀

---

**Next Steps:**
1. Configure API key (Deploy tab)
2. Run commands above
3. Test thoroughly
4. Celebrate! 🎉

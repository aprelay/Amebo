# 🎉 V2.0 DEPLOYED - DATABASE SETUP NEEDED

**Great news!** v2.0 is successfully deployed to Cloudflare Pages!

**URL**: https://1856066e.amebo-v2.pages.dev

However, to make it fully functional, we need to set up the D1 database. Your current API token doesn't have D1 permissions.

---

## 🔑 SOLUTION: Update API Token Permissions

### **Option A: Create New Token with Full Permissions** (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/profile/api-tokens

2. **Create New API Token**
   - Click "Create Token"
   - Click "Use template" for **"Edit Cloudflare Workers"**
   
3. **Add D1 Permissions**
   - Under "Account Resources":
     - Add: **Account > D1 > Edit**
   - Under "Zone Resources":
     - Keep existing Workers permissions
   
4. **Create & Copy Token**
   - Click "Continue to summary"
   - Click "Create Token"
   - **Copy the new token**

5. **Update in Genspark**
   - Go to Deploy tab
   - Replace old token with new token
   - Save

---

## 🗄️ THEN: Set Up Database

Once you have the token with D1 permissions:

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="your-new-token-here"

# 1. Create database
npx wrangler d1 create amebo-v2-production

# 2. Copy the database_id from output

# 3. Update wrangler.v2.jsonc
# Add database_id to line 11

# 4. Apply schema
npx wrangler d1 execute amebo-v2-production \
    --file=migrations_v2/0001_clean_schema_v2.sql

# 5. Bind database to Pages project
npx wrangler pages deployment create \
    --project-name amebo-v2 \
    --branch v2.0-rebuild

# 6. Redeploy with database binding
npx wrangler pages deploy dist_v2 \
    --project-name amebo-v2 \
    --branch v2.0-rebuild
```

---

## 🌐 ALTERNATIVE: Use Cloudflare Dashboard

If you prefer using the web interface:

### **1. Create D1 Database**
1. Go to: https://dash.cloudflare.com
2. Navigate to: **Workers & Pages > D1**
3. Click "Create database"
4. Name: `amebo-v2-production`
5. Click "Create"
6. **Copy the Database ID**

### **2. Apply Schema**
1. Click on your database
2. Go to "Console" tab
3. Copy the content of `migrations_v2/0001_clean_schema_v2.sql`
4. Paste into console
5. Click "Execute"

### **3. Bind to Pages Project**
1. Go to: **Workers & Pages**
2. Click on "amebo-v2"
3. Go to "Settings" > "Functions"
4. Scroll to "D1 database bindings"
5. Click "Add binding"
6. Variable name: `DB`
7. D1 database: Select `amebo-v2-production`
8. Click "Save"

### **4. Redeploy**
The next git push will automatically redeploy with the database connected.

---

## ✅ CURRENT STATUS

### **What's Working:**
✅ v2 code deployed to Cloudflare Pages  
✅ Frontend accessible  
✅ Worker code compiled  
✅ Project created: `amebo-v2`

### **What's Needed:**
⏳ D1 database creation  
⏳ Schema application  
⏳ Database binding to Pages project

---

## 🎯 ONCE DATABASE IS SET UP

Your v2 will be fully functional at:
- **Preview**: https://1856066e.amebo-v2.pages.dev
- **Production**: https://amebo-v2.pages.dev

You'll be able to:
- ✅ Register users
- ✅ Login
- ✅ Create DMs
- ✅ Send messages
- ✅ Delete chats
- ✅ All features working perfectly!

---

## 📞 NEED HELP?

If you run into issues:
1. Check that your API token has **D1 Edit** permissions
2. Verify database was created successfully
3. Ensure database is bound to Pages project
4. Check logs: `npx wrangler pages deployment tail`

---

**You're 95% there! Just need the D1 database set up.** 🚀

# 🔧 How to Update D1 Database Binding in Cloudflare Dashboard

## 📍 **Current Status:**
- ❌ Currently bound to: `amebo-production` (old v1 database)
- ✅ Need to bind to: `amebo-v2-production` (new v2 database)

---

## 🎯 **Step-by-Step Visual Guide:**

### **Step 1: Navigate to Pages Project**
1. Go to: https://dash.cloudflare.com
2. Click **"Workers & Pages"** in the left sidebar
3. Find and click **"amebo-v2"** project

### **Step 2: Find Settings Tab**
Look at the top navigation, you should see tabs like:
```
Deployments | Settings | Analytics | ...
```
Click **"Settings"**

### **Step 3: Find Bindings Section**

The Cloudflare dashboard might show it in different locations depending on your interface version:

#### **Option A: Functions Section**
Scroll down and look for:
```
┌─────────────────────────────────────┐
│ Functions                            │
│                                      │
│ D1 database bindings                │
│ ┌─────────────────────────────┐    │
│ │ Type: D1 database            │    │
│ │ Name: DB                     │    │
│ │ Value: amebo-production      │    │
│ │ [Edit] [Remove]              │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### **Option B: Environment Variables Section**
Or look for:
```
┌─────────────────────────────────────┐
│ Environment Variables                │
│                                      │
│ Production                           │
│ ┌─────────────────────────────┐    │
│ │ D1 Databases                 │    │
│ │ DB → amebo-production        │    │
│ │ [Edit]                       │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

#### **Option C: Bindings Tab**
Sometimes it's under a separate "Bindings" section:
```
Settings > Bindings

┌─────────────────────────────────────┐
│ D1 Databases                         │
│                                      │
│ Variable name: DB                    │
│ Database: amebo-production           │
│ [Edit] [Remove]                      │
└─────────────────────────────────────┘
```

### **Step 4: Edit the Binding**

Once you find it:

1. **Click** the **"Edit"** button or **pencil icon** (✏️)
2. You'll see a dropdown or field that says: `amebo-production`
3. **Click** the dropdown and select: `amebo-v2-production`
4. **Click** "Save" or "Update"

---

## 🖼️ **Alternative: Screenshots to Look For**

Look for these UI elements:

### **In Settings Tab:**
- Section heading: "Functions" or "Environment Variables" or "Bindings"
- Subsection: "D1 database bindings" or "D1 Databases"
- Current entry showing: `DB → amebo-production`

### **Edit Interface:**
When you click Edit, you should see:
```
┌─────────────────────────────────────┐
│ Edit D1 Database Binding             │
│                                      │
│ Variable name: [DB          ]       │
│                                      │
│ D1 Database:                         │
│ [▼ amebo-production        ]        │
│    ├─ amebo-production (current)    │
│    └─ amebo-v2-production ✓         │
│                                      │
│ [Cancel]  [Save]                    │
└─────────────────────────────────────┘
```

---

## 🔍 **Can't Find It? Try These Direct URLs:**

### **Method 1: Direct Settings URL**
```
https://dash.cloudflare.com/b4acc49af685a435c78801cedc2d2919/pages/view/amebo-v2/settings
```

### **Method 2: Direct Functions URL**
```
https://dash.cloudflare.com/b4acc49af685a435c78801cedc2d2919/pages/view/amebo-v2/settings/functions
```

### **Method 3: Search in Settings**
Once in Settings tab:
- Use Ctrl+F (Cmd+F on Mac) and search for: `amebo-production`
- This will highlight where the binding is located

---

## 🚨 **What You're Looking For:**

### **Current (Wrong):**
```
Name: DB
Database: amebo-production ❌
```

### **Change To:**
```
Name: DB
Database: amebo-v2-production ✅
```

### **Keep These the Same:**
- Variable name: `DB` (don't change)
- Type: `D1 database` (don't change)

### **Only Change:**
- Database value: `amebo-production` → `amebo-v2-production`

---

## ✅ **After You Save:**

1. The page will show: "Deployment in progress..."
2. Wait 30-60 seconds
3. You'll see: "Deployment successful"
4. Visit: https://amebo-v2.pages.dev
5. Test the app - all features should work!

---

## 💡 **Still Can't Find It?**

If you absolutely cannot locate the bindings in the dashboard:

1. **Take a screenshot** of what you see in the Settings tab
2. Or tell me what sections you see (Functions? Variables? Bindings?)
3. I can provide more specific guidance

---

## 📸 **What to Look For (Quick Checklist):**

- [ ] I'm on https://dash.cloudflare.com
- [ ] I clicked "Workers & Pages"
- [ ] I clicked "amebo-v2" project
- [ ] I clicked "Settings" tab at the top
- [ ] I can see sections like "Functions" or "Environment Variables"
- [ ] I found a section mentioning "D1" or "Databases"
- [ ] I can see "DB → amebo-production" listed
- [ ] I found an Edit button or pencil icon

Once you check all these, you should be able to find and edit the binding!

---

## 🎯 **Goal:**
Change database from `amebo-production` to `amebo-v2-production`

**That's it! Just change the database name in the dropdown.** 🚀

# 📢 Ad Monetization System - User-Controlled Ad Placements

## 🎯 Overview

This guide implements a **self-service advertising platform** where advertisers can:
1. **Choose ad placement**: Bottom banner on homepage (after login)
2. **Choose destination**: Instagram profile OR custom website URL
3. **Set budget**: Pay per impression (CPM) or per click (CPC)
4. **Upload creative**: Image banner + text copy
5. **Track performance**: Real-time analytics dashboard

---

## 💰 Revenue Model

### **Pricing Tiers**

| Plan | Impressions | Clicks | Price (Naira) | Best For |
|------|-------------|--------|---------------|----------|
| **Starter** | 10,000 | Unlimited | ₦2,000 | Small businesses testing ads |
| **Growth** | 50,000 | Unlimited | ₦8,000 | Growing brands |
| **Pro** | 100,000 | Unlimited | ₦15,000 | Established businesses |
| **Enterprise** | 500,000 | Unlimited | ₦60,000 | Large campaigns |
| **Custom** | Custom | Custom | Custom | Agencies & corporations |

**OR Pay-Per-Click (CPC):**
- ₦10 per click (minimum ₦5,000 budget)
- Better for conversion-focused campaigns

**Cost Breakdown:**
- **CPM (Cost Per 1000 Impressions)**: ₦200
- **CPC (Cost Per Click)**: ₦10
- **Average CTR**: 1-3% (100-300 clicks per 10,000 impressions)

---

## 🏗️ System Architecture

### **Database Schema**

```sql
-- Advertisers table
CREATE TABLE IF NOT EXISTS advertisers (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  country_code TEXT DEFAULT 'NG',
  instagram_handle TEXT,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned'))
);

-- Ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id TEXT PRIMARY KEY,
  advertiser_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  
  -- Ad creative
  ad_image_url TEXT NOT NULL,
  ad_title TEXT NOT NULL,
  ad_description TEXT,
  
  -- Destination (one of these must be set)
  destination_type TEXT NOT NULL CHECK(destination_type IN ('instagram', 'website')),
  instagram_handle TEXT,
  website_url TEXT,
  
  -- Budget & pricing
  pricing_model TEXT NOT NULL CHECK(pricing_model IN ('cpm', 'cpc')),
  budget_total REAL NOT NULL,
  budget_spent REAL DEFAULT 0,
  cpm_rate REAL DEFAULT 200, -- ₦200 per 1000 impressions
  cpc_rate REAL DEFAULT 10,  -- ₦10 per click
  
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Campaign status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'paused', 'completed', 'rejected')),
  
  -- Scheduling
  start_date DATETIME,
  end_date DATETIME,
  
  -- Targeting (optional)
  target_users TEXT, -- JSON array of user IDs or 'all'
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (advertiser_id) REFERENCES advertisers(id)
);

-- Ad impressions tracking (for detailed analytics)
CREATE TABLE IF NOT EXISTS ad_impressions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
);

-- Ad clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT NOT NULL,
  user_id TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
);

-- Ad payments table
CREATE TABLE IF NOT EXISTS ad_payments (
  id TEXT PRIMARY KEY,
  advertiser_id TEXT NOT NULL,
  campaign_id TEXT,
  amount REAL NOT NULL,
  payment_method TEXT, -- paystack, bank_transfer, tokens
  payment_reference TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (advertiser_id) REFERENCES advertisers(id),
  FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON ad_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_campaign ON ad_clicks(campaign_id);
```

---

## 🔧 Backend Implementation

### **1. Ad Management Endpoints**

```typescript
// File: src/index.tsx

// ==================== ADVERTISER REGISTRATION ====================
app.post('/api/ads/register-advertiser', async (c) => {
  try {
    const { businessName, email, phone, instagramHandle, websiteUrl } = await c.req.json()
    
    if (!businessName || !email) {
      return c.json({ error: 'Business name and email required' }, 400)
    }
    
    // Check if email exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM advertisers WHERE email = ?
    `).bind(email).first()
    
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    const advertiserId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO advertisers (id, business_name, email, phone, instagram_handle, website_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(advertiserId, businessName, email, phone || null, instagramHandle || null, websiteUrl || null).run()
    
    console.log(`[ADS] Advertiser registered: ${businessName}`)
    
    return c.json({ 
      success: true, 
      advertiserId,
      message: 'Advertiser registered successfully'
    })
  } catch (error: any) {
    console.error('[ADS] Registration error:', error)
    return c.json({ error: 'Registration failed' }, 500)
  }
})

// ==================== CREATE AD CAMPAIGN ====================
app.post('/api/ads/create-campaign', async (c) => {
  try {
    const { 
      advertiserId, 
      campaignName, 
      adImageUrl, 
      adTitle, 
      adDescription,
      destinationType, // 'instagram' or 'website'
      instagramHandle, 
      websiteUrl,
      pricingModel, // 'cpm' or 'cpc'
      budgetTotal,
      startDate,
      endDate
    } = await c.req.json()
    
    // Validation
    if (!advertiserId || !campaignName || !adImageUrl || !adTitle || !destinationType || !pricingModel || !budgetTotal) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Validate destination
    if (destinationType === 'instagram' && !instagramHandle) {
      return c.json({ error: 'Instagram handle required for Instagram destination' }, 400)
    }
    if (destinationType === 'website' && !websiteUrl) {
      return c.json({ error: 'Website URL required for website destination' }, 400)
    }
    
    // Minimum budget check
    if (budgetTotal < 2000) {
      return c.json({ error: 'Minimum budget is ₦2,000' }, 400)
    }
    
    const campaignId = crypto.randomUUID()
    
    await c.env.DB.prepare(`
      INSERT INTO ad_campaigns (
        id, advertiser_id, campaign_name, 
        ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, budget_total,
        start_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      campaignId, advertiserId, campaignName,
      adImageUrl, adTitle, adDescription || null,
      destinationType, instagramHandle || null, websiteUrl || null,
      pricingModel, budgetTotal,
      startDate || new Date().toISOString(), endDate || null
    ).run()
    
    console.log(`[ADS] Campaign created: ${campaignName} by advertiser ${advertiserId}`)
    
    return c.json({ 
      success: true, 
      campaignId,
      message: 'Campaign created! Pending approval.',
      paymentRequired: true,
      paymentAmount: budgetTotal
    })
  } catch (error: any) {
    console.error('[ADS] Campaign creation error:', error)
    return c.json({ error: 'Campaign creation failed' }, 500)
  }
})

// ==================== GET ACTIVE ADS (FOR DISPLAY) ====================
app.get('/api/ads/active', async (c) => {
  try {
    const userId = c.req.query('userId') // Optional: for targeted ads
    
    // Get all active campaigns with budget remaining
    const campaigns = await c.env.DB.prepare(`
      SELECT 
        id, ad_image_url, ad_title, ad_description,
        destination_type, instagram_handle, website_url,
        pricing_model, impressions, clicks
      FROM ad_campaigns
      WHERE status = 'active'
        AND budget_spent < budget_total
        AND (start_date IS NULL OR start_date <= datetime('now'))
        AND (end_date IS NULL OR end_date >= datetime('now'))
      ORDER BY RANDOM()
      LIMIT 1
    `).first()
    
    if (!campaigns) {
      return c.json({ success: true, ad: null, message: 'No active ads' })
    }
    
    return c.json({ 
      success: true, 
      ad: campaigns
    })
  } catch (error: any) {
    console.error('[ADS] Get active ads error:', error)
    return c.json({ error: 'Failed to get ads' }, 500)
  }
})

// ==================== TRACK AD IMPRESSION ====================
app.post('/api/ads/impression', async (c) => {
  try {
    const { campaignId, userId, sessionId } = await c.req.json()
    
    if (!campaignId) {
      return c.json({ error: 'Campaign ID required' }, 400)
    }
    
    // Get campaign details
    const campaign = await c.env.DB.prepare(`
      SELECT id, pricing_model, cpm_rate, budget_total, budget_spent, impressions
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found or inactive' }, 404)
    }
    
    // Calculate cost for this impression
    let impressionCost = 0
    if (campaign.pricing_model === 'cpm') {
      impressionCost = (campaign.cpm_rate || 200) / 1000 // ₦200 per 1000 impressions
    }
    
    const newBudgetSpent = (campaign.budget_spent || 0) + impressionCost
    const newImpressions = (campaign.impressions || 0) + 1
    
    // Check if budget exceeded
    if (newBudgetSpent > campaign.budget_total) {
      // Pause campaign
      await c.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(campaignId).run()
      
      return c.json({ success: true, message: 'Campaign budget depleted', campaignCompleted: true })
    }
    
    // Record impression
    await c.env.DB.prepare(`
      INSERT INTO ad_impressions (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(campaignId, userId || null, sessionId || null).run()
    
    // Update campaign metrics
    await c.env.DB.prepare(`
      UPDATE ad_campaigns
      SET impressions = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newImpressions, newBudgetSpent, campaignId).run()
    
    return c.json({ success: true, impressionRecorded: true })
  } catch (error: any) {
    console.error('[ADS] Impression tracking error:', error)
    return c.json({ error: 'Failed to track impression' }, 500)
  }
})

// ==================== TRACK AD CLICK ====================
app.post('/api/ads/click', async (c) => {
  try {
    const { campaignId, userId, sessionId } = await c.req.json()
    
    if (!campaignId) {
      return c.json({ error: 'Campaign ID required' }, 400)
    }
    
    // Get campaign details
    const campaign = await c.env.DB.prepare(`
      SELECT id, pricing_model, cpc_rate, budget_total, budget_spent, clicks,
             destination_type, instagram_handle, website_url
      FROM ad_campaigns
      WHERE id = ? AND status = 'active'
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found or inactive' }, 404)
    }
    
    // Calculate cost for this click
    let clickCost = 0
    if (campaign.pricing_model === 'cpc') {
      clickCost = campaign.cpc_rate || 10 // ₦10 per click
    }
    
    const newBudgetSpent = (campaign.budget_spent || 0) + clickCost
    const newClicks = (campaign.clicks || 0) + 1
    
    // Check if budget exceeded
    if (newBudgetSpent > campaign.budget_total) {
      await c.env.DB.prepare(`
        UPDATE ad_campaigns SET status = 'completed' WHERE id = ?
      `).bind(campaignId).run()
      
      return c.json({ success: true, message: 'Campaign budget depleted', campaignCompleted: true })
    }
    
    // Record click
    await c.env.DB.prepare(`
      INSERT INTO ad_clicks (campaign_id, user_id, session_id)
      VALUES (?, ?, ?)
    `).bind(campaignId, userId || null, sessionId || null).run()
    
    // Update campaign metrics
    await c.env.DB.prepare(`
      UPDATE ad_campaigns
      SET clicks = ?, budget_spent = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newClicks, newBudgetSpent, campaignId).run()
    
    // Return destination URL
    let destinationUrl = ''
    if (campaign.destination_type === 'instagram') {
      destinationUrl = `https://instagram.com/${campaign.instagram_handle}`
    } else {
      destinationUrl = campaign.website_url as string
    }
    
    return c.json({ 
      success: true, 
      clickRecorded: true,
      destinationUrl
    })
  } catch (error: any) {
    console.error('[ADS] Click tracking error:', error)
    return c.json({ error: 'Failed to track click' }, 500)
  }
})

// ==================== GET CAMPAIGN ANALYTICS ====================
app.get('/api/ads/campaign/:campaignId/analytics', async (c) => {
  try {
    const campaignId = c.req.param('campaignId')
    
    const campaign = await c.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        pricing_model, cpm_rate, cpc_rate,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE id = ?
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ error: 'Campaign not found' }, 404)
    }
    
    // Calculate metrics
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : 0
    const avgCostPerClick = campaign.clicks > 0 ? (campaign.budget_spent / campaign.clicks).toFixed(2) : 0
    const budgetRemaining = campaign.budget_total - campaign.budget_spent
    const percentSpent = ((campaign.budget_spent / campaign.budget_total) * 100).toFixed(1)
    
    return c.json({
      success: true,
      campaign: {
        ...campaign,
        metrics: {
          ctr: `${ctr}%`,
          avgCostPerClick: `₦${avgCostPerClick}`,
          budgetRemaining: `₦${budgetRemaining.toFixed(2)}`,
          percentSpent: `${percentSpent}%`
        }
      }
    })
  } catch (error: any) {
    console.error('[ADS] Analytics error:', error)
    return c.json({ error: 'Failed to get analytics' }, 500)
  }
})

// ==================== ADVERTISER DASHBOARD ====================
app.get('/api/ads/advertiser/:advertiserId/campaigns', async (c) => {
  try {
    const advertiserId = c.req.param('advertiserId')
    
    const campaigns = await c.env.DB.prepare(`
      SELECT 
        id, campaign_name, status,
        budget_total, budget_spent,
        impressions, clicks,
        start_date, end_date, created_at
      FROM ad_campaigns
      WHERE advertiser_id = ?
      ORDER BY created_at DESC
    `).bind(advertiserId).all()
    
    return c.json({
      success: true,
      campaigns: campaigns.results || []
    })
  } catch (error: any) {
    console.error('[ADS] Get campaigns error:', error)
    return c.json({ error: 'Failed to get campaigns' }, 500)
  }
})
```

---

## 🎨 Frontend Implementation

### **1. Ad Display Component (Bottom Banner)**

```javascript
// File: public/static/app-v3.js

// Add this to your showRoomList() function or main dashboard

async showAdBanner() {
    try {
        // Get active ad
        const response = await fetch(`${API_BASE}/api/ads/active?userId=${this.currentUser.id}`);
        const data = await response.json();
        
        if (!data.success || !data.ad) {
            return; // No ads to show
        }
        
        const ad = data.ad;
        
        // Create ad banner HTML
        const adBanner = `
            <div id="ad-banner" class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-lg z-50">
                <div class="max-w-4xl mx-auto p-2 flex items-center gap-3">
                    <!-- Ad Image -->
                    <img 
                        src="${ad.ad_image_url}" 
                        alt="${ad.ad_title}"
                        class="w-16 h-16 object-cover rounded"
                    />
                    
                    <!-- Ad Content -->
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800 text-sm">${ad.ad_title}</h3>
                        ${ad.ad_description ? `<p class="text-xs text-gray-600">${ad.ad_description}</p>` : ''}
                        <span class="text-xs text-gray-400">Sponsored</span>
                    </div>
                    
                    <!-- CTA Button -->
                    <button 
                        onclick="app.handleAdClick('${ad.id}', '${ad.destination_type}')"
                        class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all"
                    >
                        ${ad.destination_type === 'instagram' ? '📷 Follow' : '🌐 Visit'}
                    </button>
                    
                    <!-- Close Button -->
                    <button 
                        onclick="document.getElementById('ad-banner').remove()"
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Insert ad banner at bottom of page
        document.body.insertAdjacentHTML('beforeend', adBanner);
        
        // Track impression
        await this.trackAdImpression(ad.id);
        
    } catch (error) {
        console.error('[ADS] Show banner error:', error);
    }
}

async trackAdImpression(campaignId) {
    try {
        await fetch(`${API_BASE}/api/ads/impression`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaignId,
                userId: this.currentUser?.id,
                sessionId: localStorage.getItem('sessionId') || crypto.randomUUID()
            })
        });
    } catch (error) {
        console.error('[ADS] Track impression error:', error);
    }
}

async handleAdClick(campaignId, destinationType) {
    try {
        // Track click
        const response = await fetch(`${API_BASE}/api/ads/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaignId,
                userId: this.currentUser?.id,
                sessionId: localStorage.getItem('sessionId') || crypto.randomUUID()
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.destinationUrl) {
            // Open in new tab
            window.open(data.destinationUrl, '_blank');
        }
    } catch (error) {
        console.error('[ADS] Handle click error:', error);
    }
}
```

### **2. Advertiser Registration Page**

```javascript
// Add new function to show advertiser registration

showAdvertiserSignup() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-bullhorn text-purple-600 text-3xl"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800">Advertise on SecureChat</h1>
                    <p class="text-gray-600 mt-2">Reach thousands of active Nigerian users</p>
                </div>
                
                <div id="advertiser-message" class="hidden mb-4 p-3 rounded-lg"></div>
                
                <form id="advertiserForm" class="space-y-4">
                    <!-- Business Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Business Name *
                        </label>
                        <input 
                            type="text"
                            id="businessName"
                            placeholder="e.g., TechHub Nigeria"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                            required
                        />
                    </div>
                    
                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Business Email *
                        </label>
                        <input 
                            type="email"
                            id="businessEmail"
                            placeholder="contact@yourbusiness.com"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                            required
                        />
                    </div>
                    
                    <!-- Phone -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input 
                            type="tel"
                            id="businessPhone"
                            placeholder="080xxxxxxxx"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    
                    <!-- Instagram Handle -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Instagram Handle (optional)
                        </label>
                        <div class="flex">
                            <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">@</span>
                            <input 
                                type="text"
                                id="instagramHandle"
                                placeholder="yourbusiness"
                                class="flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-purple-600"
                            />
                        </div>
                    </div>
                    
                    <!-- Website -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Website URL (optional)
                        </label>
                        <input 
                            type="url"
                            id="websiteUrl"
                            placeholder="https://yourbusiness.com"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600"
                        />
                    </div>
                    
                    <!-- Submit Button -->
                    <button 
                        type="submit"
                        class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                        Register as Advertiser
                    </button>
                </form>
                
                <div class="mt-6 text-center text-sm text-gray-600">
                    <p>Already registered? <a href="#" onclick="app.showAdvertiserLogin()" class="text-purple-600 font-semibold">Login</a></p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('advertiserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAdvertiserRegistration();
    });
}

async handleAdvertiserRegistration() {
    const businessName = document.getElementById('businessName').value.trim();
    const email = document.getElementById('businessEmail').value.trim();
    const phone = document.getElementById('businessPhone').value.trim();
    const instagramHandle = document.getElementById('instagramHandle').value.trim();
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    const msgDiv = document.getElementById('advertiser-message');
    
    if (!businessName || !email) {
        this.showMessage(msgDiv, 'Business name and email are required', 'error');
        return;
    }
    
    this.showMessage(msgDiv, 'Registering...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/api/ads/register-advertiser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessName,
                email,
                phone: phone || null,
                instagramHandle: instagramHandle || null,
                websiteUrl: websiteUrl || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.showMessage(msgDiv, '✅ Registration successful! You can now create ad campaigns.', 'success');
            
            // Save advertiser ID
            localStorage.setItem('advertiserId', data.advertiserId);
            
            setTimeout(() => this.showCreateCampaign(), 2000);
        } else {
            this.showMessage(msgDiv, data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('[ADS] Registration error:', error);
        this.showMessage(msgDiv, 'Registration failed. Please try again.', 'error');
    }
}
```

### **3. Create Campaign Page**

```javascript
showCreateCampaign() {
    const advertiserId = localStorage.getItem('advertiserId');
    
    if (!advertiserId) {
        this.showAdvertiserSignup();
        return;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-100 p-4">
            <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-6">Create Ad Campaign</h1>
                    
                    <div id="campaign-message" class="hidden mb-4 p-3 rounded-lg"></div>
                    
                    <form id="campaignForm" class="space-y-6">
                        <!-- Campaign Name -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Campaign Name *
                            </label>
                            <input 
                                type="text"
                                id="campaignName"
                                placeholder="e.g., Christmas Sale 2025"
                                class="w-full px-4 py-3 border rounded-lg"
                                required
                            />
                        </div>
                        
                        <!-- Ad Image -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ad Image URL *
                            </label>
                            <input 
                                type="url"
                                id="adImageUrl"
                                placeholder="https://yourcdn.com/ad-image.jpg"
                                class="w-full px-4 py-3 border rounded-lg"
                                required
                            />
                            <p class="text-xs text-gray-500 mt-1">Recommended: 320x100px, max 200KB</p>
                        </div>
                        
                        <!-- Ad Title -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ad Title * (max 50 characters)
                            </label>
                            <input 
                                type="text"
                                id="adTitle"
                                maxlength="50"
                                placeholder="Get 50% Off This Christmas!"
                                class="w-full px-4 py-3 border rounded-lg"
                                required
                            />
                        </div>
                        
                        <!-- Ad Description -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ad Description (max 100 characters)
                            </label>
                            <textarea 
                                id="adDescription"
                                maxlength="100"
                                rows="2"
                                placeholder="Shop now and save big on all items"
                                class="w-full px-4 py-3 border rounded-lg"
                            ></textarea>
                        </div>
                        
                        <!-- Destination Type -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Where should the ad link to? *
                            </label>
                            <div class="grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    id="instagramBtn"
                                    onclick="app.selectDestination('instagram')"
                                    class="p-4 border-2 rounded-lg text-center hover:border-purple-600 hover:bg-purple-50 transition-all"
                                >
                                    <i class="fab fa-instagram text-3xl text-pink-600 mb-2"></i>
                                    <p class="font-semibold">Instagram Profile</p>
                                </button>
                                
                                <button 
                                    type="button"
                                    id="websiteBtn"
                                    onclick="app.selectDestination('website')"
                                    class="p-4 border-2 rounded-lg text-center hover:border-purple-600 hover:bg-purple-50 transition-all"
                                >
                                    <i class="fas fa-globe text-3xl text-blue-600 mb-2"></i>
                                    <p class="font-semibold">Website URL</p>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Instagram Handle (hidden by default) -->
                        <div id="instagramSection" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Instagram Handle *
                            </label>
                            <div class="flex">
                                <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">@</span>
                                <input 
                                    type="text"
                                    id="campaignInstagram"
                                    placeholder="yourbusiness"
                                    class="flex-1 px-4 py-3 border rounded-r-lg"
                                />
                            </div>
                        </div>
                        
                        <!-- Website URL (hidden by default) -->
                        <div id="websiteSection" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Website URL *
                            </label>
                            <input 
                                type="url"
                                id="campaignWebsite"
                                placeholder="https://yourbusiness.com/sale"
                                class="w-full px-4 py-3 border rounded-lg"
                            />
                        </div>
                        
                        <!-- Pricing Model -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Pricing Model *
                            </label>
                            <select 
                                id="pricingModel"
                                class="w-full px-4 py-3 border rounded-lg"
                                required
                            >
                                <option value="cpm">CPM - Pay per 1000 impressions (₦200 CPM)</option>
                                <option value="cpc">CPC - Pay per click (₦10 per click)</option>
                            </select>
                        </div>
                        
                        <!-- Budget -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Campaign Budget * (minimum ₦2,000)
                            </label>
                            <div class="flex">
                                <span class="px-4 py-3 bg-gray-100 border border-r-0 rounded-l-lg">₦</span>
                                <input 
                                    type="number"
                                    id="budgetTotal"
                                    min="2000"
                                    step="1000"
                                    placeholder="10000"
                                    class="flex-1 px-4 py-3 border rounded-r-lg"
                                    required
                                />
                            </div>
                            
                            <div id="budgetEstimate" class="mt-2 p-3 bg-purple-50 rounded-lg">
                                <p class="text-sm text-purple-800">
                                    <strong>Estimated Reach:</strong> Select pricing model to see estimate
                                </p>
                            </div>
                        </div>
                        
                        <!-- Submit Button -->
                        <button 
                            type="submit"
                            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Create Campaign & Pay
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('pricingModel').addEventListener('change', this.updateBudgetEstimate.bind(this));
    document.getElementById('budgetTotal').addEventListener('input', this.updateBudgetEstimate.bind(this));
    document.getElementById('campaignForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateCampaign();
    });
}

selectDestination(type) {
    const instagramBtn = document.getElementById('instagramBtn');
    const websiteBtn = document.getElementById('websiteBtn');
    const instagramSection = document.getElementById('instagramSection');
    const websiteSection = document.getElementById('websiteSection');
    
    if (type === 'instagram') {
        instagramBtn.classList.add('border-purple-600', 'bg-purple-50');
        websiteBtn.classList.remove('border-purple-600', 'bg-purple-50');
        instagramSection.classList.remove('hidden');
        websiteSection.classList.add('hidden');
        this.selectedDestination = 'instagram';
    } else {
        websiteBtn.classList.add('border-purple-600', 'bg-purple-50');
        instagramBtn.classList.remove('border-purple-600', 'bg-purple-50');
        websiteSection.classList.remove('hidden');
        instagramSection.classList.add('hidden');
        this.selectedDestination = 'website';
    }
}

updateBudgetEstimate() {
    const pricingModel = document.getElementById('pricingModel').value;
    const budget = parseFloat(document.getElementById('budgetTotal').value) || 0;
    const estimateDiv = document.getElementById('budgetEstimate');
    
    if (budget < 2000) {
        estimateDiv.innerHTML = '<p class="text-sm text-red-600">Minimum budget is ₦2,000</p>';
        return;
    }
    
    let estimate = '';
    
    if (pricingModel === 'cpm') {
        const impressions = (budget / 200) * 1000;
        const estimatedClicks = impressions * 0.02; // 2% CTR estimate
        estimate = `
            <p class="text-sm text-purple-800">
                <strong>Estimated Reach:</strong><br>
                • ~${impressions.toLocaleString()} impressions<br>
                • ~${Math.floor(estimatedClicks)} clicks (2% CTR)<br>
                • Cost: ₦${(budget / impressions * 1000).toFixed(2)} per 1000 impressions
            </p>
        `;
    } else {
        const clicks = budget / 10;
        estimate = `
            <p class="text-sm text-purple-800">
                <strong>Estimated Reach:</strong><br>
                • Up to ${Math.floor(clicks)} clicks<br>
                • Cost: ₦10 per click<br>
                • Actual impressions depend on CTR
            </p>
        `;
    }
    
    estimateDiv.innerHTML = estimate;
}

async handleCreateCampaign() {
    const advertiserId = localStorage.getItem('advertiserId');
    const msgDiv = document.getElementById('campaign-message');
    
    const campaignData = {
        advertiserId,
        campaignName: document.getElementById('campaignName').value.trim(),
        adImageUrl: document.getElementById('adImageUrl').value.trim(),
        adTitle: document.getElementById('adTitle').value.trim(),
        adDescription: document.getElementById('adDescription').value.trim(),
        destinationType: this.selectedDestination,
        instagramHandle: document.getElementById('campaignInstagram')?.value.trim(),
        websiteUrl: document.getElementById('campaignWebsite')?.value.trim(),
        pricingModel: document.getElementById('pricingModel').value,
        budgetTotal: parseFloat(document.getElementById('budgetTotal').value)
    };
    
    // Validation
    if (!campaignData.destinationType) {
        this.showMessage(msgDiv, 'Please select where your ad should link to', 'error');
        return;
    }
    
    if (campaignData.destinationType === 'instagram' && !campaignData.instagramHandle) {
        this.showMessage(msgDiv, 'Instagram handle is required', 'error');
        return;
    }
    
    if (campaignData.destinationType === 'website' && !campaignData.websiteUrl) {
        this.showMessage(msgDiv, 'Website URL is required', 'error');
        return;
    }
    
    this.showMessage(msgDiv, 'Creating campaign...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/api/ads/create-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            this.showMessage(msgDiv, '✅ Campaign created successfully!', 'success');
            
            // Redirect to payment
            if (data.paymentRequired) {
                setTimeout(() => {
                    this.showCampaignPayment(data.campaignId, data.paymentAmount);
                }, 1500);
            }
        } else {
            this.showMessage(msgDiv, data.error || 'Campaign creation failed', 'error');
        }
    } catch (error) {
        console.error('[ADS] Create campaign error:', error);
        this.showMessage(msgDiv, 'Campaign creation failed. Please try again.', 'error');
    }
}
```

---

## 📊 Admin Dashboard

Create an admin panel to manage ads:

```javascript
showAdminDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gray-100 p-4">
            <div class="max-w-6xl mx-auto">
                <h1 class="text-3xl font-bold text-gray-800 mb-6">Ad Management Dashboard</h1>
                
                <!-- Pending Approval -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Pending Campaigns</h2>
                    <div id="pending-campaigns">Loading...</div>
                </div>
                
                <!-- Active Campaigns -->
                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 class="text-xl font-semibold mb-4">Active Campaigns</h2>
                    <div id="active-campaigns">Loading...</div>
                </div>
                
                <!-- Revenue Stats -->
                <div class="grid grid-cols-3 gap-4">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-600 mb-2">Total Revenue</h3>
                        <p class="text-3xl font-bold text-green-600">₦0</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-600 mb-2">Active Campaigns</h3>
                        <p class="text-3xl font-bold text-blue-600">0</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-gray-600 mb-2">Total Impressions</h3>
                        <p class="text-3xl font-bold text-purple-600">0</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    this.loadAdminCampaigns();
}
```

---

## 💳 Payment Integration

Use existing Paystack integration to accept campaign payments:

```javascript
async showCampaignPayment(campaignId, amount) {
    // Initialize Paystack payment
    const response = await fetch(`${API_BASE}/api/payments/naira/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'advertiser@email.com',
            amount: amount * 100, // Convert to kobo
            campaignId
        })
    });
    
    const data = await response.json();
    
    if (data.success && data.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = data.authorizationUrl;
    }
}
```

---

## 📈 Revenue Projections (Ad System)

### **Scenario 1: Conservative** (1,000 active users)
- 5% advertiser adoption (50 businesses)
- Average campaign: ₦5,000
- Monthly revenue: ₦250,000

### **Scenario 2: Growth** (10,000 active users)
- 10% advertiser adoption (1,000 businesses)
- Average campaign: ₦10,000  
- Monthly revenue: ₦10,000,000

### **Scenario 3: Scale** (100,000 active users)
- 15% advertiser adoption (15,000 businesses)
- Average campaign: ₦15,000
- Monthly revenue: ₦225,000,000 (~$290,000 USD)

---

## ✅ Implementation Checklist

### **Week 1: Database & Backend**
- [ ] Create migration file (0012_advertising_system.sql)
- [ ] Apply migration to local database
- [ ] Implement all backend API endpoints
- [ ] Test APIs with Postman/curl

### **Week 2: Frontend**
- [ ] Add ad banner display component
- [ ] Create advertiser registration page
- [ ] Create campaign creation page
- [ ] Add impression/click tracking
- [ ] Test complete flow

### **Week 3: Payment & Admin**
- [ ] Integrate Paystack for ad payments
- [ ] Build admin dashboard
- [ ] Add campaign approval workflow
- [ ] Test payment flow

### **Week 4: Launch**
- [ ] Deploy to production
- [ ] Create advertiser onboarding guide
- [ ] Launch marketing campaign
- [ ] Monitor first campaigns

---

## 🎉 Summary

You now have a **complete self-service ad platform** where:

✅ **Advertisers** can:
- Register their business
- Create campaigns with custom images & copy
- Choose Instagram OR website destination
- Set budget (CPM or CPC pricing)
- Track real-time analytics

✅ **You earn** revenue from:
- Campaign budgets (100% of ad spend goes to you)
- No third-party ad networks needed
- Direct relationship with advertisers

✅ **Users** see:
- Non-intrusive bottom banner ads
- Only 1 ad at a time
- Can close anytime
- Relevant Nigerian businesses

**Expected Revenue:**
- 1,000 users → ₦250,000/month
- 10,000 users → ₦10,000,000/month
- 100,000 users → ₦225,000,000/month

**Next Steps:**
1. Create database migration
2. Implement backend APIs
3. Build frontend components
4. Launch beta with 10 test advertisers
5. Scale! 🚀

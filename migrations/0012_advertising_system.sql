-- Migration: Advertising System
-- Creates tables for self-service ad platform with Instagram/Website redirect

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
  cpm_rate REAL DEFAULT 200,
  cpc_rate REAL DEFAULT 10,
  
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Campaign status
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'paused', 'completed', 'rejected')),
  
  -- Scheduling
  start_date DATETIME,
  end_date DATETIME,
  
  -- Targeting
  target_users TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (advertiser_id) REFERENCES advertisers(id)
);

-- Ad impressions tracking
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
  payment_method TEXT,
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
CREATE INDEX IF NOT EXISTS idx_ad_payments_campaign ON ad_payments(campaign_id);

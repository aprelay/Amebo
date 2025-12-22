-- Create test advertiser
INSERT INTO advertisers (id, email, business_name, phone, website_url, created_at)
VALUES ('adv-test-001', 'advertiser@amebo.com', 'Amebo Marketing', '+234-800-AMEBO', 'https://amebo.com', CURRENT_TIMESTAMP);

-- Create multiple active ad campaigns

-- Campaign 1: Get More Tokens
INSERT INTO ad_campaigns (
    id, advertiser_id, campaign_name, ad_image_url, ad_title, ad_description,
    destination_type, website_url, pricing_model, budget_total, budget_spent,
    cpm_rate, status, start_date, end_date, created_at
) VALUES (
    'camp-001',
    'adv-test-001',
    'Get More Tokens Campaign',
    'https://via.placeholder.com/800x400/4F46E5/ffffff?text=Get+More+Tokens!',
    '🎁 Get 500 FREE Tokens!',
    'Complete simple tasks and earn tokens. Start earning now!',
    'website',
    'https://amebo.com/earn-tokens',
    'cpm',
    5000,
    0,
    200,
    'active',
    CURRENT_TIMESTAMP,
    datetime('now', '+30 days'),
    CURRENT_TIMESTAMP
);

-- Campaign 2: Premium Features
INSERT INTO ad_campaigns (
    id, advertiser_id, campaign_name, ad_image_url, ad_title, ad_description,
    destination_type, website_url, pricing_model, budget_total, budget_spent,
    cpm_rate, status, start_date, end_date, created_at
) VALUES (
    'camp-002',
    'adv-test-001',
    'Premium Features',
    'https://via.placeholder.com/800x400/10B981/ffffff?text=Go+Premium',
    '⭐ Unlock Premium Features',
    'Get unlimited storage, custom themes, and priority support!',
    'website',
    'https://amebo.com/premium',
    'cpm',
    3000,
    0,
    200,
    'active',
    CURRENT_TIMESTAMP,
    datetime('now', '+30 days'),
    CURRENT_TIMESTAMP
);

-- Campaign 3: Invite Friends
INSERT INTO ad_campaigns (
    id, advertiser_id, campaign_name, ad_image_url, ad_title, ad_description,
    destination_type, website_url, pricing_model, budget_total, budget_spent,
    cpm_rate, status, start_date, end_date, created_at
) VALUES (
    'camp-003',
    'adv-test-001',
    'Invite & Earn',
    'https://via.placeholder.com/800x400/F59E0B/ffffff?text=Invite+Friends',
    '👥 Invite Friends, Earn Tokens!',
    'Earn 100 tokens for each friend who joins. No limit!',
    'website',
    'https://amebo.com/invite',
    'cpm',
    2000,
    0,
    200,
    'active',
    CURRENT_TIMESTAMP,
    datetime('now', '+30 days'),
    CURRENT_TIMESTAMP
);

-- Campaign 4: Data Plans
INSERT INTO ad_campaigns (
    id, advertiser_id, campaign_name, ad_image_url, ad_title, ad_description,
    destination_type, website_url, pricing_model, budget_total, budget_spent,
    cpc_rate, status, start_date, end_date, created_at
) VALUES (
    'camp-004',
    'adv-test-001',
    'Buy Data Plans',
    'https://via.placeholder.com/800x400/EF4444/ffffff?text=Buy+Data+Now',
    '📱 Buy Data with Tokens!',
    'Convert your tokens to mobile data. All networks supported!',
    'website',
    'https://amebo.com/buy-data',
    'cpc',
    4000,
    0,
    10,
    'active',
    CURRENT_TIMESTAMP,
    datetime('now', '+30 days'),
    CURRENT_TIMESTAMP
);

-- Campaign 5: Security Tips
INSERT INTO ad_campaigns (
    id, advertiser_id, campaign_name, ad_image_url, ad_title, ad_description,
    destination_type, website_url, pricing_model, budget_total, budget_spent,
    cpm_rate, status, start_date, end_date, created_at
) VALUES (
    'camp-005',
    'adv-test-001',
    'Security Tips',
    'https://via.placeholder.com/800x400/8B5CF6/ffffff?text=Stay+Safe',
    '🔒 Keep Your Chats Secure',
    'Learn about E2E encryption and security best practices.',
    'website',
    'https://amebo.com/security-tips',
    'cpm',
    1500,
    0,
    200,
    'active',
    CURRENT_TIMESTAMP,
    datetime('now', '+30 days'),
    CURRENT_TIMESTAMP
);

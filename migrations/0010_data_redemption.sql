-- Migration 0010: Data Redemption System for Nigerian Users
-- MTN, Airtel, Glo, 9mobile data bundles

-- Data redemption table
CREATE TABLE IF NOT EXISTS data_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  network TEXT NOT NULL,
  data_plan TEXT NOT NULL,
  data_amount TEXT NOT NULL,
  token_cost INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  api_reference TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_data_redemptions_user ON data_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_data_redemptions_status ON data_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_data_redemptions_created ON data_redemptions(created_at);

-- Data plans catalog
CREATE TABLE IF NOT EXISTS data_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  network TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  data_amount TEXT NOT NULL,
  validity TEXT NOT NULL,
  token_cost INTEGER NOT NULL,
  description TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Nigerian data plans
-- MTN Data Plans
INSERT INTO data_plans (network, plan_code, data_amount, validity, token_cost, description) VALUES
('MTN', 'mtn_100mb', '100MB', '1 day', 50, 'MTN 100MB Daily Plan'),
('MTN', 'mtn_500mb', '500MB', '7 days', 200, 'MTN 500MB Weekly Plan'),
('MTN', 'mtn_1gb', '1GB', '30 days', 350, 'MTN 1GB Monthly Plan'),
('MTN', 'mtn_2gb', '2GB', '30 days', 650, 'MTN 2GB Monthly Plan'),
('MTN', 'mtn_5gb', '5GB', '30 days', 1500, 'MTN 5GB Monthly Plan');

-- Airtel Data Plans
INSERT INTO data_plans (network, plan_code, data_amount, validity, token_cost, description) VALUES
('Airtel', 'airtel_100mb', '100MB', '1 day', 50, 'Airtel 100MB Daily Plan'),
('Airtel', 'airtel_500mb', '500MB', '7 days', 200, 'Airtel 500MB Weekly Plan'),
('Airtel', 'airtel_1gb', '1GB', '30 days', 350, 'Airtel 1GB Monthly Plan'),
('Airtel', 'airtel_2gb', '2GB', '30 days', 650, 'Airtel 2GB Monthly Plan'),
('Airtel', 'airtel_5gb', '5GB', '30 days', 1500, 'Airtel 5GB Monthly Plan');

-- Glo Data Plans
INSERT INTO data_plans (network, plan_code, data_amount, validity, token_cost, description) VALUES
('Glo', 'glo_100mb', '100MB', '1 day', 50, 'Glo 100MB Daily Plan'),
('Glo', 'glo_500mb', '500MB', '7 days', 200, 'Glo 500MB Weekly Plan'),
('Glo', 'glo_1gb', '1GB', '30 days', 350, 'Glo 1GB Monthly Plan'),
('Glo', 'glo_2gb', '2GB', '30 days', 650, 'Glo 2GB Monthly Plan'),
('Glo', 'glo_5gb', '5GB', '30 days', 1500, 'Glo 5GB Monthly Plan');

-- 9mobile Data Plans
INSERT INTO data_plans (network, plan_code, data_amount, validity, token_cost, description) VALUES
('9mobile', '9mobile_100mb', '100MB', '1 day', 50, '9mobile 100MB Daily Plan'),
('9mobile', '9mobile_500mb', '500MB', '7 days', 200, '9mobile 500MB Weekly Plan'),
('9mobile', '9mobile_1gb', '1GB', '30 days', 350, '9mobile 1GB Monthly Plan'),
('9mobile', '9mobile_2gb', '2GB', '30 days', 650, '9mobile 2GB Monthly Plan'),
('9mobile', '9mobile_5gb', '5GB', '30 days', 1500, '9mobile 5GB Monthly Plan');

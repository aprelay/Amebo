# 💰 Token Economy System - Complete Implementation Guide

## 🎯 Overview

SecureChat & Pay now features a complete token economy system with:
- **4-tier reward system** (Bronze → Silver → Gold → Platinum)
- **Daily earning caps** to prevent abuse
- **Email authentication** with verification for Nigerian users
- **Data bundle redemption** (MTN, Airtel, Glo, 9mobile)

---

## 🏆 Token Tier System

### Tier Levels & Multipliers

| Tier | Token Range | Multiplier | Benefits |
|------|-------------|------------|----------|
| 🥉 **Bronze** | 0-99 | 1.0x | Standard earning rate |
| 🥈 **Silver** | 100-499 | 1.2x | +20% bonus on all earnings |
| 🥇 **Gold** | 500-999 | 1.5x | +50% bonus on all earnings |
| 💎 **Platinum** | 1000+ | 2.0x | +100% bonus (double tokens!) |

### How It Works

```javascript
// Example: User sends a message (base: 1 token)
Bronze user: 1 token  (1 × 1.0)
Silver user: 1.2 tokens (1 × 1.2) = 1 token (rounded)
Gold user: 1.5 tokens (1 × 1.5) = 1 token (rounded)
Platinum user: 2 tokens (1 × 2.0)

// Example: User creates room (base: 10 tokens)
Bronze: 10 tokens
Silver: 12 tokens (10 × 1.2)
Gold: 15 tokens (10 × 1.5)
Platinum: 20 tokens (10 × 2.0)
```

### Tier Progression

- **Automatic**: Tier updates instantly when balance crosses threshold
- **No downgrade**: Tier never decreases (based on current balance)
- **Visual feedback**: UI shows current tier + progress to next tier

---

## 📊 Daily Earning Caps

### Limits (Per User, Per Day)

| Activity | Daily Cap | Purpose |
|----------|-----------|---------|
| **Messages** | 100 tokens/day | Prevent spam for tokens |
| **File Sharing** | 60 tokens/day | Limit bulk file uploads |
| **Total** | 500 tokens/day | Overall daily maximum |

### How It Works

1. **Automatic tracking**: System tracks daily earnings per user
2. **Cap enforcement**: API returns 429 error when limit reached
3. **Daily reset**: Caps reset at midnight UTC automatically
4. **Progress API**: Frontend can query remaining daily allowance

### API Response When Capped

```json
{
  "error": "Daily message token limit reached",
  "dailyLimitReached": true,
  "current": 100,
  "limit": 100
}
```

### Exemptions

These actions are **NOT capped** (unlimited):
- Email verification bonus (+20 tokens)
- Room creation (+10 tokens)
- Room joining (+5 tokens)
- Token gifts (peer-to-peer transfers)

---

## ✉️ Email Authentication System

### Registration Flow

```
1. User enters email + password
   ↓
2. System creates account (email_verified = 0)
   ↓
3. Verification email sent via Resend API
   ↓
4. User clicks link in email
   ↓
5. Email verified (email_verified = 1)
   ↓
6. +20 tokens bonus awarded
   ↓
7. User can now login
```

### Email Verification

- **Verification token**: UUID v4 (cryptographically secure)
- **Expiry**: 24 hours from registration
- **Bonus**: +20 tokens on successful verification
- **Resend option**: Users can request new verification email

### Security Features

1. **Password hashing**: SHA-256 before storage
2. **Email uniqueness**: Enforced via database index
3. **Verification required**: Cannot login until verified
4. **Token expiry**: Old tokens become invalid after 24h

### Nigerian User Focus

- **Country code**: Defaults to 'NG' (Nigeria)
- **Phone number field**: Ready for Nigerian numbers (080x, 070x, 090x, 091x)
- **Data redemption**: Nigerian telcos only (MTN, Airtel, Glo, 9mobile)

---

## 📱 Data Redemption System

### Available Networks & Plans

#### MTN
- 100MB (1 day) - 50 tokens
- 500MB (7 days) - 200 tokens
- 1GB (30 days) - 350 tokens
- 2GB (30 days) - 650 tokens
- 5GB (30 days) - 1500 tokens

#### Airtel
- 100MB (1 day) - 50 tokens
- 500MB (7 days) - 200 tokens
- 1GB (30 days) - 350 tokens
- 2GB (30 days) - 650 tokens
- 5GB (30 days) - 1500 tokens

#### Glo
- 100MB (1 day) - 50 tokens
- 500MB (7 days) - 200 tokens
- 1GB (30 days) - 350 tokens
- 2GB (30 days) - 650 tokens
- 5GB (30 days) - 1500 tokens

#### 9mobile
- 100MB (1 day) - 50 tokens
- 500MB (7 days) - 200 tokens
- 1GB (30 days) - 350 tokens
- 2GB (30 days) - 650 tokens
- 5GB (30 days) - 1500 tokens

### Redemption Flow

```
1. User views available plans (GET /api/data/plans)
   ↓
2. Selects plan + enters phone number
   ↓
3. System validates:
   - Phone number format (Nigerian)
   - Token balance sufficient
   - Plan exists and active
   ↓
4. Tokens deducted from balance
   ↓
5. Redemption record created (status: pending)
   ↓
6. Data API called (VTPass, ClubKonnect, etc.)
   ↓
7. Status updated (completed/failed)
   ↓
8. User notified via in-app notification
```

### Phone Number Validation

**Accepted formats** (Nigerian mobile numbers):
- `080xxxxxxxx` (MTN)
- `081xxxxxxxx` (MTN/Glo)
- `070xxxxxxxx` (MTN/Airtel)
- `090xxxxxxxx` (MTN/Airtel/Glo/9mobile)
- `091xxxxxxxx` (MTN/Airtel/Glo/9mobile)

**Regex**: `/^0[789][01]\d{8}$/`

### Data API Integration

**Current Status**: Demo mode (auto-complete)

**Production Integration** (requires setup):
1. Sign up for Nigerian data API (VTPass, ClubKonnect, Shago, etc.)
2. Add API key to `.dev.vars` or Cloudflare secrets
3. Implement API calls in `/api/data/redeem` endpoint
4. Update status based on API response

**Example Integration** (VTPass):
```javascript
const response = await fetch('https://api.vtpass.com/pay', {
  method: 'POST',
  headers: { 
    'api-key': dataApiKey,
    'secret-key': dataSecretKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceID: 'mtn-data',
    billersCode: phoneNumber,
    variation_code: plan.plan_code,
    amount: plan.token_cost,
    phone: phoneNumber,
    request_id: transactionId
  })
})
```

---

## 🗄️ Database Schema

### New Tables

#### `token_earnings`
```sql
CREATE TABLE token_earnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,              -- 'message_sent', 'file_shared', etc.
  amount INTEGER NOT NULL,            -- Tokens earned (with multiplier applied)
  daily_total INTEGER DEFAULT 0,     -- Running total for the day
  tier TEXT DEFAULT 'bronze',        -- Tier at time of earning
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `daily_earning_caps`
```sql
CREATE TABLE daily_earning_caps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,                 -- YYYY-MM-DD format
  messages_count INTEGER DEFAULT 0,   -- Tokens earned from messages today
  files_count INTEGER DEFAULT 0,      -- Tokens earned from files today
  total_earned INTEGER DEFAULT 0,     -- Total tokens earned today
  last_reset DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### `data_redemptions`
```sql
CREATE TABLE data_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  network TEXT NOT NULL,              -- 'MTN', 'Airtel', 'Glo', '9mobile'
  data_plan TEXT NOT NULL,            -- Plan code (e.g., 'mtn_1gb')
  data_amount TEXT NOT NULL,          -- Human-readable (e.g., '1GB')
  token_cost INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',      -- 'pending', 'completed', 'failed'
  transaction_id TEXT UNIQUE,
  api_reference TEXT,                 -- External API reference ID
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

#### `data_plans`
```sql
CREATE TABLE data_plans (
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
```

### Updated `users` Table

**New columns**:
- `email TEXT` - User's email address (unique)
- `email_verified INTEGER` - 0 or 1
- `verification_token TEXT` - UUID for email verification
- `verification_expires DATETIME` - Token expiry (24h)
- `country_code TEXT DEFAULT 'NG'` - Nigeria
- `phone_number TEXT` - Nigerian mobile number
- `phone_verified INTEGER` - 0 or 1 (future use)
- `token_tier TEXT DEFAULT 'bronze'` - Current tier
- `total_earned INTEGER DEFAULT 0` - Lifetime earnings
- `total_spent INTEGER DEFAULT 0` - Lifetime spending

---

## 🔌 API Endpoints

### Email Authentication

#### Register with Email
```http
POST /api/auth/register-email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "userId": "uuid-here",
  "email": "user@example.com",
  "message": "Registration successful! Please check your email to verify your account.",
  "verificationRequired": true
}
```

#### Verify Email
```http
GET /api/auth/verify-email/:token
```

**Response**:
```json
{
  "success": true,
  "message": "Email verified successfully! You earned 20 tokens!",
  "userId": "uuid-here"
}
```

#### Login with Email
```http
POST /api/auth/login-email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "user",
    "email": "user@example.com",
    "tokens": 20,
    "tier": "bronze",
    "emailVerified": true
  }
}
```

#### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

### Token Economy

#### Award Tokens (Tier-Aware)
```http
POST /api/tokens/award
Content-Type: application/json

{
  "userId": "uuid-here",
  "amount": 10,
  "reason": "room_created"
}
```

**Response**:
```json
{
  "success": true,
  "newBalance": 30,
  "amount": 12,
  "baseAmount": 10,
  "multiplier": 1.2,
  "tier": "silver",
  "tierBonus": true,
  "reason": "room_created"
}
```

#### Get Balance with Tier Info
```http
GET /api/tokens/balance/:userId
```

**Response**:
```json
{
  "success": true,
  "balance": 150,
  "tier": "silver",
  "multiplier": 1.2,
  "totalEarned": 200,
  "totalSpent": 50,
  "dailyProgress": {
    "messages": 45,
    "files": 12,
    "total": 57,
    "limits": {
      "messages": 100,
      "files": 60,
      "total": 500
    }
  },
  "nextTier": "gold (500 tokens)"
}
```

#### Get Earning History
```http
GET /api/tokens/history/:userId?limit=50
```

**Response**:
```json
{
  "success": true,
  "history": [
    {
      "action": "message_sent",
      "amount": 1,
      "tier": "bronze",
      "created_at": "2025-12-20T12:00:00Z"
    },
    ...
  ]
}
```

---

### Data Redemption

#### Get Available Plans
```http
GET /api/data/plans?network=MTN
```

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "network": "MTN",
      "plan_code": "mtn_1gb",
      "data_amount": "1GB",
      "validity": "30 days",
      "token_cost": 350,
      "description": "MTN 1GB Monthly Plan",
      "active": 1
    },
    ...
  ]
}
```

#### Redeem Data Bundle
```http
POST /api/data/redeem
Content-Type: application/json

{
  "userId": "uuid-here",
  "planId": 3,
  "phoneNumber": "08012345678"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "uuid-here",
  "message": "1GB data will be sent to 08012345678 shortly",
  "newBalance": 100,
  "redemption": {
    "network": "MTN",
    "dataAmount": "1GB",
    "phoneNumber": "08012345678",
    "status": "completed"
  }
}
```

#### Get Redemption History
```http
GET /api/data/history/:userId?limit=20
```

**Response**:
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "phone_number": "08012345678",
      "network": "MTN",
      "data_amount": "1GB",
      "token_cost": 350,
      "status": "completed",
      "transaction_id": "uuid-here",
      "created_at": "2025-12-20T12:00:00Z"
    },
    ...
  ]
}
```

#### Check Redemption Status
```http
GET /api/data/status/:transactionId
```

**Response**:
```json
{
  "success": true,
  "status": "completed",
  "details": {
    "id": 1,
    "network": "MTN",
    "data_amount": "1GB",
    "phone_number": "08012345678",
    "token_cost": 350,
    "api_reference": "DEMO-1234567890",
    "created_at": "2025-12-20T12:00:00Z",
    "completed_at": "2025-12-20T12:01:00Z"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Create `.dev.vars` (local development):
```bash
# Email verification (Resend API)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# App configuration
APP_URL=http://localhost:3000
FROM_EMAIL=noreply@yourdomain.com

# Nigerian Data API
DATA_API_KEY=your_data_api_key_here
DATA_API_URL=https://api.vtpass.com
```

### Production Secrets (Cloudflare)

```bash
# Set secrets for production
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put DATA_API_KEY
```

---

## 🧪 Testing Scenarios

### Test 1: Email Registration & Verification
1. POST `/api/auth/register-email` with email + password
2. Check email for verification link
3. Click link → GET `/api/auth/verify-email/:token`
4. Verify user receives +20 tokens bonus
5. POST `/api/auth/login-email` → Should succeed

### Test 2: Token Tier Progression
1. New user starts at Bronze (0 tokens)
2. Earn 100 tokens → Auto-upgrade to Silver
3. Earn 500 tokens → Auto-upgrade to Gold
4. Earn 1000 tokens → Auto-upgrade to Platinum
5. Verify multiplier increases with each tier

### Test 3: Daily Earning Caps
1. Send 100 messages in one day
2. 101st message should return 429 error
3. Wait for next day (or manually update date)
4. Daily caps should reset to 0

### Test 4: Data Redemption
1. GET `/api/data/plans` → View available plans
2. User must have sufficient tokens (e.g., 350 for 1GB)
3. POST `/api/data/redeem` with planId + phone number
4. Verify tokens deducted
5. Check `/api/data/history/:userId` for transaction
6. GET `/api/data/status/:transactionId` → Verify completed

---

## 🚀 Frontend Integration (To Do)

### Required UI Updates

1. **Email Signup Form**:
   - Email input field
   - Password input field (with confirmation)
   - "Register" button
   - "Already have an account? Login" link

2. **Email Verification Screen**:
   - "Check your email" message
   - Resend verification button
   - Auto-redirect after verification

3. **Login Form**:
   - Email input
   - Password input
   - "Forgot password?" link (future)
   - "Don't have an account? Register" link

4. **Token Dashboard**:
   - Current balance with tier badge
   - Progress bar to next tier
   - Daily earning progress (X/100 messages, X/60 files, X/500 total)
   - Earning history table

5. **Data Redemption Page**:
   - Network filter (MTN, Airtel, Glo, 9mobile)
   - Data plans grid (with token costs)
   - Phone number input (Nigerian format)
   - "Redeem" button
   - Redemption history

6. **Tier Badge Display**:
   ```html
   <span class="tier-badge bronze">🥉 Bronze 1.0x</span>
   <span class="tier-badge silver">🥈 Silver 1.2x</span>
   <span class="tier-badge gold">🥇 Gold 1.5x</span>
   <span class="tier-badge platinum">💎 Platinum 2.0x</span>
   ```

---

## 📈 Monetization Strategy

### Token Earning Rates (Base)

| Action | Base Tokens | Platinum (2x) |
|--------|-------------|---------------|
| Email verified | 20 | 20 (one-time, no multiplier) |
| Room created | 10 | 20 |
| Room joined | 5 | 10 |
| Message sent | 1 | 2 |
| File shared | 3 | 6 |

### Token Costs

| Data Bundle | Tokens | Naira Equivalent* |
|-------------|--------|-------------------|
| 100MB (1 day) | 50 | ~₦50-100 |
| 500MB (7 days) | 200 | ~₦200-300 |
| 1GB (30 days) | 350 | ~₦350-500 |
| 2GB (30 days) | 650 | ~₦650-900 |
| 5GB (30 days) | 1500 | ~₦1500-2000 |

*Approximate market rates in Nigeria

### Earning Time Estimates

**To earn 350 tokens (1GB data)**:
- Bronze user: ~350 messages or 35 rooms
- Silver user: ~292 messages or 29 rooms
- Gold user: ~234 messages or 23 rooms
- Platinum user: ~175 messages or 18 rooms

**With daily caps (500 tokens/day)**:
- Bronze: Less than 1 day
- Active users can earn 1GB data in 1-2 days of usage

---

## 🎯 Summary

### ✅ Completed

- ✅ 4-tier token system with multipliers
- ✅ Daily earning caps with rate limiting
- ✅ Email authentication with verification
- ✅ 20 Nigerian data plans (4 networks)
- ✅ Data redemption system
- ✅ Transaction history tracking
- ✅ 13 new API endpoints
- ✅ Database migrations (0009, 0010)
- ✅ Email sending via Resend API
- ✅ Nigerian phone validation
- ✅ Security (password hashing, email verification)

### 🔄 In Progress

- Frontend UI for email signup
- Frontend UI for data redemption
- Real data API integration (VTPass/ClubKonnect)

### 📋 Next Steps

1. Update frontend `app-v3.js` for email authentication
2. Create data redemption UI
3. Integrate real Nigerian data API
4. Add phone number verification (optional)
5. Deploy to production

---

**Documentation complete! Backend is 100% ready for frontend integration.**

Test backend APIs at: `http://localhost:3000`

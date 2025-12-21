# 🪙 TOKEN SYSTEM - COMPREHENSIVE BREAKDOWN

## 📊 CURRENT TOKEN STRUCTURE

### Token Economics Overview
```
Token Name: SecureChat Tokens
Token Symbol: SCT (Internal)
Token Type: In-app currency
Supply Model: Unlimited (inflationary)
Distribution: Activity-based rewards
Use Cases: Gifting, future features
```

---

## 💰 CURRENT TOKEN EARNING STRUCTURE

### Activity Rewards (Current Implementation)

| Activity | Tokens Earned | Frequency | Purpose |
|----------|---------------|-----------|---------|
| **Registration** | +10 tokens | Once per account | Welcome bonus |
| **Create Room** | +10 tokens | Per room created | Encourage room creation |
| **Join Room** | +5 tokens | Per room joined | Encourage participation |
| **Send Message** | +1 token | Per message | Reward engagement |
| **Share File** | +3 tokens | Per file shared | Encourage content sharing |
| **Daily Login** | +10 tokens | Once per day (not implemented) | Retention reward |

### Token Usage (Current Implementation)

| Use Case | Cost | Status |
|----------|------|--------|
| **Gift to Users** | Variable (1+) | ✅ Implemented |
| **Premium Features** | TBD | ❌ Not implemented |
| **Room Upgrades** | TBD | ❌ Not implemented |
| **Custom Avatars** | TBD | ❌ Not implemented |
| **File Storage** | TBD | ❌ Not implemented |
| **Priority Support** | TBD | ❌ Not implemented |

---

## 🏗️ PROPOSED TOKEN STRUCTURE

### 1. TOKEN TIERS SYSTEM

```
Bronze Tier (0-99 tokens)
├── Basic features
├── Can gift up to 50 tokens/day
└── Standard support

Silver Tier (100-499 tokens)
├── Bronze features +
├── Can gift up to 200 tokens/day
├── Custom avatar frames
├── Priority in rooms
└── Badge display

Gold Tier (500-999 tokens)
├── Silver features +
├── Can gift up to 500 tokens/day
├── Create private rooms
├── Advanced emoji reactions
├── 10GB file storage
└── Gold badge

Platinum Tier (1000+ tokens)
├── Gold features +
├── Unlimited gifting
├── Custom room themes
├── Video call priority
├── 100GB file storage
├── Platinum badge
└── Priority support
```

### 2. ENHANCED EARNING STRUCTURE

#### Core Activities (Keep Current)
```javascript
{
  "registration": { tokens: 10, max_per: "account" },
  "create_room": { tokens: 10, max_per: "unlimited" },
  "join_room": { tokens: 5, max_per: "unlimited" },
  "send_message": { tokens: 1, max_per: "unlimited" },
  "share_file": { tokens: 3, max_per: "unlimited" }
}
```

#### New Activity Rewards
```javascript
{
  // Engagement Rewards
  "daily_login": { tokens: 10, max_per: "day" },
  "weekly_streak": { tokens: 50, max_per: "week" },
  "monthly_active": { tokens: 200, max_per: "month" },
  
  // Social Rewards
  "invite_friend": { tokens: 25, max_per: "per_friend" },
  "receive_gift": { tokens: 1, max_per: "per_gift" }, // 10% of gift
  "room_moderator": { tokens: 100, max_per: "per_room" },
  
  // Content Rewards
  "popular_message": { tokens: 5, trigger: "10+ reactions" },
  "helpful_content": { tokens: 10, trigger: "user_voted" },
  "media_shared": { tokens: 2, trigger: "viewed_10_times" },
  
  // Achievement Rewards
  "first_100_messages": { tokens: 50, max_per: "account" },
  "first_50_files": { tokens: 50, max_per: "account" },
  "created_10_rooms": { tokens: 100, max_per: "account" }
}
```

### 3. TOKEN SPENDING STRUCTURE

#### Premium Features
```javascript
{
  // Appearance
  "custom_avatar_frame": { cost: 100, duration: "permanent" },
  "custom_chat_color": { cost: 50, duration: "permanent" },
  "animated_emoji": { cost: 150, duration: "permanent" },
  "profile_badge": { cost: 200, duration: "permanent" },
  
  // Room Features
  "private_room_create": { cost: 50, duration: "per_room" },
  "room_customization": { cost: 100, duration: "per_room" },
  "pin_important_message": { cost: 10, duration: "24_hours" },
  "boost_room_visibility": { cost: 25, duration: "7_days" },
  
  // Storage & Limits
  "extra_5gb_storage": { cost: 100, duration: "30_days" },
  "increase_file_size_50mb": { cost: 75, duration: "30_days" },
  "unlimited_rooms": { cost: 200, duration: "30_days" },
  
  // Communication
  "priority_video_call": { cost: 20, duration: "per_call" },
  "screen_share_quality": { cost: 30, duration: "per_session" },
  "voice_message_premium": { cost: 15, duration: "30_days" }
}
```

#### Gifting System (Current)
```javascript
{
  "gift_to_user": {
    min: 1,
    max: "user_balance",
    requires: "4_digit_pin",
    features: [
      "optional_message",
      "recipient_notification",
      "transaction_history"
    ]
  }
}
```

---

## 📈 TOKEN ECONOMY BALANCE

### Daily Token Flow (Estimated)

#### Average Active User
```
Daily Earnings:
+ Daily login: 10 tokens
+ 10 messages: 10 tokens
+ 2 files shared: 6 tokens
+ Join 1 room: 5 tokens
= 31 tokens/day

Weekly Earnings: ~217 tokens/week
Monthly Earnings: ~930 tokens/month
```

#### Power User
```
Daily Earnings:
+ Daily login: 10 tokens
+ 50 messages: 50 tokens
+ 10 files shared: 30 tokens
+ Join 3 rooms: 15 tokens
+ Weekly streak: 7 tokens (50/7)
= 112 tokens/day

Weekly Earnings: ~784 tokens/week
Monthly Earnings: ~3,360 tokens/month
```

### Token Inflation Control

#### Current Issues
```
❌ Unlimited token generation
❌ No token sinks (spending opportunities)
❌ No max balance limit
❌ Imbalanced earning rates
```

#### Proposed Solutions
```
✅ Daily earning caps
✅ Premium features as token sinks
✅ Tier-based benefits
✅ Token decay for inactive users (optional)
✅ Seasonal events with token rewards
```

---

## 🗄️ DATABASE STRUCTURE

### Current Tables

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    public_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    pin TEXT DEFAULT NULL,
    tokens INTEGER DEFAULT 0,  -- Current balance
    -- Proposed additions:
    total_earned INTEGER DEFAULT 0,  -- Lifetime earnings
    total_spent INTEGER DEFAULT 0,   -- Lifetime spending
    total_gifted INTEGER DEFAULT 0,  -- Tokens gifted out
    total_received INTEGER DEFAULT 0, -- Tokens received
    tier TEXT DEFAULT 'bronze',      -- bronze/silver/gold/platinum
    last_daily_claim DATETIME,       -- For daily login tracking
    streak_days INTEGER DEFAULT 0    -- Login streak counter
);
```

#### Token_Transactions Table (Current)
```sql
CREATE TABLE token_transactions (
    id TEXT PRIMARY KEY,
    from_user_id TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    room_id TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Proposed additions:
    transaction_type TEXT, -- 'gift', 'earn', 'spend', 'refund'
    category TEXT,         -- 'social', 'purchase', 'reward', etc.
    metadata TEXT          -- JSON with extra details
);
```

#### Proposed: Token_Earnings Table
```sql
CREATE TABLE token_earnings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    activity_type TEXT NOT NULL,  -- 'message', 'file', 'login', etc.
    metadata TEXT,                -- JSON with details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Proposed: Token_Purchases Table
```sql
CREATE TABLE token_purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,      -- 'avatar_frame', 'storage', etc.
    cost INTEGER NOT NULL,
    expires_at DATETIME,           -- NULL for permanent items
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Proposed: Token_Daily_Caps Table
```sql
CREATE TABLE token_daily_caps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    messages_sent INTEGER DEFAULT 0,
    files_shared INTEGER DEFAULT 0,
    total_earned_today INTEGER DEFAULT 0,
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎮 TOKEN MECHANICS

### 1. Earning Mechanics

#### Rate Limiting
```javascript
const EARNING_CAPS = {
  daily: {
    messages: { max: 100, reward: 1 },      // Max 100 tokens/day from messages
    files: { max: 20, reward: 3 },          // Max 60 tokens/day from files
    rooms_joined: { max: 10, reward: 5 },   // Max 50 tokens/day from joining
    total: 500                               // Hard cap: 500 tokens/day
  },
  weekly: {
    total: 3000                              // Hard cap: 3000 tokens/week
  }
};
```

#### Multipliers & Bonuses
```javascript
const MULTIPLIERS = {
  streak_bonus: {
    3_days: 1.1,   // 10% bonus
    7_days: 1.25,  // 25% bonus
    14_days: 1.5,  // 50% bonus
    30_days: 2.0   // 100% bonus (double tokens!)
  },
  
  tier_bonus: {
    bronze: 1.0,   // No bonus
    silver: 1.1,   // 10% more tokens
    gold: 1.25,    // 25% more tokens
    platinum: 1.5  // 50% more tokens
  },
  
  event_bonus: {
    weekend: 1.2,       // 20% bonus on weekends
    holiday: 1.5,       // 50% bonus on holidays
    special_event: 2.0  // 100% bonus during events
  }
};
```

### 2. Spending Mechanics

#### Purchase Flow
```javascript
// Example: Buy custom avatar frame
{
  step_1: "User browses shop",
  step_2: "Select item (cost: 100 tokens)",
  step_3: "Confirm purchase (enter PIN)",
  step_4: "Deduct tokens from balance",
  step_5: "Grant item to user",
  step_6: "Record in token_purchases",
  step_7: "Update user tier if needed"
}
```

#### Refund Policy
```javascript
const REFUND_POLICY = {
  permanent_items: "no_refund",
  timed_items: {
    within_1_hour: "100%_refund",
    within_24_hours: "50%_refund",
    after_24_hours: "no_refund"
  },
  unused_items: "90%_refund"
};
```

### 3. Tier System Mechanics

#### Tier Calculation
```javascript
function calculateUserTier(totalTokens) {
  if (totalTokens >= 1000) return 'platinum';
  if (totalTokens >= 500) return 'gold';
  if (totalTokens >= 100) return 'silver';
  return 'bronze';
}

// Update tier on token change
async function updateUserTier(userId) {
  const user = await getUser(userId);
  const currentTier = calculateUserTier(user.tokens);
  
  if (currentTier !== user.tier) {
    await updateUser(userId, { tier: currentTier });
    await notifyTierUpgrade(userId, currentTier);
  }
}
```

#### Tier Benefits
```javascript
const TIER_BENEFITS = {
  bronze: {
    gift_limit_daily: 50,
    storage_gb: 1,
    rooms_max: 10,
    file_size_mb: 10,
    badge: '🥉'
  },
  silver: {
    gift_limit_daily: 200,
    storage_gb: 5,
    rooms_max: 50,
    file_size_mb: 25,
    badge: '🥈',
    custom_avatar: true
  },
  gold: {
    gift_limit_daily: 500,
    storage_gb: 25,
    rooms_max: 100,
    file_size_mb: 50,
    badge: '🥇',
    custom_avatar: true,
    private_rooms: true,
    priority_support: true
  },
  platinum: {
    gift_limit_daily: Infinity,
    storage_gb: 100,
    rooms_max: Infinity,
    file_size_mb: 100,
    badge: '💎',
    custom_avatar: true,
    private_rooms: true,
    priority_support: true,
    exclusive_features: true,
    custom_themes: true
  }
};
```

---

## 📱 API STRUCTURE

### Current Endpoints
```
✅ POST /api/tokens/award         - Award tokens to user
✅ GET  /api/tokens/balance/:id   - Get user balance
✅ POST /api/tokens/gift          - Gift tokens to another user
✅ GET  /api/tokens/history/:id   - Get transaction history
```

### Proposed New Endpoints

#### Token Management
```
POST /api/tokens/claim-daily      - Claim daily login reward
GET  /api/tokens/earning-stats/:id - Get earning statistics
GET  /api/tokens/spending-stats/:id - Get spending statistics
GET  /api/tokens/tier/:id         - Get user tier info
POST /api/tokens/check-cap        - Check if earning cap reached
```

#### Shop & Purchases
```
GET  /api/shop/items              - Get all purchasable items
GET  /api/shop/items/:category    - Get items by category
POST /api/shop/purchase           - Purchase item with tokens
GET  /api/shop/owned/:userId      - Get user's purchased items
POST /api/shop/refund             - Request refund for item
```

#### Achievements & Rewards
```
GET  /api/achievements/list       - Get all achievements
GET  /api/achievements/user/:id   - Get user achievements
POST /api/achievements/claim      - Claim achievement reward
GET  /api/leaderboard/tokens      - Token leaderboard
```

---

## 🎯 RECOMMENDED TOKEN STRUCTURE

### Phased Implementation

#### Phase 1: Foundation (Current - Complete ✅)
```
✅ Basic token earning (activities)
✅ Token gifting with PIN
✅ Token balance tracking
✅ Transaction history
✅ Notifications
```

#### Phase 2: Enhanced Earning (Recommended Next)
```
□ Daily login rewards
□ Streak tracking and bonuses
□ Daily earning caps
□ Activity multipliers
□ Achievement system
```

#### Phase 3: Token Utility (After Phase 2)
```
□ Premium shop items
□ Tier system implementation
□ Custom avatars/frames
□ Room upgrades
□ Storage expansion
```

#### Phase 4: Advanced Features (Future)
```
□ Token trading marketplace
□ Seasonal events
□ Limited edition items
□ Token leaderboards
□ Referral rewards
```

---

## 💡 BALANCED TOKEN ECONOMY

### Recommended Starting Values

#### Earning Rates (Per Activity)
```javascript
const TOKEN_REWARDS = {
  registration: 50,          // One-time boost
  daily_login: 10,          // Retention
  message: 1,               // Engagement (cap: 50/day)
  file_share: 3,            // Content (cap: 30/day)
  room_create: 15,          // Community building
  room_join: 5,             // Participation
  invite_friend: 100,       // Growth (when friend registers)
  weekly_streak: 100,       // Retention bonus
  achievement: 50-500       // Varies by achievement
};
```

#### Spending Costs (Per Item)
```javascript
const ITEM_COSTS = {
  // Cosmetic (Low Priority)
  avatar_frame: 150,
  chat_color: 100,
  custom_emoji: 200,
  
  // Functional (Medium Priority)
  private_room: 75,
  file_storage_5gb: 200,
  increased_file_size: 150,
  
  // Premium (High Priority)
  tier_upgrade: 500,
  priority_support: 300,
  custom_theme: 400
};
```

### Economic Balance Targets

```
Average User Journey:
- Week 1: Earn ~200 tokens
- Week 2: Earn ~300 tokens (total: 500) → Gold Tier
- Week 3: Earn ~300 tokens (total: 800)
- Week 4: Earn ~300 tokens (total: 1100) → Platinum Tier

Spending Opportunities:
- Every 2 weeks: Can afford 1 cosmetic item
- Every month: Can afford 1 functional upgrade
- Every 2 months: Can afford 1 premium feature

Result: Balanced progression, always something to work toward
```

---

## 🔐 SECURITY CONSIDERATIONS

### Token Transaction Security
```javascript
// All token operations require validation
const SECURITY_CHECKS = {
  earning: [
    "rate_limiting",
    "daily_cap_check",
    "activity_validation",
    "duplicate_prevention"
  ],
  
  spending: [
    "pin_verification",
    "balance_check",
    "purchase_validation",
    "fraud_detection"
  ],
  
  gifting: [
    "pin_verification",
    "balance_check",
    "recipient_validation",
    "amount_limits"
  ]
};
```

### Anti-Abuse Measures
```javascript
const ANTI_ABUSE = {
  rate_limits: {
    messages: "max_100_per_day",
    files: "max_20_per_day",
    gifts: "max_10_per_day"
  },
  
  fraud_detection: {
    multiple_accounts: "ip_tracking",
    token_farming: "pattern_detection",
    fake_activity: "time_based_validation"
  },
  
  penalties: {
    first_offense: "warning",
    second_offense: "24h_earning_suspension",
    third_offense: "token_reset",
    severe_abuse: "account_ban"
  }
};
```

---

## 📊 ANALYTICS & TRACKING

### Key Metrics to Monitor

#### Token Metrics
```javascript
const ANALYTICS = {
  supply: {
    total_tokens_issued: "SUM(earnings)",
    total_tokens_burned: "SUM(spending)",
    tokens_in_circulation: "SUM(user_balances)",
    inflation_rate: "(new_tokens / existing_tokens) * 100"
  },
  
  user_metrics: {
    average_balance: "AVG(user.tokens)",
    median_balance: "MEDIAN(user.tokens)",
    tokens_per_user_per_day: "AVG(daily_earnings)",
    tier_distribution: "COUNT by tier"
  },
  
  activity_metrics: {
    earning_by_activity: "SUM grouped by activity_type",
    spending_by_category: "SUM grouped by purchase_type",
    gift_volume: "SUM(gift_transactions)",
    active_earners: "COUNT(users earning today)"
  }
};
```

---

## 🎯 IMPLEMENTATION PRIORITIES

### Quick Wins (1-2 weeks)
1. ✅ Daily login rewards
2. ✅ Earning caps and rate limiting
3. ✅ Basic tier system (4 tiers)
4. ✅ Enhanced statistics display

### Medium Term (1-2 months)
1. □ Premium shop with 5-10 items
2. □ Achievement system (10-20 achievements)
3. □ Streak tracking and bonuses
4. □ Leaderboard

### Long Term (3-6 months)
1. □ Advanced marketplace
2. □ Seasonal events
3. □ Token trading between users
4. □ Referral system

---

## 📝 SUMMARY

### Current Status
- ✅ Basic token earning (5 activities)
- ✅ Token gifting with security
- ✅ Transaction tracking
- ✅ Notifications
- ❌ No spending opportunities
- ❌ No earning caps
- ❌ No tier system

### Recommended Structure
1. **Keep current earning rates** (working well)
2. **Add daily caps** (prevent abuse)
3. **Implement tier system** (4 tiers: Bronze→Platinum)
4. **Create token sinks** (shop with 10-15 items)
5. **Add achievements** (reward milestones)
6. **Track metrics** (monitor economy health)

### Balanced Economy Goals
- Average user: 200-300 tokens/week
- Power user: 500-1000 tokens/week
- Spending options every 2 weeks
- Clear progression path
- No inflation spiral
- Fair for all users

---

**Would you like me to implement any specific part of this structure?**

Options:
1. Tier system (Bronze/Silver/Gold/Platinum)
2. Daily earning caps and rate limiting
3. Premium shop with purchasable items
4. Achievement system with rewards
5. Enhanced statistics and analytics
6. All of the above (complete overhaul)

Let me know which direction you'd like to take! 🚀

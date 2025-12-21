# 🇳🇬 VTPass Integration Guide - Complete Setup

## 📋 Overview

VTPass is Nigeria's leading bills payment platform. This guide covers complete integration for purchasing MTN, Airtel, Glo, and 9mobile data bundles using the SecureChat & Pay token system.

---

## 🎯 What Was Implemented

✅ **VTPass API Client Module** (`src/vtpass.ts`)
✅ **Real Data Purchase Integration** (not demo mode)  
✅ **Error Handling & Token Refunds**  
✅ **Automatic Status Mapping**  
✅ **Support for All 4 Nigerian Networks**  
✅ **Sandbox & Production Modes**

---

## 🚀 Quick Start

### Step 1: Sign Up for VTPass

**For Testing (Sandbox):**
1. Go to https://sandbox.vtpass.com/register
2. Create an account
3. You'll get free test credits

**For Production (Live):**
1. Go to https://www.vtpass.com/register
2. Create an account
3. Fund your wallet with Naira

### Step 2: Get API Keys

1. Login to your account
2. Go to **Profile** > **API Keys**
3. Set **API AUTHENTICATION TYPE** to "all" or "API keys"
4. Copy your **API Key**
5. Click "**click to generate your public and secret key**"
6. Copy both **Public Key** (starts with `PK_`) and **Secret Key** (starts with `SK_`)

⚠️ **IMPORTANT**: Secret key is shown only once! Save it immediately.

### Step 3: Configure Environment Variables

**For Local Development:**

Create `.dev.vars` file:
```bash
VTPASS_API_KEY=your_actual_api_key_here
VTPASS_PUBLIC_KEY=PK_your_actual_public_key_here
VTPASS_SECRET_KEY=SK_your_actual_secret_key_here
VTPASS_BASE_URL=https://sandbox.vtpass.com/api
```

**For Production (Cloudflare):**

```bash
# Set secrets for production
npx wrangler secret put VTPASS_API_KEY
npx wrangler secret put VTPASS_PUBLIC_KEY
npx wrangler secret put VTPASS_SECRET_KEY
npx wrangler secret put VTPASS_BASE_URL
```

When prompted, enter:
- API Key: Your actual API key
- Public Key: PK_xxx...
- Secret Key: SK_xxx...
- Base URL: `https://vtpass.com/api` (production)

---

## 🔌 API Integration Details

### How It Works

```
User Request → Token Deduction → VTPass API Call → Update Status → Notification
```

### Purchase Flow

1. **User initiates purchase** via `/api/data/redeem`
2. **System validates**:
   - Phone number format (Nigerian)
   - Token balance sufficient
   - Data plan exists
3. **Tokens deducted** from user balance
4. **VTPass API called**:
   - Endpoint: `POST /api/pay`
   - Headers: `api-key`, `secret-key`
   - Body: `request_id`, `serviceID`, `billersCode`, `variation_code`, `phone`
5. **Response handled**:
   - Success: Status = 'completed'
   - Failure: Status = 'failed', tokens refunded
   - Pending: Status = 'pending' (can query later)
6. **User notified** via in-app notification

### VTPass Service IDs

| Network | Service ID | Example Variation Code |
|---------|------------|------------------------|
| MTN | `mtn-data` | `mtn-100mb-1000` |
| Airtel | `airtel-data` | `airtel-1gb-500` |
| Glo | `glo-data` | `glo-1gb-500` |
| 9mobile | `etisalat-data` | `etisalat-1gb-500` |

### Request Format

```json
{
  "request_id": "SCPAY-1703001234567-1234",
  "serviceID": "mtn-data",
  "billersCode": "08012345678",
  "variation_code": "mtn-100mb-1000",
  "amount": 1000,
  "phone": "08012345678"
}
```

### Response Format (Success)

```json
{
  "code": "000",
  "content": {
    "transactions": {
      "status": "delivered",
      "product_name": "MTN Data",
      "unique_element": "08012345678",
      "unit_price": "1000",
      "quantity": 1,
      "transactionId": "17415991578739548187285972",
      "amount": "1000"
    }
  },
  "response_description": "TRANSACTION SUCCESSFUL",
  "requestId": "SCPAY-1703001234567-1234"
}
```

---

## 🧪 Testing with Sandbox

### Sandbox Test Phone Numbers

VTPass provides special phone numbers for testing different scenarios:

| Phone Number | Expected Result |
|--------------|-----------------|
| `08011111111` | ✅ **Success** - Transaction completes |
| `201000000000` | ⏳ **Pending** - Transaction stays pending |
| `500000000000` | ⚠️ **Unexpected Response** - Test error handling |
| `400000000000` | ❌ **No Response** - API doesn't respond |
| `300000000000` | ⏱️ **Timeout** - Request times out |
| Any other number | ❌ **Failed** - Transaction fails |

### Testing Procedure

1. **Setup sandbox environment**:
   ```bash
   VTPASS_BASE_URL=https://sandbox.vtpass.com/api
   ```

2. **Register test user with email**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test1234"}'
   ```

3. **Award test tokens** (via admin or manual DB update):
   ```sql
   UPDATE users SET tokens = 1000 WHERE email = 'test@example.com';
   ```

4. **Test successful purchase**:
   ```bash
   curl -X POST http://localhost:3000/api/data/redeem \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user-id-here",
       "planId": 3,
       "phoneNumber": "08011111111"
     }'
   ```

5. **Check transaction status**:
   ```bash
   curl http://localhost:3000/api/data/status/TRANSACTION_ID
   ```

---

## 🔒 Error Handling

### Automatic Token Refund

If VTPass API fails, tokens are automatically refunded:

```typescript
catch (vtpassError: any) {
  console.error('[VTPASS] API error:', vtpassError)
  status = 'failed'
  errorMessage = vtpassError.message
  
  // Refund tokens
  await c.env.DB.prepare(`
    UPDATE users 
    SET tokens = tokens + ?,
        total_spent = total_spent - ?
    WHERE id = ?
  `).bind(plan.token_cost, plan.token_cost, userId).run()
}
```

### Status Mapping

VTPass statuses are mapped to our system:

| VTPass Status | Our Status | Action |
|---------------|------------|--------|
| `delivered` | `completed` | Success |
| `successful` | `completed` | Success |
| `pending` | `pending` | Wait/Query |
| `initiated` | `pending` | Wait/Query |
| `failed` | `failed` | Refund tokens |
| `reversed` | `failed` | Refund tokens |

### Response Codes

| Code | Meaning |
|------|---------|
| `000` | Success |
| `099` | Success (alternative) |
| `016` | Service temporarily unavailable |
| `015` | Insufficient balance |
| Other | Check VTPass docs |

---

## 📊 Database Integration

### How Transactions Are Tracked

1. **Create redemption record**:
   ```sql
   INSERT INTO data_redemptions (
     user_id, phone_number, network, data_plan,
     data_amount, token_cost, status, transaction_id
   ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
   ```

2. **Deduct tokens**:
   ```sql
   UPDATE users 
   SET tokens = tokens - ?,
       total_spent = total_spent + ?
   WHERE id = ?
   ```

3. **Call VTPass API**

4. **Update redemption**:
   ```sql
   UPDATE data_redemptions 
   SET status = ?,
       api_reference = ?,
       error_message = ?,
       completed_at = ?
   WHERE transaction_id = ?
   ```

5. **Refund if failed**:
   ```sql
   UPDATE users 
   SET tokens = tokens + ?,
       total_spent = total_spent - ?
   WHERE id = ?
   ```

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VTPASS_API_KEY` | Yes | Your VTPass API key | `abc123def456...` |
| `VTPASS_PUBLIC_KEY` | Yes | Public key (GET requests) | `PK_abc123...` |
| `VTPASS_SECRET_KEY` | Yes | Secret key (POST requests) | `SK_xyz789...` |
| `VTPASS_BASE_URL` | Yes | API endpoint | `https://sandbox.vtpass.com/api` |

### Demo Mode (No API Keys)

If VTPass keys are not configured, system runs in **demo mode**:
- Transactions are marked as `completed`
- No real API calls made
- Reference ID: `DEMO-[timestamp]`
- Useful for UI testing without real data purchase

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] VTPass live account created
- [ ] Live API keys generated
- [ ] Wallet funded with sufficient Naira
- [ ] API keys added to Cloudflare secrets
- [ ] Base URL changed to production
- [ ] Tested in sandbox first
- [ ] Error handling tested
- [ ] Token refund logic tested

### Deploy Steps

1. **Fund VTPass wallet**:
   - Login to https://www.vtpass.com
   - Go to Wallet → Fund
   - Use bank transfer/card
   - Recommended: Start with ₦10,000-20,000

2. **Update environment**:
   ```bash
   npx wrangler secret put VTPASS_BASE_URL
   # Enter: https://vtpass.com/api
   ```

3. **Deploy application**:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name webapp
   ```

4. **Test with real number** (your own):
   - Use small amount first (100MB = 50 tokens)
   - Verify data received on phone
   - Check transaction in VTPass dashboard

5. **Monitor transactions**:
   - VTPass Dashboard → Transactions
   - Check for any failures
   - Monitor wallet balance

---

## 💰 Pricing & Commissions

### VTPass Commission

- **Standard**: 2-4% per transaction
- **Volume discounts**: Available for high volume
- **Minimum**: Usually ₦10 per transaction

### Example Transaction

```
Data Plan: MTN 1GB (₦1000)
User pays: 350 tokens
VTPass charges: ₦1000 + ₦40 commission = ₦1040
Your cost: ₦1040
Your revenue: 350 tokens (you set token value)
```

### Profitability

If 1 token = ₦2.50:
- User pays: 350 tokens = ₦875
- Your cost: ₦1040
- **Loss per transaction**: -₦165

To be profitable:
- Either increase token costs
- Or tokens must be harder to earn
- Or 1 token = ₦3+ value

**Recommended Token Economics**:
- 1GB data = 400-450 tokens (not 350)
- This gives margin for VTPass fees

---

## 🐛 Troubleshooting

### Issue: "VTPass API error: 401"
**Solution**: Check API keys are correct and not expired

### Issue: "Insufficient balance"
**Solution**: Fund your VTPass wallet

### Issue: "Service temporarily unavailable"
**Solution**: Network provider issue, try again later or different network

### Issue: "Invalid phone number"
**Solution**: Ensure Nigerian format (080x, 070x, 090x, 091x)

### Issue: Tokens deducted but no data received
**Solution**: 
1. Check `data_redemptions` table for `api_reference`
2. Login to VTPass dashboard
3. Find transaction by reference ID
4. Check status
5. Contact VTPass support if stuck

### Issue: Transaction stuck in "pending"
**Solution**:
1. Use `/api/data/status/:transactionId` to check
2. Can implement manual requery endpoint
3. Usually resolves within 5-10 minutes

---

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Success Rate**:
   ```sql
   SELECT 
     COUNT(*) as total,
     SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
     (SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
   FROM data_redemptions
   WHERE created_at >= datetime('now', '-7 days');
   ```

2. **Revenue**:
   ```sql
   SELECT 
     SUM(token_cost) as total_tokens_spent,
     COUNT(*) as total_transactions,
     AVG(token_cost) as avg_tokens_per_transaction
   FROM data_redemptions
   WHERE status = 'completed'
   AND created_at >= datetime('now', '-30 days');
   ```

3. **Popular Networks**:
   ```sql
   SELECT 
     network,
     COUNT(*) as purchases,
     SUM(token_cost) as total_tokens
   FROM data_redemptions
   WHERE status = 'completed'
   GROUP BY network
   ORDER BY purchases DESC;
   ```

---

## 🔄 Future Enhancements

### Webhook Integration (Optional)

VTPass supports webhooks for async status updates:

1. Create webhook endpoint:
   ```typescript
   app.post('/api/webhooks/vtpass', async (c) => {
     const payload = await c.req.json()
     // Update transaction status
     // Send notification to user
   })
   ```

2. Configure in VTPass dashboard:
   - URL: `https://your-app.pages.dev/api/webhooks/vtpass`
   - Method: POST
   - Events: Transaction status updates

### Transaction Requery

For pending transactions, implement periodic requery:

```typescript
app.post('/api/data/requery/:transactionId', async (c) => {
  const transactionId = c.req.param('transactionId')
  
  // Get original request_id
  const redemption = await c.env.DB.prepare(`
    SELECT * FROM data_redemptions WHERE transaction_id = ?
  `).bind(transactionId).first()
  
  // Call VTPass requery endpoint
  const response = await fetch(`${vtpassBaseUrl}/requery`, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'secret-key': secretKey },
    body: JSON.stringify({ request_id: redemption.api_reference })
  })
  
  // Update status based on response
  // ...
})
```

---

## 📚 Additional Resources

- **VTPass Docs**: https://www.vtpass.com/documentation/
- **Support**: support@vtpass.com
- **Status Page**: https://status.vtpass.com
- **Developer Slack**: (ask VTPass for invite)

---

## ✅ Summary

**What's Ready:**
- ✅ Complete VTPass integration
- ✅ All 4 Nigerian networks supported
- ✅ Error handling with token refunds
- ✅ Sandbox testing support
- ✅ Production-ready code

**Next Steps:**
1. Sign up for VTPass (sandbox for testing, live for production)
2. Get API keys
3. Add keys to `.dev.vars` or Cloudflare secrets
4. Test with sandbox phone numbers
5. Fund wallet and go live!

**Test the integration**: Backend is ready at https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai

Need help? All code is in `/home/user/webapp/src/index.tsx` (lines 2321-2410)

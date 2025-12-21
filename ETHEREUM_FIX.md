# 🔧 Ethereum Balance - How to Fix

## ⚠️ Current Issue

Ethereum balance viewing requires a valid Etherscan API key. The API key you provided is not in the correct format.

---

## ✅ Solution: Get a FREE Etherscan API Key

### Step 1: Create Etherscan Account

1. Go to: **https://etherscan.io/register**
2. Enter your email and password
3. Verify your email address
4. Login to your account

### Step 2: Generate API Key

1. Login to Etherscan
2. Go to: **https://etherscan.io/myapikey**
3. Click **"+ Add"** button
4. Enter an app name (e.g., "SecureChat Wallet")
5. Click **"Create New API Key"**
6. **Copy the API key** (32 alphanumeric characters)

**Example format**: `ABC123DEF456GHI789JKL012MNO345PQ`

### Step 3: Add to Your App

**For Local Development:**
```bash
cd /home/user/webapp

# Edit .dev.vars file
nano .dev.vars

# Add your API key (replace with your actual key):
ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL012MNO345PQ
```

**For Production:**
```bash
npx wrangler pages secret put ETHERSCAN_API_KEY --project-name webapp
# Enter your API key when prompted
```

### Step 4: Restart Service

```bash
cd /home/user/webapp
npm run build
pm2 restart securechat-pay
```

---

## 🧪 Test It

After adding the API key:

1. Open your app: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
2. Go to **"Wallet"** tab
3. Click **"Ethereum (ETH)"**
4. Enter any Ethereum address (e.g., `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`)
5. Click **"Check Balance"**
6. You should see the real balance! ✅

---

## 💡 Why You Need an API Key

**Etherscan API V2 Changes:**
- Etherscan deprecated their V1 public API
- V2 requires authentication with API key
- Free tier: **100,000 requests/day** (more than enough!)
- No credit card required

**Without API Key:**
- App shows demo mode with 0.00 balance
- Cannot fetch real Ethereum balances

**With API Key:**
- ✅ Real Ethereum balances
- ✅ Support for ENS names
- ✅ Transaction history
- ✅ 100,000 free requests/day

---

## 🆓 Etherscan Free Tier

**What You Get (FREE):**
- ✅ 100,000 API calls per day
- ✅ 5 calls per second rate limit
- ✅ No credit card required
- ✅ No expiration
- ✅ Access to all basic APIs

**This is MORE than enough for:**
- Testing and development
- Small to medium apps
- Personal projects
- MVP/prototype apps

---

## 🔍 Alternative: Use Demo Mode

If you don't want to get an API key right now:

**The app will work in demo mode:**
- Shows "0.00 ETH" for all addresses
- All other features work fine
- No Ethereum balance fetching

**To enable demo mode:**
Just leave `ETHERSCAN_API_KEY` empty in `.dev.vars`

---

## 📝 Quick Summary

1. **Sign up**: https://etherscan.io/register
2. **Get API key**: https://etherscan.io/myapikey
3. **Add to .dev.vars**: `ETHERSCAN_API_KEY=your_32_char_key`
4. **Rebuild**: `npm run build && pm2 restart securechat-pay`
5. **Test**: Check Ethereum balance in app

**Time required**: 2-3 minutes ⏱️

---

## 🐛 Troubleshooting

### Issue: Still showing 0.00 ETH
**Solution**: 
- Verify API key is exactly 32 characters
- No spaces before/after the key
- Restart service after adding key

### Issue: "Invalid API key"
**Solution**: 
- Check you copied the full key
- Regenerate key if needed
- Ensure no typos

### Issue: "Rate limit exceeded"
**Solution**: 
- Free tier: 5 calls/second
- Wait a few seconds between checks
- Upgrade to paid tier if needed (rarely necessary)

---

## 📞 Need Help?

**Etherscan Support:**
- Help Center: https://etherscan.io/contactus
- Documentation: https://docs.etherscan.io/

**Our App:**
- All other features work without API key
- Bitcoin balance works (no key needed)
- Crypto sending requires external wallet (MetaMask)

---

**⏱️ Takes 2 minutes to fix! Get your free API key now!**

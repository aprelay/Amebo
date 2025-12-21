# Deployment Guide

## 📱 Current Status

### Development Environment
- **Status**: ✅ Running
- **URL**: https://3000-imrhbc4utrnhlsvcgsjvy-0e616f0a.sandbox.novita.ai
- **Features**: Fully functional with local D1 database

### What Works Now
✅ User registration and login
✅ Creating and joining encrypted chat rooms
✅ Sending and receiving encrypted messages
✅ Room listing and management
✅ Transaction history
✅ PWA manifest and service worker
✅ Mobile-responsive design

## 🚀 Deploying to Cloudflare Pages

### Prerequisites
Before deploying, you need:

1. **Cloudflare Account** (free tier works)
   - Sign up at: https://dash.cloudflare.com/sign-up

2. **Cloudflare API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit Cloudflare Workers" permissions

3. **GitHub Repository** (optional, for CI/CD)
   - Push code to GitHub
   - Connect to Cloudflare Pages

### Step 1: Setup Cloudflare Authentication

```bash
# Set your API token as environment variable
export CLOUDFLARE_API_TOKEN=your_api_token_here

# Or use wrangler login (opens browser)
npx wrangler login
```

### Step 2: Create Production D1 Database

```bash
# Create the production database
npx wrangler d1 create webapp-production

# Copy the output database_id
# Update wrangler.jsonc with the real database_id (replace "local-dev-db")
```

### Step 3: Apply Database Migrations to Production

```bash
# Apply migrations to production database
npm run db:migrate:prod

# Verify migrations
npx wrangler d1 execute webapp-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### Step 4: Build and Deploy

```bash
# Build the project
npm run build

# Create Cloudflare Pages project
npx wrangler pages project create webapp --production-branch main

# Deploy to production
npm run deploy:prod
```

You'll receive URLs like:
- Production: `https://webapp.pages.dev`
- Branch: `https://main.webapp.pages.dev`

### Step 5: Setup Payment Gateway (Paystack)

#### Get Paystack API Key
1. Sign up at: https://paystack.com
2. Go to: Settings → API Keys & Webhooks
3. Copy your **Secret Key**

#### Add to Cloudflare Secrets
```bash
# Add Paystack secret key
npx wrangler pages secret put PAYSTACK_SECRET_KEY --project-name webapp

# When prompted, paste your secret key
```

#### Update Backend Code
In `src/index.tsx`, update the Paystack initialization:

```typescript
// Add at the top
const PAYSTACK_SECRET_KEY = c.env.PAYSTACK_SECRET_KEY;

// In /api/payments/naira/initialize
const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email,
    amount: amount * 100, // Paystack uses kobo (1 NGN = 100 kobo)
    reference: txReference,
    callback_url: `${c.req.url}/api/payments/naira/verify/${txReference}`
  })
});

const paystackData = await paystackResponse.json();
if (!paystackData.status) throw new Error('Paystack initialization failed');

return c.json({
  success: true,
  reference: txReference,
  authorizationUrl: paystackData.data.authorization_url
});
```

### Step 6: Setup Crypto APIs (Optional)

#### Etherscan API (for Ethereum)
1. Sign up at: https://etherscan.io/register
2. Create API key: https://etherscan.io/myapikey
3. Add to Cloudflare:
   ```bash
   npx wrangler pages secret put ETHERSCAN_API_KEY --project-name webapp
   ```

#### Update Ethereum Balance Endpoint
```typescript
app.get('/api/crypto/ethereum/:address', async (c) => {
  const address = c.req.param('address');
  const apiKey = c.env.ETHERSCAN_API_KEY;
  
  const response = await fetch(
    `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
  );
  
  const data = await response.json();
  if (data.status === '1') {
    const balanceInEth = (parseInt(data.result) / 1e18).toFixed(8);
    return c.json({
      success: true,
      currency: 'ETH',
      address,
      balance: balanceInEth
    });
  }
  
  return c.json({ error: 'Failed to fetch balance' }, 500);
});
```

### Step 7: Update wrangler.jsonc with Secrets

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "webapp",
  "compatibility_date": "2025-12-20",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "webapp-production",
      "database_id": "your-actual-database-id-here"
    }
  ]
}
```

### Step 8: Custom Domain (Optional)

```bash
# Add custom domain
npx wrangler pages domain add yourdomain.com --project-name webapp

# Follow instructions to update DNS records
```

## 📱 Installing as PWA

### After Deployment
Once deployed, users can install your app:

#### iOS
1. Open `https://webapp.pages.dev` in Safari
2. Tap Share → Add to Home Screen
3. Tap Add

#### Android
1. Open `https://webapp.pages.dev` in Chrome
2. Tap menu → Install app

#### Desktop
1. Open `https://webapp.pages.dev` in Chrome/Edge
2. Click install icon in address bar

## 🔧 Environment Variables Summary

### Required for Production
- `CLOUDFLARE_API_TOKEN` - For deployment (set locally)

### Optional for Full Functionality
- `PAYSTACK_SECRET_KEY` - For Naira payments
- `ETHERSCAN_API_KEY` - For Ethereum balance checking

### Not Required (Free APIs)
- Bitcoin: Uses public Blockchain.info API
- USDT: Uses public Tron API

## 🔄 Continuous Deployment

### Option 1: GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name webapp
```

### Option 2: Cloudflare Git Integration
1. Go to Cloudflare Dashboard
2. Pages → Connect to Git
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output: `dist`

## 🐛 Troubleshooting

### "Database not found" Error
```bash
# Verify database exists
npx wrangler d1 list

# If missing, create it
npx wrangler d1 create webapp-production

# Update wrangler.jsonc with correct database_id
```

### "CORS Error" in Production
The app should work fine as it's same-origin. If you need CORS:
```typescript
app.use('/api/*', cors({
  origin: ['https://webapp.pages.dev', 'https://yourdomain.com'],
  credentials: true
}))
```

### Paystack Payments Not Working
1. Verify secret key is set: `npx wrangler pages secret list --project-name webapp`
2. Check Paystack dashboard for errors
3. Ensure callback URL is correct
4. Test mode: Use test keys for development

### Crypto Balance Not Showing
1. Check API key is set (for Etherscan)
2. Verify wallet address format is correct
3. Check API rate limits (free tier: 5 calls/sec)
4. View browser console for detailed errors

## 📊 Monitoring

### View Logs
```bash
# View real-time logs
npx wrangler pages deployment tail --project-name webapp

# View deployment list
npx wrangler pages deployments list --project-name webapp
```

### Analytics
- View analytics in Cloudflare Dashboard
- Pages → webapp → Analytics
- See: Requests, Data transfer, Cache hit rate

## 🔒 Security Checklist

Before going to production:

- [ ] Replace `local-dev-db` with real database ID in wrangler.jsonc
- [ ] Set PAYSTACK_SECRET_KEY in production
- [ ] Use HTTPS only (Cloudflare Pages enforces this)
- [ ] Set up rate limiting (use Cloudflare Rate Limiting)
- [ ] Enable DDoS protection (included in Cloudflare)
- [ ] Monitor for suspicious activity
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Add content security policy headers
- [ ] Enable HSTS headers
- [ ] Regular dependency updates

## 📈 Scaling Considerations

### Free Tier Limits (Cloudflare Pages)
- **Requests**: Unlimited
- **Bandwidth**: Unlimited
- **D1 Database**: 100,000 reads/day, 1,000 writes/day
- **Build time**: 500 builds/month

### Paid Tier (Workers Paid)
- **D1 Database**: 25M reads/month, 50M writes/month
- **No build limits**
- **Advanced analytics**

### When to Upgrade
- If you hit D1 write limits (>1,000/day)
- Need more than 500 builds/month
- Want advanced analytics and logging

## 🎯 Next Steps After Deployment

1. **Test all features** in production environment
2. **Share the link** with beta testers
3. **Monitor logs** for errors
4. **Collect feedback** and iterate
5. **Promote your app** (social media, product hunt)
6. **Add analytics** (Google Analytics, Plausible)
7. **Implement feedback** and new features

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Hono Docs**: https://hono.dev/
- **Paystack Docs**: https://paystack.com/docs/api/
- **Etherscan API**: https://docs.etherscan.io/

---

**Ready to deploy?** Follow the steps above and you'll have your app live in minutes! 🚀

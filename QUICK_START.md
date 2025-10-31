# 🔥 AdGenXAI - One-Click Implementation

## TL;DR - Run These 3 Commands

```powershell
# 1. Create structure
.\create-files.ps1

# 2. Install dependencies  
npm install coinbase-commerce-node gray-matter marked @stripe/react-stripe-js

# 3. Copy files (use IMPLEMENTATION_GUIDE.md for file contents)
```

---

## What This Adds

✅ **Stripe Payments** - Card, Apple Pay, Google Pay  
✅ **Coinbase Crypto** - BTC, ETH, SOL payments  
✅ **Usage Badge** - Live request tracking  
✅ **Crypto Feed** - Real-time market prices  
✅ **Theme Toggle** - Dark/light mode  
✅ **Thanks Page** - Post-purchase confirmation  
✅ **Welcome Emails** - Automated via nodemailer  
✅ **SEO** - Manifest, sitemap ready  

---

## Files Already Created by Scripts

- ✅ `setup-enhancements.ps1` - Dependency installer
- ✅ `setup-dirs.bat` - Directory creator (Windows cmd)
- ✅ `create-files.ps1` - Complete file generator
- ✅ `IMPLEMENTATION_GUIDE.md` - Full code reference

---

## Files You Need to Create Manually

Since PowerShell 6+ is not available, copy these from `IMPLEMENTATION_GUIDE.md`:

### API Routes (6 files)
1. `app/api/checkout/route.ts`
2. `app/api/stripe-webhook/route.ts`
3. `app/api/usage/route.ts`
4. `app/api/crypto-feed/route.ts`
5. `app/api/crypto/route.ts`
6. `app/api/crypto-webhook/route.ts`

### Pages (1 file)
7. `app/thanks/page.tsx`

### Components (Already exist - verify)
- `app/components/CheckoutButton.tsx`
- `app/components/UsageBadge.tsx`
- `app/components/CryptoFeed.tsx`
- `app/components/ThemeToggle.tsx`
- `app/components/MetricCounter.tsx`
- `app/components/Pricing.tsx`

### Lib Files (Already exist - verify)
- `app/lib/mailer.ts`
- `app/lib/users.ts`

---

## Quick Setup Steps

### Step 1: Run PowerShell Script
```powershell
cd C:\Users\north\OneDrive\Documents\GitHub\Beehive
.\create-files.ps1
```

### Step 2: Install Dependencies
```powershell
npm install coinbase-commerce-node gray-matter marked @stripe/react-stripe-js
```

### Step 3: Create API Routes

For each API route listed above:
1. Open `IMPLEMENTATION_GUIDE.md`
2. Copy the code for that route
3. Create the file in the correct directory
4. Paste the code

**Example for checkout:**
```powershell
# Create file manually or use:
New-Item -ItemType File -Path "app\api\checkout\route.ts" -Force
# Then paste code from IMPLEMENTATION_GUIDE.md
```

### Step 4: Create Thanks Page
```powershell
New-Item -ItemType File -Path "app\thanks\page.tsx" -Force
# Paste code from IMPLEMENTATION_GUIDE.md
```

### Step 5: Verify Environment Variables

Create/update `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***

STRIPE_SECRET_KEY=sk_test_***
STRIPE_PRICE_MONTHLY=price_***
STRIPE_WEBHOOK_SECRET=whsec_***

COINBASE_API_KEY=***
COINBASE_WEBHOOK_SECRET=***

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=***
SMTP_PASS=***
FROM_EMAIL="AdGenXAI <no-reply@adgenxai.com>"

GITHUB_TOKEN=ghp_***
```

### Step 6: Test Locally
```powershell
npm run dev
# or
npx netlify dev
```

### Step 7: Commit and Deploy
```powershell
git add .
git commit -m "feat(payments+ux): Complete payment, usage tracking, crypto feed, theme system"
git push
```

---

## Netlify Configuration

Add these env vars in Netlify UI → Site settings → Environment variables:

```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
STRIPE_SECRET_KEY=(from Stripe dashboard)
STRIPE_PRICE_MONTHLY=(price_xxx from Stripe)
STRIPE_WEBHOOK_SECRET=(whsec_xxx from Stripe webhooks)
COINBASE_API_KEY=(from Coinbase Commerce)
COINBASE_WEBHOOK_SECRET=(from Coinbase webhooks)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=(SendGrid API key)
FROM_EMAIL="AdGenXAI <no-reply@yourdomain.com>"
GITHUB_TOKEN=(your existing token)
```

---

## Stripe Webhook Setup

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-site.netlify.app/api/stripe-webhook`
4. Events: Select `checkout.session.completed` and `invoice.payment_succeeded`
5. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Coinbase Commerce Setup

1. Go to: https://commerce.coinbase.com/dashboard/settings
2. Create API key
3. Add webhook URL: `https://your-site.netlify.app/api/crypto-webhook`
4. Copy secret to `COINBASE_WEBHOOK_SECRET`

---

## Testing Checklist

### Payments
- [ ] Visit `/pricing` - buttons appear
- [ ] Click "Start with Card" - redirects to Stripe
- [ ] Complete test checkout - redirects to `/thanks`
- [ ] Webhook fires - email sent
- [ ] User added to `data/users.json`

### Crypto Feed
- [ ] Component shows BTC, ETH, SOL prices
- [ ] Updates every 60 seconds
- [ ] Shows 24h change with ▲/▼

### Usage Badge
- [ ] Shows "Usage: N today"
- [ ] Updates every 10 seconds
- [ ] Resilient to API errors

### Theme Toggle
- [ ] Dropdown shows System/Light/Dark
- [ ] Switching changes colors immediately
- [ ] Setting persists on reload

### Thanks Page
- [ ] Shows "You're in 🎉"
- [ ] Displays customer email
- [ ] "Back to Home" link works

---

## Troubleshooting

### API Routes 404
- Verify files are in correct directories
- Check `app/api/*/route.ts` naming
- Restart dev server

### Stripe Errors
- Verify `STRIPE_SECRET_KEY` starts with `sk_`
- Check `STRIPE_PRICE_MONTHLY` is valid price ID
- Test mode keys for development

### Email Not Sending
- Check SMTP credentials
- Verify `SMTP_HOST` and `SMTP_PORT`
- Test with a simple email first

### Crypto Feed Shows "Loading..."
- Check browser console for errors
- CoinGecko API has rate limits
- Try refreshing after 60 seconds

---

## Next Steps

After basic setup works:

1. **Add Google Pay Button** - See IMPLEMENTATION_GUIDE.md
2. **Add Blog** - Markdown-based blog system
3. **Add E2E Tests** - Playwright test suite
4. **Add CI/CD** - GitHub Actions workflow
5. **Add Telemetry** - Structured logging

All code is in `IMPLEMENTATION_GUIDE.md`!

---

## Support

If stuck:
1. Check `IMPLEMENTATION_GUIDE.md` for complete code
2. Verify all directories exist (run `create-files.ps1`)
3. Confirm dependencies installed (`npm list`)
4. Check browser console and terminal for errors
5. Verify `.env.local` has all required vars

🔥 You're ready to ship!

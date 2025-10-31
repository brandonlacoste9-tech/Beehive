# 🐝 Bee-ship Deployment Verification Checklist

## Pre-Deployment

### 1. Environment Variables Set in Netlify

Navigate to: **Netlify Dashboard → Site → Site settings → Build & deploy → Environment variables**

#### Core Bee Agent
- [ ] `BEE_API_URL` = `https://www.adgenxai.pro/api` (or your Bee API base)
- [ ] `BEE_API_KEY` = `<your-bee-agent-key>`

#### Supabase Storage
- [ ] `SUPABASE_URL` = `https://<project>.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `<service-role-key>`
- [ ] ✓ Created `assets` bucket in Supabase Storage
- [ ] ✓ Set bucket to public (or configure signed URLs)

#### Instagram / Facebook
- [ ] `INSTAGRAM_ACCOUNT_ID` = `<IG-business-account-id>`
- [ ] `FB_ACCESS_TOKEN` = `<long-lived-page-token>`
- [ ] ✓ FB App has `instagram_content_publish` + `instagram_basic` scopes
- [ ] ✓ Page is connected to Instagram Business Account

#### YouTube (if using)
- [ ] `YOUTUBE_CLIENT_ID` = `<oauth-client-id>`
- [ ] `YOUTUBE_CLIENT_SECRET` = `<oauth-client-secret>`
- [ ] `YOUTUBE_REFRESH_TOKEN` = `<refresh-token>`
- [ ] ✓ YouTube Data API v3 enabled in Google Cloud Console
- [ ] ✓ OAuth consent screen configured

#### Stripe Payments
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...` (or test key)
- [ ] `STRIPE_PRICE_MONTHLY` = `price_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- [ ] ✓ Webhook endpoint added in Stripe dashboard → `/.netlify/functions/stripe-webhook`

#### Coinbase Commerce
- [ ] `COINBASE_API_KEY` = `<api-key>`
- [ ] `COINBASE_WEBHOOK_SECRET` = `<webhook-secret>`
- [ ] ✓ Webhook endpoint configured → `/.netlify/functions/crypto-webhook`

#### Email (SMTP)
- [ ] `SMTP_HOST` = `smtp.sendgrid.net` (or your provider)
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `apikey` (or username)
- [ ] `SMTP_PASS` = `<smtp-password>`
- [ ] `FROM_EMAIL` = `"AdGenXAI <no-reply@yourdomain.com>"`

#### Public URLs
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://<your-site>.netlify.app`

---

## Deployment Steps

### 1. Run Deployment Script

```powershell
# From repo root in PowerShell 7+
pwsh ./deploy-complete.ps1
```

**Expected output:**
- ✓ Platform modules created
- ✓ Bee-ship function created
- ✓ Dependencies installed
- ✓ Build successful
- ✓ Files staged and committed

### 2. Push & Deploy

```powershell
# Push to GitHub and optionally create PR
pwsh ./push-and-deploy.ps1 -CreatePR
```

**OR manually:**

```powershell
git push origin feat/bee-ship-complete
gh pr create --fill --base main
```

### 3. Merge to Main

- [ ] Review PR
- [ ] Approve and merge
- [ ] Netlify auto-deploy triggers

---

## Post-Deployment Verification

### 1. Check Netlify Build

- [ ] Visit https://app.netlify.com
- [ ] Find latest deploy
- [ ] Status shows "Published"
- [ ] No errors in build logs

### 2. Verify Functions Deployed

Navigate to: **Netlify Dashboard → Functions**

- [ ] `bee-ship` function visible
- [ ] `stripe-webhook` function visible
- [ ] `crypto-webhook` function visible
- [ ] `github-webhook` function visible

### 3. Test Bee-ship Function

```bash
curl -X POST https://<your-site>.netlify.app/.netlify/functions/bee-ship \
  -H "Content-Type: application/json" \
  -d '{"seed":"test-campaign","platforms":["instagram"]}'
```

**Expected response:**
```json
{
  "ok": true,
  "creative": {
    "headline": "...",
    "caption": "...",
    "imageUrl": "https://..."
  },
  "assetUrl": "https://<supabase-project>.supabase.co/storage/v1/object/public/assets/bee/...",
  "results": {
    "instagram": {
      "containerId": "...",
      "publishedId": "..."
    }
  }
}
```

### 4. Verify Supabase Storage

- [ ] Go to Supabase → Storage → `assets` bucket
- [ ] See uploaded test asset
- [ ] Public URL accessible

### 5. Check Instagram Post

- [ ] Log into Instagram Business Account
- [ ] Find test post published
- [ ] Caption matches Bee-generated content

### 6. Test Payment Flow

#### Stripe Checkout
```bash
# Test checkout session creation
curl -X POST https://<your-site>.netlify.app/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"monthly"}'
```

- [ ] Returns `{ "url": "https://checkout.stripe.com/..." }`
- [ ] Visit URL, complete test payment
- [ ] Redirect to `/thanks?session_id=...`
- [ ] Welcome email received

#### Coinbase Commerce
- [ ] Click "Pay with Crypto" button
- [ ] Redirected to Coinbase hosted checkout
- [ ] Test payment (sandbox mode)
- [ ] Webhook received and user marked active

### 7. Analytics & Monitoring

#### Usage Badge
- [ ] Visit homepage
- [ ] See "Usage: 0 today" badge in header
- [ ] Make API call
- [ ] Badge updates to "Usage: 1 today"

#### Crypto Feed
- [ ] Scroll to crypto intel section
- [ ] See Bitcoin, Ethereum, Solana prices
- [ ] Sparklines render
- [ ] Aurora glow animates based on price change
- [ ] Auto-refreshes every 10s

### 8. SEO & PWA

- [ ] Visit `https://<your-site>.netlify.app/sitemap.xml`
- [ ] Visit `https://<your-site>.netlify.app/robots.txt`
- [ ] Visit `https://<your-site>.netlify.app/manifest.webmanifest`
- [ ] Lighthouse audit shows:
  - Performance > 90
  - Accessibility > 95
  - Best Practices > 90
  - SEO > 95
  - PWA installable

---

## Security Verification

### 1. CSP Headers

```bash
curl -I https://<your-site>.netlify.app
```

- [ ] `Content-Security-Policy` header present
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `Referrer-Policy` present

### 2. Secrets Not Exposed

- [ ] Search codebase for `sk_live_`, `sk_test_`
- [ ] Search for `whsec_`, `github_pat_`
- [ ] `.env*` files in `.gitignore`
- [ ] No secrets in git history

### 3. Rate Limiting

- [ ] Make 35 requests to `/api/chat` in 10 min
- [ ] 31st request returns 429 Too Many Requests

---

## Troubleshooting

### Bee-ship Function Fails

1. Check Netlify function logs
2. Verify `BEE_API_URL` and `BEE_API_KEY` set
3. Test Bee API directly:
   ```bash
   curl -X POST $BEE_API_URL/agents/creative/run \
     -H "Authorization: Bearer $BEE_API_KEY" \
     -d '{"seed":"test","platforms":["instagram"]}'
   ```

### Instagram Publish Fails

1. Verify `INSTAGRAM_ACCOUNT_ID` is correct (IG Business Account ID, not username)
2. Check `FB_ACCESS_TOKEN` is long-lived page token
3. Confirm Page → Instagram account link in FB Business Manager
4. Test Graph API manually:
   ```bash
   curl "https://graph.facebook.com/v17.0/$INSTAGRAM_ACCOUNT_ID?fields=name,username&access_token=$FB_ACCESS_TOKEN"
   ```

### Supabase Upload Fails

1. Verify `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
2. Check bucket `assets` exists and is public
3. Test upload with Supabase client UI

### Payment Webhook Not Received

1. Check Stripe Dashboard → Webhooks → Events
2. Verify endpoint URL: `https://<site>.netlify.app/.netlify/functions/stripe-webhook`
3. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
4. Use Stripe CLI to test:
   ```bash
   stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
   ```

---

## Success Criteria

✅ **Deployment is successful when:**

- [ ] All environment variables set
- [ ] Netlify build and deploy complete
- [ ] Bee-ship function returns creative + published post
- [ ] Instagram post appears
- [ ] Stripe checkout + webhook working
- [ ] Welcome email sent
- [ ] Usage badge tracking works
- [ ] Crypto feed updating
- [ ] Lighthouse scores > 90
- [ ] No console errors on homepage

---

## Final Notes

**Support contacts:**
- Netlify: https://app.netlify.com/support
- Supabase: https://supabase.com/support
- Stripe: https://support.stripe.com

**Documentation:**
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

---

🐝 **Ready to ship the swarm!**

# 🔐 Netlify Environment Variables Setup

Quick reference for setting up environment variables in Netlify.

## How to Add Environment Variables

1. Go to your site in Netlify Dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Enter **Key** and **Value**
5. Select scopes (Production, Deploy previews, Branch deploys)
6. Click **Create variable**

## 📋 Copy-Paste Ready Variables

### Required Variables (Must Configure)

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Scopes: All

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Scopes: All

Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Scopes: Production only (KEEP SECRET!)

Key: GEMINI_API_KEY
Value: AIzaSy...
Scopes: All

Key: STRIPE_SECRET_KEY
Value: sk_live_... (or sk_test_... for testing)
Scopes: Production only (KEEP SECRET!)

Key: STRIPE_WEBHOOK_SECRET
Value: whsec_...
Scopes: Production only

Key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (or pk_test_...)
Scopes: All

Key: NEXT_PUBLIC_STRIPE_PRICE_PRO
Value: price_...
Scopes: All

Key: NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE
Value: price_...
Scopes: All

Key: EMAIL_PROVIDER
Value: sendgrid
Scopes: All

Key: SENDGRID_API_KEY
Value: SG.xxxxx...
Scopes: Production only (KEEP SECRET!)

Key: FROM_EMAIL
Value: noreply@adgenxai.pro
Scopes: All

Key: FROM_NAME
Value: AdGenXAI
Scopes: All

Key: NEXT_PUBLIC_APP_URL
Value: https://www.adgenxai.pro
Scopes: Production = https://www.adgenxai.pro
        Deploy Preview = ${DEPLOY_PRIME_URL}

Key: ADMIN_USER_IDS
Value: abc-123-uuid,def-456-uuid
Scopes: All
```

### Optional Variables (Enhanced Features)

```
Key: OPENAI_API_KEY
Value: sk-...
Scopes: All

Key: ANTHROPIC_API_KEY
Value: sk-ant-...
Scopes: All

Key: BEEHIV_API_KEY
Value: your-key
Scopes: All

Key: BEEHIV_PUBLICATION_ID
Value: your-id
Scopes: All

Key: NEXT_PUBLIC_SENSORY_CORTEX_URL
Value: https://your-cortex-url.com
Scopes: All
```

## 🎯 Getting Your API Keys

### Supabase
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ KEEP SECRET!

### Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Click **Create API key**
3. Copy key → `GEMINI_API_KEY`

### OpenAI (Optional)
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy key → `OPENAI_API_KEY`

### Anthropic (Optional)
1. Go to https://console.anthropic.com/settings/keys
2. Click **Create Key**
3. Copy key → `ANTHROPIC_API_KEY`

### Stripe
1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - `Secret key` → `STRIPE_SECRET_KEY`
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Stripe Price IDs
1. Go to https://dashboard.stripe.com/products
2. Click on "Pro" product
3. Copy Price ID (starts with `price_`) → `NEXT_PUBLIC_STRIPE_PRICE_PRO`
4. Repeat for "Enterprise" → `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`

### Stripe Webhook Secret
1. Go to https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. Click **Reveal** under "Signing secret"
4. Copy secret (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### SendGrid
1. Go to https://app.sendgrid.com/settings/api_keys
2. Click **Create API Key**
3. Choose "Full Access" or "Restricted Access" (Mail Send only)
4. Copy key → `SENDGRID_API_KEY`

### Resend (Alternative)
1. Go to https://resend.com/api-keys
2. Click **Create API Key**
3. Copy key → `RESEND_API_KEY`

### Your Admin User ID
1. Sign up on your deployed site
2. Go to Supabase SQL Editor
3. Run: `SELECT id FROM auth.users WHERE email = 'your@email.com';`
4. Copy UUID → `ADMIN_USER_IDS`

## 🔄 After Adding Variables

1. **Redeploy your site** for changes to take effect:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

2. **Test functionality**:
   - Visit your site
   - Try signing up
   - Test ad generation
   - Check email notifications

## ⚠️ Security Best Practices

### Secret Variables (Never Expose to Client)
These should ONLY be in Production scope:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY` / `RESEND_API_KEY` / `POSTMARK_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

### Public Variables (Safe for Client)
These start with `NEXT_PUBLIC_` and can be in all scopes:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO`
- `NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE`
- `NEXT_PUBLIC_APP_URL`

### Tips
1. **Never commit secrets to Git**
2. **Use different keys for test/production**
3. **Rotate keys regularly**
4. **Monitor usage in each service's dashboard**
5. **Set up billing alerts** to avoid surprise charges

## 🐛 Troubleshooting

### Variables Not Working?
1. Check for typos in variable names
2. Ensure values don't have extra spaces
3. Redeploy after adding variables
4. Clear browser cache
5. Check Netlify function logs for errors

### How to Update a Variable
1. Go to **Site settings** → **Environment variables**
2. Find the variable
3. Click **Options** (•••) → **Edit**
4. Update value
5. **Save** and **Redeploy**

### How to Delete a Variable
1. Go to **Site settings** → **Environment variables**
2. Find the variable
3. Click **Options** (•••) → **Delete**
4. Confirm deletion

## 📱 Bulk Import (Advanced)

If you have many variables, use the Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set environment variables
netlify env:set KEY value

# Or import from file
netlify env:import .env.production
```

## ✅ Verification Checklist

After setting up all variables, verify:

- [ ] Site builds successfully
- [ ] Homepage loads
- [ ] Can sign up for account
- [ ] Receive welcome email
- [ ] Can generate ad
- [ ] Dashboard shows correct data
- [ ] Stripe checkout works
- [ ] Webhook updates database
- [ ] Admin dashboard loads
- [ ] No errors in Function logs

## 🎉 You're Ready!

Once all environment variables are configured, your AdGenXAI platform will have:

✅ Database connection (Supabase)
✅ AI ad generation (Gemini/GPT-4/Claude)
✅ Payment processing (Stripe)
✅ Email notifications (SendGrid/Resend/Postmark)
✅ Admin access
✅ All advanced features enabled

Deploy and start generating revenue! 🚀

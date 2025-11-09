# 🚀 AdGenXAI Deployment Guide - Netlify

This guide will walk you through deploying your AdGenXAI platform to Netlify.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub repository with all code pushed
- [ ] Supabase project created
- [ ] Database migrations run (see `supabase/MIGRATION_GUIDE.md`)
- [ ] Stripe account set up with products created
- [ ] At least one AI API key (Gemini recommended for free tier)
- [ ] Email provider account (SendGrid, Resend, or Postmark)
- [ ] Domain name (optional, can use Netlify subdomain)

## 🎯 Step-by-Step Deployment

### Step 1: Connect Repository to Netlify

1. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Import an existing project"

2. **Connect to GitHub**
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select `brandonlacoste9-tech/Beehive` repository

3. **Choose Branch**
   - Select `main` branch (or create PR to merge your feature branch first)
   - Click "Deploy site"

### Step 2: Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:

```
Build command: npm run build && npm run export
Publish directory: out
Functions directory: netlify/functions
```

If not auto-detected, set these manually in:
**Site settings** → **Build & deploy** → **Build settings**

### Step 3: Set Environment Variables

Go to **Site settings** → **Environment variables** → **Add a variable**

#### Required Variables (Must Set):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... # KEEP SECRET!

# AI Model (at least one)
GEMINI_API_KEY=AIzaSy... # Free tier available

# Stripe
STRIPE_SECRET_KEY=sk_live_... # or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_...

# Email
EMAIL_PROVIDER=sendgrid # or 'resend' or 'postmark'
SENDGRID_API_KEY=SG.xxxxx # if using SendGrid
FROM_EMAIL=noreply@adgenxai.pro
FROM_NAME=AdGenXAI

# Application
NEXT_PUBLIC_APP_URL=https://www.adgenxai.pro # Your actual domain
ADMIN_USER_IDS=uuid-from-supabase # Comma-separated if multiple
```

#### Optional Variables (Enhance Features):

```bash
# Additional AI Models
OPENAI_API_KEY=sk-... # For GPT-4 support
ANTHROPIC_API_KEY=sk-ant-... # For Claude support

# Beehiv Newsletter
BEEHIV_API_KEY=your-key
BEEHIV_PUBLICATION_ID=your-id

# Sensory Cortex
NEXT_PUBLIC_SENSORY_CORTEX_URL=https://your-cortex-url.com
```

**💡 Tip:** Copy values from `.env.example` and fill in your actual keys.

### Step 4: Configure Stripe Webhook

1. **Get Your Netlify URL**
   - After first deploy, you'll get a URL like: `https://adorable-cheetah-123456.netlify.app`
   - Or use your custom domain if configured

2. **Add Webhook in Stripe Dashboard**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-site.netlify.app/api/stripe/webhook`
   - Select events to listen to:
     ```
     checkout.session.completed
     customer.subscription.created
     customer.subscription.updated
     customer.subscription.deleted
     invoice.payment_succeeded
     invoice.payment_failed
     ```
   - Click "Add endpoint"

3. **Copy Webhook Secret**
   - Click on the newly created webhook
   - Reveal the "Signing secret" (starts with `whsec_`)
   - Add it to Netlify environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 5: Get Your Admin User ID

1. **Sign up on your deployed site** (or use existing account)

2. **Get your UUID from Supabase**:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT id FROM auth.users WHERE email = 'your@email.com';
   ```

3. **Add to Netlify environment variables**:
   ```bash
   ADMIN_USER_IDS=abc123-uuid-from-above
   ```

4. **Redeploy** for changes to take effect:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 6: Configure Custom Domain (Optional)

1. **Add Domain in Netlify**
   - Go to **Site settings** → **Domain management**
   - Click "Add custom domain"
   - Enter your domain (e.g., `www.adgenxai.pro`)

2. **Update DNS Records**
   - In your domain registrar (Namecheap, GoDaddy, etc.)
   - Add CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: adorable-cheetah-123456.netlify.app
     ```
   - Or use Netlify DNS (recommended)

3. **Enable HTTPS**
   - Netlify will auto-provision SSL certificate
   - Usually takes a few minutes

4. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update Stripe webhook URL if needed
   - Redeploy

## 🧪 Testing Your Deployment

After deployment, test these critical flows:

### 1. Basic Functionality
- [ ] Visit homepage
- [ ] Sign up for new account
- [ ] Check email for welcome message
- [ ] Log in successfully

### 2. Ad Generation
- [ ] Generate an ad with Gemini
- [ ] If you added OpenAI/Anthropic keys, test those models
- [ ] Check dashboard shows usage stats
- [ ] Verify history page shows generation

### 3. Upgrade Flow (if Stripe configured)
- [ ] Go to pricing page
- [ ] Click "Upgrade to Pro"
- [ ] Complete Stripe checkout (use test card: 4242 4242 4242 4242)
- [ ] Verify webhook receives payment
- [ ] Check email for payment confirmation
- [ ] Verify plan upgraded in dashboard

### 4. Advanced Features
- [ ] **Pro/Enterprise**: Test A/B testing endpoint
- [ ] **Pro/Enterprise**: Test bulk CSV upload
- [ ] Generate referral code
- [ ] **Enterprise**: Create team and send invite

### 5. Admin Dashboard
- [ ] Visit `/admin/dashboard`
- [ ] Verify you can see platform stats
- [ ] Check all charts load correctly

## 🐛 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "fix: Update dependencies"
git push
```

**Error: "Build exceeded maximum time"**
```bash
# Solution: Optimize build or upgrade Netlify plan
# Remove unused dependencies
# Consider using incremental builds
```

### API Routes Return 404

**Problem:** `/api/*` routes don't work

**Solution:**
1. Verify `netlify.toml` has correct redirects
2. Check `public/_redirects` exists
3. Ensure `netlify/functions` directory exists
4. Redeploy

### Stripe Webhook Fails

**Problem:** Payments not updating database

**Solution:**
1. Verify webhook secret is correct
2. Check webhook URL is correct (with https://)
3. View Stripe webhook logs for errors
4. Check Netlify function logs: **Functions** → **stripe-webhook**

### Environment Variables Not Working

**Problem:** Features not working, API errors

**Solution:**
1. Verify all required variables are set
2. No typos in variable names
3. `NEXT_PUBLIC_*` variables for client-side
4. Redeploy after adding variables
5. Clear browser cache

### Email Notifications Not Sending

**Problem:** No emails received

**Solution:**
1. Verify `EMAIL_PROVIDER` is set correctly
2. Check API key is valid (test in provider dashboard)
3. Verify `FROM_EMAIL` is authorized sender
4. Check Netlify function logs for errors
5. For development, set `EMAIL_PROVIDER=console` to see emails in logs

### Database Connection Issues

**Problem:** "Failed to fetch" errors

**Solution:**
1. Verify Supabase URL and keys are correct
2. Check Supabase project is active (not paused)
3. Verify RLS policies are enabled
4. Check service role key has proper permissions

### Admin Dashboard Shows No Data

**Problem:** Admin dashboard is empty

**Solution:**
1. Verify your user ID is in `ADMIN_USER_IDS`
2. Ensure database has data (create test users/generations)
3. Check browser console for errors
4. Verify admin API endpoint works: `/api/admin/stats`

## 📊 Monitoring Your Deployment

### Netlify Analytics (Optional - Paid)
- Go to **Analytics** tab in Netlify
- Enable Netlify Analytics for traffic insights

### Supabase Monitoring
- Dashboard → **Database** → **Query Performance**
- Monitor API usage and errors

### Stripe Dashboard
- Monitor payments, failed charges, and disputes
- Set up email alerts for important events

### Function Logs
- Go to **Functions** tab in Netlify
- Click on any function to see logs
- Useful for debugging API issues

## 🔄 Continuous Deployment

Your site is now set up for continuous deployment:

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Netlify auto-deploys**
   - Build starts automatically
   - Usually takes 2-5 minutes
   - You'll get email notification when complete

3. **Deploy previews for PRs**
   - Create pull request
   - Netlify creates preview deployment
   - Test before merging to main

## 🎯 Post-Deployment Tasks

### 1. Update README
- Add your live site URL
- Update screenshots if needed

### 2. Test All Features
- Run through testing checklist above
- Fix any issues found

### 3. Set Up Monitoring
- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up error tracking (Sentry - optional)

### 4. Marketing
- Announce your launch!
- Share on social media
- Submit to directories (Product Hunt, etc.)

### 5. Backup Plan
- Export Supabase database regularly
- Keep local copy of code
- Document any manual configurations

## 📱 Quick Deploy Checklist

Use this for future updates:

- [ ] Test locally first (`npm run dev`)
- [ ] Run build locally (`npm run build && npm run export`)
- [ ] Commit and push to GitHub
- [ ] Check Netlify deploy status
- [ ] Test live site after deployment
- [ ] Monitor function logs for errors
- [ ] Check Stripe webhook is receiving events

## 🆘 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support**: https://answers.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

- **Project Issues**: https://github.com/brandonlacoste9-tech/Beehive/issues
- **Migration Guide**: `supabase/MIGRATION_GUIDE.md`
- **Environment Setup**: `.env.example`

## 🎉 You're Live!

Congratulations! Your AdGenXAI platform is now live on Netlify.

**Share your site:**
- Twitter: "Just launched my AI ad generation platform!"
- LinkedIn: Post about your SaaS launch
- Product Hunt: Submit when ready

**Next steps:**
- Monitor analytics
- Gather user feedback
- Iterate and improve
- Scale as you grow! 🚀

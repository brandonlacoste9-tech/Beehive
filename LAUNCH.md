# 🚀 Launch Guide - AdGenXAI Beehive

This guide provides streamlined instructions for launching the AdGenXAI platform on Netlify.

## Prerequisites

Before launching, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed  
- ✅ Netlify account with CLI access
- ✅ Supabase account (database & auth)
- ✅ Stripe account (payments)
- ✅ Google Gemini API key
- ✅ Beehiv account (optional, for newsletter integration)

## Quick Launch Steps

### 1. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GEMINI_API_KEY` - Google Gemini API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

See `.env.example` for the complete list.

### 2. Database Setup

Run the database migration in your Supabase SQL Editor:

```sql
-- See docs/deployment/DEPLOYMENT.md for full schema
-- Or check your Supabase migrations folder
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to verify everything works.

### 5. Deploy to Netlify

#### Option A: Using Netlify CLI

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Option B: Using Netlify Dashboard

1. Connect your GitHub repository in Netlify Dashboard
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
   - **Functions directory:** `netlify/functions`
3. Add all environment variables from `.env.example`
4. Click "Deploy site"

### 6. Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test ad generation with different personas
- [ ] Verify Stripe payment flow (test mode)
- [ ] Check all API endpoints are working
- [ ] Review security headers in browser DevTools
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Switch Stripe to production mode
- [ ] Monitor error logs

## Build Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Production Build
npm run build           # Build for production
npm run start           # Start production server locally

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run e2e             # Run end-to-end tests

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm run validate        # Run all checks
```

## Monitoring & Health Checks

After deployment, monitor these endpoints:

- **Health Check:** `https://your-site.netlify.app/.netlify/functions/health`
- **API Status:** Check Netlify Functions logs
- **Build Logs:** Available in Netlify Dashboard

## Common Issues & Solutions

### Build Fails

**Issue:** Build fails with module not found
**Solution:** Ensure all dependencies are in `package.json` and run `npm install`

### API Routes Not Working

**Issue:** API routes return 404
**Solution:** Verify `netlify.toml` has correct functions directory and Next.js plugin

### Environment Variables Missing

**Issue:** App fails at runtime with missing env vars
**Solution:** Double-check all env vars are set in Netlify Dashboard under Site Settings > Environment Variables

### Supabase Connection Issues

**Issue:** Database connection fails
**Solution:** Verify Supabase URL and keys, check RLS policies are correctly set

## Support & Resources

- **Documentation:** See `docs/` folder for detailed guides
- **Issues:** https://github.com/brandonlacoste9-tech/Beehive/issues
- **Health Check:** `/.netlify/functions/health`
- **Email:** support@adgenxai.pro

## Security Notes

- ✅ All secrets are stored in environment variables (not in code)
- ✅ Security headers configured in `netlify.toml`
- ✅ Row-level security enabled on Supabase
- ✅ API routes protected with middleware
- ✅ HTTPS enforced via Netlify

## Performance Optimization

The build is optimized for production with:
- Static page generation
- Image optimization (unoptimized for export)
- Code splitting
- Sitemap generation
- Security headers

---

**Built with ❤️ using Next.js 14 + TypeScript**

© 2025 AdGenXAI. All rights reserved.

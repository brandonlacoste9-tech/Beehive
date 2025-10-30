# Netlify Deployment Checklist (Beehive: AdGenXAI)

This guide walks you through connecting the repo to Netlify and shipping a production deploy.

## 1) Prerequisites
- Netlify account: https://netlify.com
- GitHub repo connected (this repo)
- Optional: Netlify CLI (`npm i -g netlify-cli`) for local testing

## 2) Environment Variables
Add these to Netlify → Site settings → Environment variables (never commit secrets):
- `OPENAI_API_KEY` (for live LLM calls)
- `REDIS_URL` (if using Redis for locks/rate‑limits)
- `DATABASE_URL` (if your flows require Postgres/Supabase)
- Any CRM/email creds you use (e.g., `CRM_WEBHOOK_URL`, `CRM_API_KEY`)
- Optional tuning: `CORS_ORIGIN`, `CRM_RETRY_LOCK_TTL_MS`

Tip: Use `.env.example` in the repo as a reference when filling values.

## 3) Connect the Repo
- In Netlify: Add new site → Import existing project → GitHub → select this repo.
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: `netlify/functions`
- Ensure the plugin is enabled (in `netlify.toml`):
  ```toml
  [[plugins]]
    package = "@netlify/plugin-nextjs"
  ```

This configuration uses Next.js SSR/ISR via the Netlify Next.js Runtime (no `next export`).

## 4) Build & Deploy
- Netlify installs dependencies and runs `npm run build` automatically.
- First deploy will create a site URL (you can change it later).

## 5) External Services
- Supabase: verify project URL/anon key if used.
- Stripe: point webhooks at your Netlify function endpoints if applicable.
- Email: set provider secrets (Resend/Postmark/SendGrid) if used.

## 6) Domain & HTTPS
- Add your custom domain in Netlify → Domains.
- HTTPS is auto‑provisioned by Netlify.

## 7) Post‑Deploy Checks
- Exercise key flows (auth, payments, ad generation).
- Verify API routes (e.g., `/api/generateAd`).
- Check site logs in Netlify for errors.
- Set up alerts/monitoring.

## 8) Optional Advanced
- Preview deploys: enable branch deploys for PRs.
- Redirects/headers: use `public/_redirects` or `netlify.toml` if needed.
- Scheduled jobs: see `.github/workflows/retry-crm-cron.yml` for a GitHub‑based schedule, or use Netlify Scheduled Functions.

## Quick Links
- Netlify Docs: https://docs.netlify.com/
- Next.js on Netlify: https://docs.netlify.com/integrations/frameworks/next-js/
- Environment Variables: https://docs.netlify.com/configure-builds/environment-variables/

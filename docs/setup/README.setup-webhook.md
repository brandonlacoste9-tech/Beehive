# Webhook Setup Automation

This repository includes automation to create or update a GitHub repository webhook pointing to the Netlify function `github-webhook` and a validator to send a signed test event.

## Prerequisites

- GitHub token with repository admin:hook permissions
  - Use a PAT as `WEBHOOK_ADMIN_TOKEN` in Actions, or `GITHUB_TOKEN` locally
- `GITHUB_WEBHOOK_SECRET` set in both GitHub Webhook and Netlify env

## Local Usage

1. Install deps
   - `npm install`
2. Set env
   - PowerShell: `$env:GITHUB_TOKEN="<PAT>"; $env:GITHUB_WEBHOOK_SECRET="<secret>"`
   - Bash: `export GITHUB_TOKEN=<PAT> GITHUB_WEBHOOK_SECRET=<secret>`
3. Create/Update webhook
   - `npm run setup-webhook`
4. Validate (ping)
   - `node scripts/test-webhook.js`

## GitHub Actions (manual)

Run the workflow "Validate Webhook Setup" from the Actions tab. Inputs:

- `run_setup`: whether to run `setup-webhook.js` first (default true)
- `url`: webhook URL to validate (defaults to your Netlify function)

Add these secrets:

- `GITHUB_WEBHOOK_SECRET` – same value as Netlify env
- Optional: `WEBHOOK_ADMIN_TOKEN` – PAT for creating webhooks; falls back to `GITHUB_TOKEN`

## Files

- `scripts/setup-webhook.js`: creates/updates the repo webhook
- `scripts/test-webhook.js`: sends a signed ping to the webhook
- `.github/workflows/validate-webhook.yml`: manual workflow to run both


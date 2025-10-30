# Webhook Setup Script Usage & Troubleshooting

## Usage

1. **Install dependencies:**
   ```powershell
   npm install
   ```
   (Installs `@octokit/rest` if not already present.)

2. **Set environment variables:**
   ```powershell
   $env:GITHUB_TOKEN="your_github_pat"
   $env:GITHUB_WEBHOOK_SECRET="your_webhook_secret"
   ```
   - `GITHUB_TOKEN`: GitHub personal access token (repo admin permissions)
   - `GITHUB_WEBHOOK_SECRET`: Must match Netlify's webhook secret

3. **Run the script:**
   ```powershell
   node scripts/setup-webhook.js
   ```
   - Logs success to `webhook-setup.log` for auditability

## Troubleshooting

- **401/Signature mismatch:**
  - Ensure `GITHUB_WEBHOOK_SECRET` matches both GitHub and Netlify env vars
  - Check Netlify function logs:
    ```powershell
    netlify functions:log --name github-webhook
    ```
- **Build errors:**
  - Run `npm run build` locally to catch TypeScript errors
  - Ensure Netlify deploy is linked to the correct branch
- **Webhook not firing:**
  - Test with a `ping` event from GitHub webhook settings
  - Check for delivery errors in GitHub's webhook UI

## Security
- Never commit secrets to the repo
- Use environment variables for all tokens/secrets

---
For further automation (e.g., GitHub Actions validation), see the next section or ask for a workflow example.

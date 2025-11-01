# GitHub Webhook Setup (Netlify Function)

Use this checklist to configure a secure GitHub webhook for your Netlify function endpoint.

Endpoint: `https://www.adgenxai.pro/.netlify/functions/github-webhook`

---

## Setup Steps

1. Go to your repository on GitHub
2. Settings → Webhooks → Add webhook
3. Configure:
   - Payload URL: `https://www.adgenxai.pro/.netlify/functions/github-webhook`
   - Content type: `application/json`
   - Secret: set a strong secret (also add the same value to Netlify env var `GITHUB_WEBHOOK_SECRET`)
   - Events:
     - Pushes
     - Pull requests
     - Pull request reviews
     - Issues
     - Workflow runs
     - Or choose “Let me select individual events” and check these
4. Click “Add webhook”

---

## Pro Tips

- Test after setup: GitHub sends a “ping” event automatically. Check your Netlify function logs to confirm receipt.
- Security: Never commit secrets. Store the same `GITHUB_WEBHOOK_SECRET` in both GitHub (webhook config) and Netlify (site env vars).
- Telemetry/Logs: Monitor Netlify function logs for incoming events, or forward events to your own telemetry if desired.

---

## Implementation Notes

- Function source: `netlify/functions/github-webhook.ts`:1
- Verifies `X-Hub-Signature-256` using `GITHUB_WEBHOOK_SECRET`.
- Returns 200 for supported events; responds to `ping` with `{ ok: true, zen }`.
- Only accepts `POST`; responds 405 otherwise.

---

## Environment Variables

Add to Netlify (and optionally `.env.local` for local testing):

- `GITHUB_WEBHOOK_SECRET`: shared secret used to validate webhook signatures.


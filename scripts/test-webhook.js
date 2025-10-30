// scripts/test-webhook.js
// Sends a signed test payload to the Netlify GitHub webhook endpoint
// Env: GITHUB_WEBHOOK_SECRET, WEBHOOK_URL (optional)

const { createHmac } = require('crypto');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://www.adgenxai.pro/.netlify/functions/github-webhook';
const SECRET = process.env.GITHUB_WEBHOOK_SECRET;

if (!SECRET) {
  console.error('GITHUB_WEBHOOK_SECRET is required');
  process.exit(1);
}

const payload = {
  zen: 'Approachable is better than simple.',
  hook_id: 0,
  repository: { full_name: 'owner/repo' },
};

const body = JSON.stringify(payload);
const signature = 'sha256=' + createHmac('sha256', SECRET).update(body).digest('hex');

(async () => {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': 'ping',
        'X-GitHub-Delivery': `local-${Date.now()}`,
        'X-Hub-Signature-256': signature,
      },
      body,
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error('Request failed:', err.message);
    process.exit(1);
  }
})();


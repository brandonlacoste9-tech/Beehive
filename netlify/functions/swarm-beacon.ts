import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  const { SLACK_WEBHOOK_URL, URL, DEPLOY_URL, DEPLOY_PRIME_URL, CONTEXT, COMMIT_REF, BRANCH, SITE_NAME } = process.env as Record<string,string|undefined>;
  if (!SLACK_WEBHOOK_URL) return { statusCode: 500, body: 'Missing SLACK_WEBHOOK_URL' };

  const lines = [
    '🐝 *BeeHive deploy complete!*',
    `• *Time:* ${new Date().toISOString()}`,
    `• *Context:* ${CONTEXT}`,
    `• *Branch:* ${BRANCH}`,
    `• *Commit:* ${COMMIT_REF}`,
    `• *Site:* ${URL}`,
    `• *Deploy:* ${DEPLOY_URL}`,
    `• *Prime:* ${DEPLOY_PRIME_URL}`,
    '• *Mode:* Static Export',
    '• *Pages:* index, /.netlify/functions/generateAd'
  ].join('\n');

  const payload = {
    text: `BeeHive deploy: ${SITE_NAME ?? ''}`,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: lines } }],
  };

  const res = await fetch(String(SLACK_WEBHOOK_URL), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  if (!res.ok) return { statusCode: 502, body: `Slack webhook error: ${res.status}` };
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

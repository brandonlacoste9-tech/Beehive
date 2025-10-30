// scripts/setup-webhook.js
// Automates creating/updating a GitHub repository webhook for Netlify
// Requires env: GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const { execSync } = require('child_process');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const DEFAULT_OWNER = 'brandonlacoste9-tech';
const DEFAULT_REPO = 'Beehive'; // Adjust if different
const WEBHOOK_URL = 'https://www.adgenxai.pro/.netlify/functions/github-webhook';
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

if (!process.env.GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN is required (a PAT or GitHub App token with repo admin:hook).');
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.error('GITHUB_WEBHOOK_SECRET is required and must match Netlify env.');
  process.exit(1);
}

function detectRepoSlug() {
  try {
    const url = execSync('git config --get remote.origin.url', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    if (!url) return null;
    // Supports SSH and HTTPS formats
    // git@github.com:owner/repo.git OR https://github.com/owner/repo.git
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/i);
    if (match) return { owner: match[1], repo: match[2] };
    return null;
  } catch {
    return null;
  }
}

const detected = detectRepoSlug();
const REPO_OWNER = process.env.REPO_OWNER || (detected ? detected.owner : DEFAULT_OWNER);
const REPO_NAME = process.env.REPO_NAME || (detected ? detected.repo : DEFAULT_REPO);

const WEBHOOK_CONFIG = {
  config: {
    url: WEBHOOK_URL,
    content_type: 'json',
    secret: WEBHOOK_SECRET,
  },
  events: ['push', 'pull_request', 'pull_request_review', 'issues', 'workflow_run'],
  active: true,
};

(async () => {
  try {
    console.log(`Target repo: ${REPO_OWNER}/${REPO_NAME}`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);

    const { data: existingHooks } = await octokit.rest.repos.listWebhooks({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });

    const existing = existingHooks.find((hook) => hook.config && hook.config.url === WEBHOOK_URL);
    if (existing) {
      console.log('Webhook already exists; updating configuration...');
      await octokit.rest.repos.updateWebhook({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        hook_id: existing.id,
        ...WEBHOOK_CONFIG,
      });
    } else {
      console.log('Creating new webhook...');
      await octokit.rest.repos.createWebhook({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ...WEBHOOK_CONFIG,
      });
    }

    const logLine = `${new Date().toISOString()}: Webhook configured for ${REPO_OWNER}/${REPO_NAME} -> ${WEBHOOK_URL}\n`;
    fs.appendFileSync('webhook-setup.log', logLine);
    console.log('Webhook setup successful!');
  } catch (error) {
    console.error('Error setting up webhook:', error && (error.message || error.status) || error);
    process.exit(1);
  }
})();


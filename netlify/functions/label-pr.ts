import type { Handler } from '@netlify/functions';
import { logMutation } from './_logger';

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GH_TOKEN = process.env.GITHUB_PAT;
const GH_REPO = process.env.GITHUB_REPO;

function deriveLabels(files: string[]) {
  const labels = new Set<string>();
  if (files.some((f) => f.match(/netlify\.toml|Dockerfile|dockerfile|\.github\/workflows/))) labels.add('infra');
  if (files.some((f) => f.match(/package\.json|lock\.json|pnpm-lock\.yaml/))) labels.add('dependencies');
  if (files.some((f) => f.startsWith('src/routes') || f.includes('router'))) labels.add('routing');
  if (files.some((f) => f.match(/auth|login|session|token/))) labels.add('auth');
  if (files.some((f) => f.startsWith('scripts/'))) labels.add('scripts');
  return Array.from(labels);
}

export const handler: Handler = async (event) => {
  if (!CAP) return { statusCode: 500, body: 'Capability not configured' };
  if (!GH_TOKEN || !GH_REPO) return { statusCode: 500, body: 'GitHub credentials missing' };

  const actor = event.headers['x-codex-actor'] || 'Unknown Steward';
  if (event.headers['x-codex-capability'] !== CAP) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let payload: any = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  const { pr_number, files } = payload as { pr_number?: number; files?: string[] };
  if (!pr_number || !files || !Array.isArray(files)) {
    return { statusCode: 400, body: 'Missing pr_number or files' };
  }

  const labels = deriveLabels(files);
  const res = await fetch(`https://api.github.com/repos/${GH_REPO}/issues/${pr_number}/labels`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ labels }),
  });
  const ok = res.status < 300;

  await logMutation({
    actor,
    ritual: 'label-pr',
    status: ok ? 'success' : 'failure',
    message: ok ? `Labels applied: ${labels.join(', ')}` : `Labeling failed (${res.status})`,
    payload: { pr_number, files },
    response: { labels, status: res.status },
    metadata: { labelsCount: labels.length },
  });

  return { statusCode: res.status, body: JSON.stringify({ labels }) };
};

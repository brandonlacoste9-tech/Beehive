import type { Handler } from '@netlify/functions';
import { logMutation } from './_logger';

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GH_TOKEN = process.env.GITHUB_PAT;
const GH_REPO = process.env.GITHUB_REPO;

async function check(url: string) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const ok = res.status >= 200 && res.status < 400;
    return { url, status: res.status, ok };
  } catch (error: any) {
    return { url, status: 0, ok: false, err: String(error) };
  }
}

export const handler: Handler = async (event) => {
  if (!CAP) return { statusCode: 500, body: 'Capability not configured' };

  const actor = event.headers['x-codex-actor'] || 'Unknown Steward';
  if (event.headers['x-codex-capability'] !== CAP) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  const { pr_number, preview_url, tests = ['/', '/favicon.ico'] } = body as {
    pr_number?: number;
    preview_url?: string;
    tests?: string[];
  };

  if (!preview_url) {
    return { statusCode: 400, body: 'Missing preview_url' };
  }

  const list = Array.isArray(tests) && tests.length > 0 ? tests : ['/'];
  const targetResults = await Promise.all(
    list.map((test) => check(new URL(test, preview_url).toString())),
  );
  const pass = targetResults.every((result) => result.ok);
  const summary = targetResults
    .map((result) => `- ${result.url} → ${result.ok ? '✅' : '❌'} (status ${result.status})`)
    .join('\n');

  await logMutation({
    actor,
    ritual: 'smoke-test',
    status: pass ? 'success' : 'failure',
    message: pass ? 'Smoke tests passed' : 'Smoke tests failed',
    payload: { pr_number, preview_url, tests: list },
    response: { results: targetResults },
    metadata: { previewUrl: preview_url, testsCount: list.length, pass },
  });

  if (pr_number && GH_TOKEN && GH_REPO) {
    try {
      const bodyText = `🧪 Smoke tests on ${preview_url}\n\n${summary}\n\nResult: ${
        pass ? '✅ Pass' : '❌ Fail'
      }`;
      await fetch(`https://api.github.com/repos/${GH_REPO}/issues/${pr_number}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: bodyText }),
      });
    } catch (error) {
      console.error('[smoke-test] Failed to post GitHub comment:', error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ pass, results: targetResults }),
  };
};

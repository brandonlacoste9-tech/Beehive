import type { Handler } from '@netlify/functions';

import {
  jsonResponse,
  methodNotAllowed,
  missingConfig,
  parseJsonBody,
  relayResponse,
  requireCapability,
} from './_shared/http';

type PullPayload = {
  title?: string;
  body?: string;
  base?: string;
  head?: string;
};

const CAPABILITY = process.env.CODEX_CAPABILITY_KEY;
const GITHUB_TOKEN = process.env.GITHUB_PAT;
const GITHUB_REPO = process.env.GITHUB_REPO;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST');
  }

  const auth = requireCapability(event, CAPABILITY);
  if (auth) return auth;

  if (!GITHUB_TOKEN) {
    return missingConfig('GITHUB_PAT');
  }
  if (!GITHUB_REPO) {
    return missingConfig('GITHUB_REPO');
  }

  const parsed = parseJsonBody<PullPayload>(event);
  if (!parsed.ok) return parsed.error;

  const { title, body, base = 'main', head } = parsed.data;
  if (!head) {
    return jsonResponse(400, { ok: false, error: "Missing 'head' branch" });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ title, body, base, head }),
    });

    return await relayResponse('github.pull_request', res, {
      repo: GITHUB_REPO,
      branch: { base, head },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub request failed';
    return jsonResponse(502, {
      ok: false,
      target: 'github.pull_request',
      error: message,
    });
  }
};

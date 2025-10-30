import type { Handler } from '@netlify/functions';

import {
  jsonResponse,
  methodNotAllowed,
  missingConfig,
  parseJsonBody,
  relayResponse,
  requireCapability,
} from './_shared/http';

type GistPayload = {
  filename?: string;
  content?: string;
  description?: string;
  public?: boolean;
};

const CAPABILITY = process.env.CODEX_CAPABILITY_KEY;
const GITHUB_TOKEN = process.env.GITHUB_PAT;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST');
  }

  const auth = requireCapability(event, CAPABILITY);
  if (auth) return auth;

  if (!GITHUB_TOKEN) {
    return missingConfig('GITHUB_PAT');
  }

  const parsed = parseJsonBody<GistPayload>(event);
  if (!parsed.ok) return parsed.error;

  const {
    filename,
    content,
    description = 'Codex scroll',
    public: isPublic = false,
  } = parsed.data;

  if (!filename || !content) {
    return jsonResponse(400, {
      ok: false,
      error: 'Missing filename or content',
    });
  }

  try {
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        description,
        public: isPublic,
        files: { [filename]: { content } },
      }),
    });

    return await relayResponse('github.gist', res, {
      description,
      public: isPublic,
      filename,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub request failed';
    return jsonResponse(502, {
      ok: false,
      target: 'github.gist',
      error: message,
    });
  }
};

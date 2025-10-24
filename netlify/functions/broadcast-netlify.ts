import type { Handler } from '@netlify/functions';

import {
  jsonResponse,
  methodNotAllowed,
  missingConfig,
  relayResponse,
  requireCapability,
} from './_shared/http';

const CAPABILITY = process.env.CODEX_CAPABILITY_KEY;
const BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK_URL;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST');
  }

  const auth = requireCapability(event, CAPABILITY);
  if (auth) return auth;

  if (!BUILD_HOOK) {
    return missingConfig('NETLIFY_BUILD_HOOK_URL');
  }

  try {
    const res = await fetch(BUILD_HOOK, { method: 'POST' });
    return await relayResponse('netlify.build_hook', res, {
      hook: BUILD_HOOK,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Netlify request failed';
    return jsonResponse(502, {
      ok: false,
      target: 'netlify.build_hook',
      error: message,
    });
  }
};

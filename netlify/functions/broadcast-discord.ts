import type { Handler } from '@netlify/functions';

import {
  jsonResponse,
  methodNotAllowed,
  missingConfig,
  parseJsonBody,
  relayResponse,
  requireCapability,
} from './_shared/http';

type DiscordPayload = {
  message?: string;
};

const CAPABILITY = process.env.CODEX_CAPABILITY_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed('POST');
  }

  const auth = requireCapability(event, CAPABILITY);
  if (auth) return auth;

  if (!DISCORD_WEBHOOK_URL) {
    return missingConfig('DISCORD_WEBHOOK_URL');
  }

  const parsed = parseJsonBody<DiscordPayload>(event);
  if (!parsed.ok) return parsed.error;

  const message = parsed.data.message ?? 'Codex broadcast';

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });

    return await relayResponse('discord.webhook', res, { message });
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : 'Discord webhook request failed';
    return jsonResponse(502, {
      ok: false,
      target: 'discord.webhook',
      error: messageText,
    });
  }
};

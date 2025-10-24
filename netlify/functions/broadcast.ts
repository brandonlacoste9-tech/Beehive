import type { Handler } from '@netlify/functions';

import { logMutation } from './_logger';

const CAPABILITY_KEY = process.env.CODEX_CAPABILITY_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const GITHUB_TOKEN = process.env.GITHUB_PAT;
const GITHUB_GIST_API_URL = 'https://api.github.com/gists';

interface BroadcastPayload {
  pr_number?: number;
  message: string;
  ritual_status: string;
  ritual_outputs?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

type ChannelName = 'dashboard' | 'discord' | 'gist';
type ChannelStatus = 'success' | 'skipped' | 'error';

interface ChannelResult {
  channel: ChannelName;
  status: ChannelStatus;
  detail?: string;
  url?: string | null;
}

interface GistSummary {
  id?: string;
  url?: string | null;
  file?: string;
}

function unauthorized() {
  return { statusCode: 401, body: 'Unauthorized' };
}

function badRequest(reason: string) {
  return { statusCode: 400, body: reason };
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

function stringifyForGist(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === 'bigint') {
        return val.toString();
      }
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    },
    2
  );
}

function formatJsonSection(value: unknown): string {
  if (value === undefined || value === null) {
    return '_No data provided._';
  }
  try {
    return `\`\`\`json\n${stringifyForGist(value)}\n\`\`\``;
  } catch {
    return '_Unable to serialize data._';
  }
}

function createGistFileName(prNumber: number | undefined, timestamp: string) {
  const prSegment = typeof prNumber === 'number' ? `pr-${prNumber}` : 'pr-na';
  const safeTimestamp = timestamp.replace(/[:.]/g, '-');
  return `${prSegment}-broadcast-${safeTimestamp}.md`;
}

async function broadcastToDiscord({
  webhookUrl,
  prNumber,
  ritualStatus,
  message,
}: {
  webhookUrl: string;
  prNumber?: number;
  ritualStatus: string;
  message: string;
}) {
  const lines = [
    '🐝 **Codex Broadcast**',
    `**PR:** ${typeof prNumber === 'number' ? `#${prNumber}` : 'N/A'}`,
    `**Status:** ${ritualStatus === 'success' ? '✅ Success' : '❌ Failure'}`,
    `**Message:** ${message}`,
  ];

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: lines.join('\n') }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Discord webhook responded with ${response.status}: ${detail || response.statusText}`);
  }
}

async function broadcastToGist({
  actor,
  prNumber,
  ritualStatus,
  message,
  ritualOutputs,
  payload,
  jobId,
  sizeBytes,
}: {
  actor: string;
  prNumber?: number;
  ritualStatus: string;
  message: string;
  ritualOutputs?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  jobId?: unknown;
  sizeBytes?: unknown;
}): Promise<GistSummary> {
  if (!GITHUB_TOKEN) {
    throw new Error('Missing GitHub token for Gist broadcast');
  }

  const timestamp = new Date().toISOString();
  const prLabel = typeof prNumber === 'number' ? `#${prNumber}` : 'N/A';
  const fileName = createGistFileName(prNumber, timestamp);
  const gistContent = [
    '# Codex Broadcast',
    '',
    `- **PR:** ${prLabel}`,
    `- **Status:** ${ritualStatus}`,
    `- **Message:** ${message}`,
    `- **Actor:** ${actor}`,
    `- **Timestamp:** ${timestamp}`,
    `- **Job ID:** ${jobId ?? 'N/A'}`,
    `- **Size (bytes):** ${sizeBytes ?? 'N/A'}`,
    '',
    '## Ritual Outputs',
    formatJsonSection(ritualOutputs),
    '',
    '## Payload',
    formatJsonSection(payload),
  ].join('\n');

  const body = {
    description: `Codex Mutation Broadcast for PR ${prLabel}`,
    public: true,
    files: {
      [fileName]: {
        content: gistContent,
      },
    },
  };

  const response = await fetch(GITHUB_GIST_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`Gist API responded with ${response.status}: ${detail || response.statusText}`);
  }

  const data = (await response.json()) as { id?: string; html_url?: string | null };
  return { id: data.id, url: data.html_url ?? null, file: fileName };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method not allowed' };
  }

  const actor =
    (event.headers['x-codex-actor'] as string) ||
    (event.headers['X-Codex-Actor'] as unknown as string) ||
    'Codex Broadcaster';
  const capability =
    (event.headers['x-codex-capability'] as string | undefined) ||
    (event.headers['X-Codex-Capability'] as unknown as string | undefined);
  if (!CAPABILITY_KEY || capability !== CAPABILITY_KEY) {
    return unauthorized();
  }

  let body: BroadcastPayload | null = null;
  if (event.body) {
    try {
      body = JSON.parse(event.body) as BroadcastPayload;
    } catch {
      return badRequest('Invalid JSON payload');
    }
  }

  const { pr_number, message, ritual_status, ritual_outputs, payload } = body || ({} as BroadcastPayload);
  if (!message || !ritual_status) {
    return badRequest('Missing required payload: message or ritual_status');
  }

  console.log(
    `Broadcasting: ${message} (Status: ${ritual_status}) for PR #${typeof pr_number === 'number' ? pr_number : 'N/A'}`
  );

  const baseMetadata = {
    status: ritual_status,
    prNumber: pr_number ?? null,
    jobId: ritual_outputs?.jobId ?? payload?.jobId ?? null,
    sizeBytes: ritual_outputs?.sizeBytes ?? payload?.sizeBytes ?? null,
  };

  const channelResults: ChannelResult[] = [];
  let gistSummary: GistSummary | null = null;

  if (DISCORD_WEBHOOK_URL) {
    try {
      await broadcastToDiscord({
        webhookUrl: DISCORD_WEBHOOK_URL,
        prNumber: pr_number,
        ritualStatus: ritual_status,
        message,
      });
      channelResults.push({ channel: 'discord', status: 'success' });
      console.log('Broadcast to Discord complete.');
    } catch (discordError) {
      const detail = safeErrorMessage(discordError);
      console.error('Failed to broadcast to Discord:', detail);
      channelResults.push({ channel: 'discord', status: 'error', detail });
      await logMutation({
        actor,
        ritual: 'broadcast',
        status: 'error',
        message: `Discord broadcast failed: ${detail}`,
        payload: { pr_number },
        response: { error: detail },
        metadata: { ...baseMetadata, channel: 'discord', channelStatus: 'error' },
      });
    }
  } else {
    channelResults.push({ channel: 'discord', status: 'skipped', detail: 'Missing DISCORD_WEBHOOK_URL' });
  }

  if (GITHUB_TOKEN) {
    try {
      gistSummary = await broadcastToGist({
        actor,
        prNumber: pr_number,
        ritualStatus: ritual_status,
        message,
        ritualOutputs: ritual_outputs,
        payload,
        jobId: baseMetadata.jobId,
        sizeBytes: baseMetadata.sizeBytes,
      });
      channelResults.push({
        channel: 'gist',
        status: 'success',
        url: gistSummary.url ?? null,
        detail: gistSummary.id ? `gist:${gistSummary.id}` : undefined,
      });
      console.log('Broadcast to Gist complete.');
    } catch (gistError) {
      const detail = safeErrorMessage(gistError);
      console.error('Failed to broadcast to Gist:', detail);
      channelResults.push({ channel: 'gist', status: 'error', detail });
      await logMutation({
        actor,
        ritual: 'broadcast',
        status: 'error',
        message: `Gist broadcast failed: ${detail}`,
        payload: { pr_number },
        response: { error: detail },
        metadata: { ...baseMetadata, channel: 'gist', channelStatus: 'error' },
      });
    }
  } else {
    channelResults.push({ channel: 'gist', status: 'skipped', detail: 'Missing GITHUB_PAT' });
  }

  const successfulTargets = [
    'dashboard',
    ...channelResults.filter((result) => result.status === 'success').map((result) => result.channel),
  ];
  const metadata = {
    ...baseMetadata,
    channels: channelResults,
    gist: gistSummary,
  };

  const logResult = await logMutation({
    actor,
    ritual: 'broadcast',
    status: ritual_status,
    message: `Broadcast: ${message}`,
    payload: { pr_number, original_ritual_payload: payload },
    response: { broadcast_targets: successfulTargets, ritual_outputs, gist: gistSummary },
    metadata,
  });

  const allChannelResults: ChannelResult[] = [
    { channel: 'dashboard', status: logResult ? 'success' : 'error', detail: logResult ? undefined : 'Supabase logging failed' },
    ...channelResults,
  ];

  if (!logResult) {
    console.warn('Broadcast log could not be persisted to Supabase.');
  } else {
    console.log('Broadcast to Dashboard (via Supabase log) complete.');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Broadcast completed.',
      results: allChannelResults,
      gist: gistSummary ?? undefined,
    }),
  };
};

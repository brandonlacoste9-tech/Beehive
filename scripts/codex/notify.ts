import { glyphForStatus, readCodexIndex } from './common';

type WebhookResult = {
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
};

function buildStatusLine(statuses: Record<string, number>): string {
  const parts = Object.entries(statuses)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([status, count]) => `${glyphForStatus(status)} ${status}: ${count}`);
  return parts.join(' | ');
}

function buildPayload(index: Awaited<ReturnType<typeof readCodexIndex>>) {
  const statusLine = buildStatusLine(index.statuses) || 'No scrolls registered.';
  const headline = `Codex ritual ${index.meta.jobId}`;
  const summary = `${headline}\n${statusLine}\nScrolls: ${index.meta.scrollCount} • Total Size: ${index.meta.totalSizeBytes} B`;
  return {
    text: summary,
    codexMeta: {
      jobId: index.meta.jobId,
      generatedAt: index.meta.generatedAt,
      scrollCount: index.meta.scrollCount,
      totalSizeBytes: index.meta.totalSizeBytes,
      statuses: index.statuses,
    },
  };
}

async function postWebhook(url: string, payload: unknown): Promise<WebhookResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { url, ok: response.ok, status: response.status, statusText: response.statusText };
}

async function main() {
  const index = await readCodexIndex();
  const payload = buildPayload(index);
  const dryRunValue = String(process.env.DRY_RUN ?? '').toLowerCase();
  const dryRun = ['true', '1', 'yes'].includes(dryRunValue);

  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const studioShareUrl = process.env.STUDIOSHARE_WEBHOOK_URL;
  const targets = [
    slackUrl && { name: 'Slack', url: slackUrl },
    studioShareUrl && { name: 'StudioShare', url: studioShareUrl },
  ].filter((entry): entry is { name: string; url: string } => Boolean(entry && entry.url));

  if (!targets.length) {
    console.log('ℹ️  No notifier targets configured (set SLACK_WEBHOOK_URL or STUDIOSHARE_WEBHOOK_URL).');
  }

  if (dryRun) {
    console.log('🔍 DRY_RUN active — payload preview only.');
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const results: WebhookResult[] = [];
  for (const target of targets) {
    try {
      const result = await postWebhook(target.url, payload);
      results.push(result);
      if (result.ok) {
        console.log(`📡 Notified ${target.name} (${result.status} ${result.statusText}).`);
      } else {
        console.error(`⚠️  ${target.name} notification failed (${result.status} ${result.statusText}).`);
      }
    } catch (err) {
      console.error(`⚠️  ${target.name} notification error:`, err);
    }
  }

  if (!results.length && targets.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Codex notification failed.');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

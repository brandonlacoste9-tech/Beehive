import type { Handler } from "@netlify/functions";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const BEACON_TOKEN = process.env.BEACON_TOKEN;

async function postWithRetry(
  url: string,
  body: unknown,
  tries = 3,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return res;
    }

    lastErr = await res.text().catch(() => `HTTP ${res.status}`);

    const delayMs = 250 * 2 ** attempt;
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(
    `Slack webhook failed after ${tries} attempts: ${String(lastErr)}`,
  );
}

function pickString(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === "string" && value ? value : undefined;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: "method not allowed" };
  }

  if (!SLACK_WEBHOOK_URL) {
    return { statusCode: 500, body: "Missing SLACK_WEBHOOK_URL" };
  }

  const isLocal = (process.env.CONTEXT ?? "local") === "local";
  const headerToken =
    event.headers?.["x-beehive-token"] ??
    event.headers?.["X-Beehive-Token"] ??
    event.headers?.["X-BEEHIVE-TOKEN"];

  if (!isLocal) {
    if (!BEACON_TOKEN || headerToken !== BEACON_TOKEN) {
      return { statusCode: 401, body: "unauthorized" };
    }
  }

  let parsedBody: Record<string, unknown> = {};
  if (event.body) {
    try {
      const candidate = JSON.parse(event.body) as unknown;
      if (typeof candidate === "object" && candidate) {
        parsedBody = candidate as Record<string, unknown>;
      }
    } catch {
      // Ignore malformed JSON and fall back to env vars.
    }
  }

  const payloadPart = parsedBody.payload;
  const meta =
    (typeof payloadPart === "object" && payloadPart
      ? (payloadPart as Record<string, unknown>)
      : parsedBody) ?? {};

  const ctx = {
    siteName: process.env.SITE_NAME ?? pickString(meta, "site_name"),
    context: process.env.CONTEXT ?? pickString(meta, "context"),
    branch: process.env.BRANCH ?? pickString(meta, "branch"),
    commitRef:
      process.env.COMMIT_REF ??
      pickString(meta, "commit_ref") ??
      pickString(meta, "commit_ref_sha"),
    url: process.env.URL ?? pickString(meta, "url"),
    deployUrl: process.env.DEPLOY_URL ?? pickString(meta, "deploy_url"),
    deployPrimeUrl:
      process.env.DEPLOY_PRIME_URL ?? pickString(meta, "deploy_prime_url"),
    deployId: pickString(meta, "id") ?? pickString(meta, "deploy_id"),
    publishedAt: pickString(meta, "published_at"),
    createdAt: pickString(parsedBody, "created_at"),
  };

  const now = new Date().toISOString();
  const lines = [
    ":honeybee: *BeeHive deploy complete!*",
    `- *Time:* ${now}`,
    ctx.context && `- *Context:* ${ctx.context}`,
    ctx.branch && `- *Branch:* ${ctx.branch}`,
    ctx.commitRef && `- *Commit:* ${ctx.commitRef}`,
    ctx.url && `- *Site:* ${ctx.url}`,
    ctx.deployUrl && `- *Deploy:* ${ctx.deployUrl}`,
    ctx.deployPrimeUrl && `- *Prime:* ${ctx.deployPrimeUrl}`,
    ctx.publishedAt && `- *Published:* ${ctx.publishedAt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const blocks: Array<Record<string, unknown>> = [
    { type: "section", text: { type: "mrkdwn", text: lines } },
  ];

  if (ctx.deployId || ctx.createdAt) {
    const metaLineParts = [
      ctx.deployId && `deploy_id: \`${ctx.deployId}\``,
      ctx.createdAt && `created_at: ${ctx.createdAt}`,
    ].filter(Boolean);

    if (metaLineParts.length > 0) {
      blocks.push({
        type: "context",
        elements: [{ type: "mrkdwn", text: metaLineParts.join(" | ") }],
      });
    }
  }

  const payload = {
    text: `BeeHive deploy: ${ctx.siteName ?? ""}`,
    blocks,
  };

  try {
    await postWithRetry(SLACK_WEBHOOK_URL, payload, 3);
    return { statusCode: 200, body: JSON.stringify({ ok: true, ctx }) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Slack webhook failed: ${String(error)}`;
    console.error(message);
    return { statusCode: 502, body: message };
  }
};

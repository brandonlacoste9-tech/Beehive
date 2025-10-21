import type { Handler } from '@netlify/functions';
import { echoSparkStatus, type CodexSparkStatus } from '../lib/codex_spark_echo';

const BEACON_TOKEN = process.env.BEACON_TOKEN;
const SPARK_BUILD_URL =
  process.env.CODEX_SPARK_BUILD_URL || process.env.SPARK_BUILD_WEBHOOK_URL || process.env.SPARK_BUILD_URL;
const SPARK_BUILD_TOKEN = process.env.CODEX_SPARK_BUILD_TOKEN || process.env.SPARK_BUILD_TOKEN;
const NETLIFY_SITE_ID = process.env.CODEX_SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
const NETLIFY_TOKEN =
  process.env.CODEX_NETLIFY_TOKEN || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN;
const NETLIFY_API_BASE = process.env.NETLIFY_API_BASE || 'https://api.netlify.com/api/v1';

interface DeployRequest {
  jobId?: string;
  note?: string;
  branch?: string;
  commitRef?: string;
  context?: string;
  draft?: boolean;
  title?: string;
  message?: string;
  artifactUrl?: string;
  previewUrl?: string;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
}

type SparkBuildResult = {
  jobId: string;
  artifactUrl?: string | null;
  previewUrl?: string | null;
  sizeBytes?: number | null;
};

function isLocalContext() {
  const ctx = (process.env.CONTEXT || '').toLowerCase();
  return ctx === 'local' || ctx === 'dev' || ctx === 'development' || process.env.NETLIFY_DEV === 'true';
}

async function triggerSparkBuild(jobId: string, body: DeployRequest): Promise<SparkBuildResult> {
  if (!SPARK_BUILD_URL) {
    return {
      jobId,
      artifactUrl: body.artifactUrl ?? null,
      previewUrl: body.previewUrl ?? null,
      sizeBytes: typeof body.sizeBytes === 'number' ? body.sizeBytes : null,
    };
  }

  const payload = {
    jobId,
    branch: body.branch,
    commitRef: body.commitRef,
    context: body.context,
    metadata: body.metadata ?? null,
  };

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (SPARK_BUILD_TOKEN) {
    headers['Authorization'] = `Bearer ${SPARK_BUILD_TOKEN}`;
  }

  const res = await fetch(SPARK_BUILD_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Spark build failed (${res.status}): ${text}`);
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const artifactUrl = typeof json['artifactUrl'] === 'string' ? json['artifactUrl'] : body.artifactUrl ?? null;
  const previewUrl = typeof json['previewUrl'] === 'string' ? json['previewUrl'] : body.previewUrl ?? null;
  const sizeBytes =
    typeof json['sizeBytes'] === 'number'
      ? json['sizeBytes']
      : typeof body.sizeBytes === 'number'
      ? body.sizeBytes
      : null;
  const resultJobId = typeof json['jobId'] === 'string' ? json['jobId'] : jobId;

  return { jobId: resultJobId, artifactUrl, previewUrl, sizeBytes };
}

async function createNetlifyDeploy(jobId: string, build: SparkBuildResult, body: DeployRequest) {
  if (!NETLIFY_SITE_ID || !NETLIFY_TOKEN) {
    throw new Error('Missing Netlify site credentials');
  }

  const deployPayload: Record<string, unknown> = {
    branch: body.branch ?? null,
    commit_ref: body.commitRef ?? null,
    context: body.context ?? null,
    draft: body.draft ?? false,
    title: body.title || body.message || `Codex Spark ${jobId}`,
    message: body.message || body.title || `Codex Spark deploy ${jobId}`,
    metadata: { ...(body.metadata ?? {}), jobId },
  };

  if (build.artifactUrl) {
    deployPayload['zip_url'] = build.artifactUrl;
  }

  const res = await fetch(`${NETLIFY_API_BASE}/sites/${NETLIFY_SITE_ID}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deployPayload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Netlify deploy failed (${res.status}): ${text}`);
  }

  const deploy = (await res.json()) as Record<string, unknown>;
  const deployId = typeof deploy['id'] === 'string' ? deploy['id'] : undefined;
  const sslUrl = typeof deploy['deploy_ssl_url'] === 'string' ? deploy['deploy_ssl_url'] : undefined;
  const deployUrl = typeof deploy['deploy_url'] === 'string' ? deploy['deploy_url'] : undefined;
  const branchDeployUrl =
    typeof deploy['links'] === 'object' &&
    deploy['links'] &&
    typeof (deploy['links'] as Record<string, unknown>)['preview'] === 'string'
      ? ((deploy['links'] as Record<string, unknown>)['preview'] as string)
      : undefined;

  return {
    deployId,
    previewUrl: sslUrl || deployUrl || branchDeployUrl || build.previewUrl || null,
  };
}

function makeBadge(status: CodexSparkStatus['status'], jobId?: string, previewUrl?: string | null) {
  const normalized = status.toLowerCase();
  const color =
    normalized === 'success' ? 'green' : normalized === 'failed' ? 'red' : normalized === 'deploying' ? 'blue' : 'orange';

  return {
    schemaVersion: 1,
    label: 'codex spark',
    message: normalized,
    color,
    namedLogo: 'netlify',
    extra: {
      jobId: jobId ?? null,
      previewUrl: previewUrl ?? null,
    },
  };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method not allowed' };
  }

  if (!isLocalContext()) {
    const headerToken =
      (event.headers['x-beehive-token'] as string) ||
      (event.headers['X-Beehive-Token'] as unknown as string) ||
      (event.headers['X-BEEHIVE-TOKEN'] as unknown as string);
    if (!BEACON_TOKEN || headerToken !== BEACON_TOKEN) {
      return { statusCode: 401, body: 'unauthorized' };
    }
  }

  let body: DeployRequest = {};
  if (event.body) {
    try {
      const parsed = JSON.parse(event.body);
      if (typeof parsed === 'object' && parsed) {
        body = parsed as DeployRequest;
      }
    } catch {
      // ignore invalid payloads
    }
  }

  const jobId = body.jobId || `spark-${Date.now()}`;
  const triggeredAt = new Date().toISOString();

  let latest: CodexSparkStatus = await echoSparkStatus({
    jobId,
    status: 'queued',
    note: body.note ?? 'codex spark deploy queued',
    triggeredAt,
  });

  try {
    latest = await echoSparkStatus({
      jobId: latest.jobId,
      status: 'building',
      note: 'building spark artifact',
      triggeredAt: latest.triggeredAt,
    });

    const build = await triggerSparkBuild(latest.jobId, body);

    latest = await echoSparkStatus({
      jobId: latest.jobId,
      status: 'deploying',
      artifactUrl: build.artifactUrl ?? undefined,
      sizeBytes: build.sizeBytes ?? undefined,
      previewUrl: build.previewUrl ?? undefined,
      triggeredAt: latest.triggeredAt,
      note: 'creating Netlify deploy',
    });

    const deploy = await createNetlifyDeploy(latest.jobId, build, body);

    latest = await echoSparkStatus({
      jobId: latest.jobId,
      status: 'success',
      previewUrl: deploy.previewUrl ?? latest.previewUrl ?? null,
      deployId: deploy.deployId ?? null,
      triggeredAt: latest.triggeredAt,
      completedAt: new Date().toISOString(),
      note: 'spark deploy succeeded',
      artifactUrl: build.artifactUrl ?? undefined,
      sizeBytes: build.sizeBytes ?? undefined,
    });

    const badge = makeBadge(latest.status, latest.jobId, latest.previewUrl ?? null);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        ok: true,
        jobId: latest.jobId,
        deployId: latest.deployId,
        status: latest.status,
        previewUrl: latest.previewUrl ?? null,
        artifactUrl: build.artifactUrl ?? null,
        sizeBytes: build.sizeBytes ?? null,
        badge,
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    latest = await echoSparkStatus({
      jobId: latest.jobId,
      status: 'failed',
      note: message,
      triggeredAt: latest.triggeredAt,
      completedAt: new Date().toISOString(),
      artifactUrl: latest.artifactUrl ?? null,
      previewUrl: latest.previewUrl ?? null,
    });
    const badge = makeBadge('failed', latest.jobId, latest.previewUrl ?? null);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: false, jobId: latest.jobId, status: 'failed', error: message, badge }),
    };
  }
};

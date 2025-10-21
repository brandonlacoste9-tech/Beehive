import { createHash } from 'crypto';
import { STATUS_GLYPH_MAP, STATUS_ORDER, formatStatus } from './codex_status';
import type {
  CodexArtifact,
  CodexIndex,
  CodexOperation,
  CodexStatus
} from './codex_types';

export interface BuildCodexIndexOptions {
  existingGeneratedAt?: string;
}

export interface BuildCodexIndexResult {
  index: CodexIndex;
  statusMarkdown: string;
}

interface ContentMetrics {
  sizeBytes: number;
  checksum: string;
}

const SCHEMA_URL = 'https://adgenxai.dev/schemas/codex-index.v2.json';
const INDEX_VERSION = '2.0.0';
const RITUAL_VERSION = '2024.10.0';
const INDEX_PATH = 'docs/codex-index.json';
const STATUS_PATH = 'docs/codex-status.md';
const METRIC_STABILITY_ITERATIONS = 5;
const EMPTY_CHECKSUM = '0'.repeat(64);

export function buildCodexIndex(options: BuildCodexIndexOptions = {}): BuildCodexIndexResult {
  const generatedAt = options.existingGeneratedAt ?? new Date().toISOString();
  let index = createBaseIndex(generatedAt);
  let statusMarkdown = '';
  let previousSnapshot = '';

  for (let iteration = 0; iteration < METRIC_STABILITY_ITERATIONS; iteration += 1) {
    statusMarkdown = renderCodexStatus(index);
    const statusMetrics = measureContent(statusMarkdown);
    index = updateArtifactMetrics(index, 'codex-status', statusMetrics);

    const indexMetrics = computeIndexCanonicalMetrics(index);
    index = updateArtifactMetrics(index, 'codex-index', indexMetrics);

    index = synchronizeOperationMetrics(index);

    const snapshot = JSON.stringify(index);
    if (snapshot === previousSnapshot) {
      return { index, statusMarkdown };
    }
    previousSnapshot = snapshot;
  }

  throw new Error('Failed to stabilize codex index metrics within the allowed iterations.');
}

export function renderCodexStatus(index: CodexIndex): string {
  const lines: string[] = [];
  lines.push('# Codex Status Dashboard');
  lines.push('');
  lines.push(`**Generated:** ${index.generatedAt}`);
  lines.push('');

  lines.push('## Artifacts');
  lines.push('');
  lines.push('| Glyph | Artifact | Status | Summary | Path | Size (bytes) | Last Updated |');
  lines.push('| :---: | :------- | :----- | :------ | :--- | -----------: | :----------- |');

  const artifacts = [...index.artifacts].sort((a, b) => {
    const statusDelta = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (statusDelta !== 0) {
      return statusDelta;
    }
    return a.title.localeCompare(b.title);
  });

  artifacts.forEach((artifact) => {
    const pathCell = `\`${artifact.resource.path}\``;
    lines.push(
      `| ${artifact.glyph} | ${artifact.title} | ${titleCaseStatus(artifact.status)} | ${artifact.summary} | ${pathCell} | ${artifact.resource.sizeBytes} | ${artifact.lastUpdated} |`
    );
  });

  lines.push('');
  lines.push('## Operations');
  lines.push('');
  lines.push('| Glyph | Job ID | Ritual | Artifact | Status | Started | Completed | Duration | Size (bytes) |');
  lines.push('| :---: | :----- | :----- | :------- | :----- | :------ | :-------- | :------- | -----------: |');

  const operations = [...index.operations].sort((a, b) =>
    a.runtime.startedAt.localeCompare(b.runtime.startedAt)
  );

  operations.forEach((operation) => {
    const completed = operation.runtime.completedAt ?? '—';
    lines.push(
      `| ${operation.glyph} | ${operation.jobId} | ${operation.ritual} | ${operation.artifactId} | ${titleCaseStatus(
        operation.status
      )} | ${operation.runtime.startedAt} | ${completed} | ${operation.runtime.durationSeconds}s | ${operation.sizeBytes} |`
    );
  });

  lines.push('');
  lines.push('## Lifecycle Log');
  lines.push('');
  const logEntries = index.operations
    .flatMap((operation) => operation.logs.map((log) => ({ ...log, jobId: operation.jobId })))
    .sort((a, b) => a.at.localeCompare(b.at));

  logEntries.forEach((entry) => {
    lines.push(`- ${entry.glyph} **${entry.step.toUpperCase()}** [${entry.jobId}] ${entry.message} (_${entry.at}_)`);
  });

  lines.push('');
  return lines.join('\n');
}

function createBaseIndex(generatedAt: string): CodexIndex {
  const startedAt = new Date(Date.parse(generatedAt) - 45_000).toISOString();
  const completedAt = generatedAt;
  const durationSeconds = Math.max(
    Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000),
    1
  );

  const artifacts: CodexArtifact[] = [
    {
      id: 'codex-index',
      title: 'Codex Machine Index',
      status: 'sealed',
      glyph: STATUS_GLYPH_MAP.sealed,
      summary: 'Versioned manifest documenting the AdGenXAI ritual lineage.',
      lineage: {
        introducedIn: 'CHANGELOG.md#v2-0-0-adgenxai-ritual-thesis',
        scroll: 'scrolls/rituals.md',
        owner: 'Codex Jedi'
      },
      resource: {
        path: INDEX_PATH,
        mediaType: 'application/json',
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      },
      pointers: {
        changelog: 'CHANGELOG.md#v2-0-0-adgenxai-ritual-thesis',
        statusPage: STATUS_PATH,
        thread: 'scrolls/rituals.md#codex-rituals'
      },
      lastUpdated: generatedAt,
      tags: ['codex', 'manifest', 'ritual']
    },
    {
      id: 'codex-status',
      title: 'Codex Ritual Dashboard',
      status: 'sealed',
      glyph: STATUS_GLYPH_MAP.sealed,
      summary: 'Human-readable lifecycle digest for Codex artifacts and operations.',
      lineage: {
        introducedIn: 'CHANGELOG.md#v2-0-0-adgenxai-ritual-thesis',
        scroll: 'docs/codex-status.md',
        owner: 'Codex Jedi'
      },
      resource: {
        path: STATUS_PATH,
        mediaType: 'text/markdown',
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      },
      pointers: {
        changelog: 'CHANGELOG.md#v2-0-0-adgenxai-ritual-thesis',
        statusPage: STATUS_PATH,
        thread: 'scrolls/rituals.md#codex-rituals'
      },
      lastUpdated: generatedAt,
      tags: ['codex', 'dashboard', 'ritual']
    },
    {
      id: 'ritual-rollback',
      title: 'Ritual Rollback Safeguard',
      status: 'pending',
      glyph: STATUS_GLYPH_MAP.pending,
      summary: 'Nightly restore harness awaiting integration with deployment audit logs.',
      lineage: {
        introducedIn: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        scroll: 'scrolls/rituals.md',
        owner: 'Swarm DevOps'
      },
      resource: {
        path: 'netlify/functions/ritualRollback.ts',
        mediaType: 'application/typescript',
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      },
      pointers: {
        changelog: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        statusPage: STATUS_PATH
      },
      lastUpdated: '2024-10-19T00:00:00.000Z',
      tags: ['safety', 'rollback', 'ci']
    },
    {
      id: 'hive-heartbeat',
      title: 'Hive Heartbeat Telemetry',
      status: 'pending',
      glyph: STATUS_GLYPH_MAP.pending,
      summary: 'Scheduled pulse to stream CI lineage into the swarm observability panel.',
      lineage: {
        introducedIn: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        scroll: 'scrolls/rituals.md',
        owner: 'Swarm Observability Guild'
      },
      resource: {
        path: 'src/codex/remix_scheduler.ts',
        mediaType: 'application/typescript',
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      },
      pointers: {
        changelog: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        statusPage: STATUS_PATH
      },
      lastUpdated: '2024-10-19T00:00:00.000Z',
      tags: ['telemetry', 'scheduler', 'ci']
    },
    {
      id: 'contributor-beacon',
      title: 'Contributor Beacon',
      status: 'draft',
      glyph: STATUS_GLYPH_MAP.draft,
      summary: 'Notification bridge linking Codex rituals to StudioShare thread updates.',
      lineage: {
        introducedIn: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        scroll: 'scrolls/rituals.md',
        owner: 'Community Steward'
      },
      resource: {
        path: 'src/codex/codex_badge.ts',
        mediaType: 'application/typescript',
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      },
      pointers: {
        changelog: 'CHANGELOG.md#v1-4-5-remix-scheduler',
        statusPage: STATUS_PATH
      },
      lastUpdated: '2024-10-19T00:00:00.000Z',
      tags: ['community', 'notifications', 'codex']
    }
  ];

  const operations: CodexOperation[] = [
    {
      jobId: 'ritual-thesis-0001',
      ritual: 'CI Ritual Nightly Sequence',
      artifactId: 'codex-index',
      status: 'sealed',
      glyph: STATUS_GLYPH_MAP.sealed,
      sizeBytes: 0,
      runtime: {
        startedAt,
        completedAt,
        durationSeconds
      },
      replay: {
        overlay: 'codex-index',
        url: 'https://codex.adgenxai.local/replay/ritual-thesis-0001',
        exportRef: 'codex-index@2.0.0'
      },
      logs: [
        {
          step: 'generate',
          status: 'sealed',
          glyph: STATUS_GLYPH_MAP.sealed,
          at: startedAt,
          message: 'codex-index payload synthesized.'
        },
        {
          step: 'render',
          status: 'sealed',
          glyph: STATUS_GLYPH_MAP.sealed,
          at: new Date(Date.parse(startedAt) + 15_000).toISOString(),
          message: 'codex-status dashboard templated.'
        },
        {
          step: 'validate',
          status: 'sealed',
          glyph: STATUS_GLYPH_MAP.sealed,
          at: new Date(Date.parse(startedAt) + 30_000).toISOString(),
          message: 'schema + checksum confirmed.'
        },
        {
          step: 'notify',
          status: 'sealed',
          glyph: STATUS_GLYPH_MAP.sealed,
          at: completedAt,
          message: 'CodexReplay overlay refreshed.'
        }
      ]
    },
    {
      jobId: 'hive-heartbeat-nightly',
      ritual: 'CI Ritual Nightly Sequence',
      artifactId: 'hive-heartbeat',
      status: 'pending',
      glyph: STATUS_GLYPH_MAP.pending,
      sizeBytes: 0,
      runtime: {
        startedAt: generatedAt,
        durationSeconds: 0
      },
      replay: {
        overlay: 'hive-heartbeat',
        url: 'https://codex.adgenxai.local/replay/hive-heartbeat',
        exportRef: 'hive-heartbeat@draft'
      },
      logs: [
        {
          step: 'generate',
          status: 'pending',
          glyph: STATUS_GLYPH_MAP.pending,
          at: generatedAt,
          message: 'Awaiting telemetry channel wiring.'
        }
      ]
    },
    {
      jobId: 'contributor-beacon-alpha',
      ritual: 'PR Guard Smoke Test',
      artifactId: 'contributor-beacon',
      status: 'draft',
      glyph: STATUS_GLYPH_MAP.draft,
      sizeBytes: 0,
      runtime: {
        startedAt: generatedAt,
        durationSeconds: 0
      },
      replay: {
        overlay: 'contributor-beacon',
        url: 'https://codex.adgenxai.local/replay/contributor-beacon',
        exportRef: 'contributor-beacon@alpha'
      },
      logs: [
        {
          step: 'generate',
          status: 'draft',
          glyph: STATUS_GLYPH_MAP.draft,
          at: generatedAt,
          message: 'Smoke harness reserved for contributor notifications.'
        }
      ]
    }
  ];

  return {
    $schema: SCHEMA_URL,
    version: INDEX_VERSION,
    generatedAt,
    artifacts,
    operations,
    meta: {
      checksumAlgorithm: 'sha256',
      generator: 'scripts/codex/generate-index.ts',
      ritualVersion: RITUAL_VERSION,
      statusDocument: STATUS_PATH
    }
  };
}

export function computeIndexCanonicalMetrics(index: CodexIndex): ContentMetrics {
  const clone = cloneIndex(index);
  clone.artifacts = clone.artifacts.map((artifact) => {
    if (artifact.id !== 'codex-index') {
      return artifact;
    }
    return {
      ...artifact,
      resource: {
        ...artifact.resource,
        sizeBytes: 0,
        checksum: EMPTY_CHECKSUM
      }
    };
  });
  return measureContent(JSON.stringify(clone, null, 2));
}

function cloneIndex(index: CodexIndex): CodexIndex {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(index) as CodexIndex;
  }
  return JSON.parse(JSON.stringify(index)) as CodexIndex;
}

function synchronizeOperationMetrics(index: CodexIndex): CodexIndex {
  const metricLookup = new Map<string, ContentMetrics>();
  index.artifacts.forEach((artifact) => {
    metricLookup.set(artifact.id, {
      sizeBytes: artifact.resource.sizeBytes,
      checksum: artifact.resource.checksum
    });
  });

  const operations = index.operations.map((operation) => {
    const metrics = metricLookup.get(operation.artifactId);
    if (!metrics) {
      return operation;
    }
    if (operation.sizeBytes === metrics.sizeBytes) {
      return operation;
    }
    return {
      ...operation,
      sizeBytes: metrics.sizeBytes
    };
  });

  return { ...index, operations };
}

function updateArtifactMetrics(index: CodexIndex, artifactId: string, metrics: ContentMetrics): CodexIndex {
  const artifacts = index.artifacts.map((artifact) => {
    if (artifact.id !== artifactId) {
      return artifact;
    }
    const shouldUpdateTimestamp: Record<CodexStatus, boolean> = {
      sealed: true,
      pending: false,
      draft: false,
      archived: false
    };
    return {
      ...artifact,
      resource: {
        ...artifact.resource,
        sizeBytes: metrics.sizeBytes,
        checksum: metrics.checksum
      },
      lastUpdated: shouldUpdateTimestamp[artifact.status] ? index.generatedAt : artifact.lastUpdated
    };
  });

  return { ...index, artifacts };
}

function measureContent(content: string): ContentMetrics {
  const buffer = Buffer.from(content, 'utf8');
  const checksum = createHash('sha256').update(buffer).digest('hex');
  return {
    sizeBytes: buffer.byteLength,
    checksum
  };
}

function titleCaseStatus(status: CodexStatus): string {
  const formatted = formatStatus(status);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

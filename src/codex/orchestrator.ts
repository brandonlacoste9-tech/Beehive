import { grandLaunchLedger, type LedgerEntry } from './_logger';
import { codexBadge, type CodexBadge } from './codex_badge';
import { codexEcho } from './codex_echo';
import { addHistoryEntry, type HistoryEntry } from './codex_history';
import { scheduleRemix, type RemixScheduleReceipt } from './remix_scheduler';
import {
  createInvocation,
  type InvocationMetadata,
  type InvocationRecord,
  type InvocationStatus,
} from './invocation_protocol';

export interface GrandLaunchConfig {
  operator: string;
  releaseTag: string;
  jobId?: string;
  sizeBytes?: number;
  notes?: string;
  payload?: Record<string, unknown>;
}

export interface GrandLaunchOutcome {
  invocation: InvocationRecord;
  ledgerEntry: LedgerEntry;
  badge: CodexBadge;
  broadcast: string;
  history: HistoryEntry[];
  overlay: GrandLaunchOverlay;
}

export interface GrandLaunchOverlay {
  jobId: string;
  operator: string;
  releaseTag: string;
  status: InvocationStatus;
  updatedAt: string;
  eventCount: number;
  badgeId: string;
  badgeLabel: string;
  broadcast: string;
  sizeBytes?: number;
  notes?: string;
  stage?: string;
}

type GrandLaunchMetadata = InvocationMetadata & {
  jobId: string;
  operator: string;
  releaseTag: string;
  sizeBytes?: number;
  notes?: string;
  stage?: string;
  badge?: CodexBadge;
  broadcast?: string;
};

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asCodexBadge(value: unknown): CodexBadge | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<CodexBadge>;
  if (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.issuedAt === 'string' &&
    (candidate.status === 'minted' || candidate.status === 'revoked')
  ) {
    return {
      id: candidate.id,
      label: candidate.label,
      issuedAt: candidate.issuedAt,
      status: candidate.status,
    };
  }
  return undefined;
}

type MetadataRecord = Partial<GrandLaunchMetadata>;

function extractGrandLaunchMetadata(entry: LedgerEntry): MetadataRecord {
  const metadata = entry.invocation.metadata as Record<string, unknown> | undefined;
  if (!metadata) return {};

  const record: MetadataRecord = {};
  const jobId = asString(metadata.jobId);
  if (jobId) record.jobId = jobId;
  const operator = asString(metadata.operator);
  if (operator) record.operator = operator;
  const releaseTag = asString(metadata.releaseTag);
  if (releaseTag) record.releaseTag = releaseTag;
  const sizeBytes = asNumber(metadata.sizeBytes);
  if (typeof sizeBytes === 'number') record.sizeBytes = sizeBytes;
  const notes = asString(metadata.notes);
  if (notes) record.notes = notes;
  const stage = asString(metadata.stage);
  if (stage) record.stage = stage;
  const badge = asCodexBadge(metadata.badge);
  if (badge) record.badge = badge;
  const broadcast = asString(metadata.broadcast);
  if (broadcast) record.broadcast = broadcast;

  return record;
}

export function summarizeGrandLaunch(entry: LedgerEntry): GrandLaunchOverlay {
  const metadata = extractGrandLaunchMetadata(entry);
  const badge = metadata.badge ?? {
    id: entry.invocation.id,
    label: 'Grand Launch Badge',
    issuedAt: entry.invocation.updatedAt,
    status: 'minted',
  };

  return {
    jobId: metadata.jobId ?? entry.invocation.id,
    operator: metadata.operator ?? 'unknown-operator',
    releaseTag: metadata.releaseTag ?? 'unversioned',
    status: entry.invocation.status,
    updatedAt: entry.invocation.updatedAt,
    eventCount: entry.events.length,
    badgeId: badge.id,
    badgeLabel: badge.label,
    broadcast: metadata.broadcast ?? 'Grand Launch broadcast pending.',
    sizeBytes: metadata.sizeBytes,
    notes: metadata.notes,
    stage: metadata.stage,
  };
}

export function collectGrandLaunchOverlays(): GrandLaunchOverlay[] {
  return grandLaunchLedger.snapshot().map((entry) => summarizeGrandLaunch(entry));
}

function buildMetadata(config: GrandLaunchConfig): GrandLaunchMetadata {
  const jobId = config.jobId ?? `launch-${Date.now()}`;
  const metadata: GrandLaunchMetadata = {
    operator: config.operator,
    releaseTag: config.releaseTag,
    jobId,
  };
  if (typeof config.sizeBytes === 'number') metadata.sizeBytes = config.sizeBytes;
  if (config.notes) metadata.notes = config.notes;
  return metadata;
}

export function initiateGrandLaunch(config: GrandLaunchConfig): GrandLaunchOutcome {
  const metadata = buildMetadata(config);
  const invocation = createInvocation({
    ritual: 'grand_launch',
    payload: config.payload,
    metadata,
  });

  grandLaunchLedger.start(invocation, metadata, `Grand Launch invoked by ${config.operator}`);

  if (typeof config.sizeBytes === 'number') {
    grandLaunchLedger.annotate(invocation.id, 'Payload sealed', {
      sizeBytes: config.sizeBytes,
    });
  }
  if (config.notes) {
    grandLaunchLedger.annotate(invocation.id, 'Operator notes attached', {
      notes: config.notes,
    });
  }

  const schedulerResult: RemixScheduleReceipt = scheduleRemix();
  grandLaunchLedger.annotate(invocation.id, 'Remix scheduler primed', {
    schedulerResult,
  });

  const badge: CodexBadge = codexBadge();
  grandLaunchLedger.annotate(invocation.id, 'Launch badge minted', { badge });

  const broadcast = codexEcho('Grand Launch handshake confirmed.');
  grandLaunchLedger.annotate(invocation.id, 'Invocation broadcast', {
    broadcast,
  });

  let history: HistoryEntry[] = [];
  history = addHistoryEntry(history, {
    timestamp: new Date(),
    message: `Grand Launch invoked by ${config.operator} (job: ${metadata.jobId})`,
  });
  if (typeof config.sizeBytes === 'number') {
    history = addHistoryEntry(history, {
      timestamp: new Date(),
      message: `Payload size recorded: ${config.sizeBytes} bytes`,
    });
  }
  if (config.notes) {
    history = addHistoryEntry(history, {
      timestamp: new Date(),
      message: `Operator notes: ${config.notes}`,
    });
  }
  history = addHistoryEntry(history, {
    timestamp: new Date(),
    message: `Scheduler response: ${schedulerResult.jobId} (${schedulerResult.status})`,
  });
  history = addHistoryEntry(history, {
    timestamp: new Date(),
    message: `Badge minted: ${badge.id}`,
  });
  history = addHistoryEntry(history, {
    timestamp: new Date(),
    message: `Broadcast sent: ${broadcast}`,
  });

  grandLaunchLedger.complete(invocation.id, { stage: 'sealed' }, 'Grand Launch sealed');

  const ledgerEntry = grandLaunchLedger.get(invocation.id);
  const safeEntry: LedgerEntry =
    ledgerEntry ?? {
      invocation,
      events: [],
    };

  const overlay = summarizeGrandLaunch(safeEntry);

  history = addHistoryEntry(history, {
    timestamp: new Date(),
    message: `Grand Launch sealed (stage: ${overlay.stage ?? 'sealed'})`,
  });

  return {
    invocation: safeEntry.invocation,
    ledgerEntry: safeEntry,
    badge,
    broadcast,
    history,
    overlay,
  };
}

export function getGrandLaunchSnapshot(): LedgerEntry[] {
  return grandLaunchLedger.snapshot();
}

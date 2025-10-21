import { STATUS_ORDER } from './codex_status';
import type { CodexIndex, CodexStatus } from './codex_types';

export interface RemixScheduleSlot {
  jobId: string;
  ritual: string;
  status: CodexStatus;
  nextAction: string;
  startedAt: string;
}

export function scheduleRemix(index: CodexIndex): RemixScheduleSlot[] {
  return [...index.operations]
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
    .map((operation) => ({
      jobId: operation.jobId,
      ritual: operation.ritual,
      status: operation.status,
      startedAt: operation.runtime.startedAt,
      nextAction: nextActionForStatus(operation.status)
    }));
}

function nextActionForStatus(status: CodexStatus): string {
  switch (status) {
    case 'sealed':
      return 'Monitor and broadcast CodexReplay overlay.';
    case 'pending':
      return 'Wire telemetry feeds and configure nightly triggers.';
    case 'draft':
      return 'Harden smoke harness and publish contributor guidelines.';
    case 'archived':
      return 'Log archive confirmation in scroll registry.';
    default:
      return status satisfies never;
  }
}

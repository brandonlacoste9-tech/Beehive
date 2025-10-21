import type { CodexIndex, CodexLogEntry } from './codex_types';

export interface CodexHistoryEntry extends CodexLogEntry {
  jobId: string;
}

export function buildHistory(index: CodexIndex): CodexHistoryEntry[] {
  return index.operations
    .flatMap((operation) => operation.logs.map((log) => ({ ...log, jobId: operation.jobId })))
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function appendHistory(
  history: CodexHistoryEntry[],
  entry: CodexHistoryEntry
): CodexHistoryEntry[] {
  return [...history, entry].sort((a, b) => a.at.localeCompare(b.at));
}

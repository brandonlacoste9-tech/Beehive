// This file defines the Codex History for BeeHive v1.4.5
// TODO: Implement history tracking for Codex interactions

export interface HistoryEntry {
  timestamp: Date;
  message: string;
}

export function addHistoryEntry(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  return [...entries, entry];
}

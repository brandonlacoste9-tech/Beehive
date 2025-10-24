// ace-pack.ts (BeeHive Grand Launch Registry)
// Integrates Codex scroll helpers into the BeeHive runtime context.

import { type LedgerEntry } from '../codex/_logger';
import { codexBadge } from '../codex/codex_badge';
import { codexEcho } from '../codex/codex_echo';
import { addHistoryEntry } from '../codex/codex_history';
import {
  initiateGrandLaunch,
  getGrandLaunchSnapshot,
  collectGrandLaunchOverlays,
  type GrandLaunchOverlay,
  type GrandLaunchOutcome,
} from '../codex/orchestrator';
import { scheduleRemix } from '../codex/remix_scheduler';

export { scheduleRemix } from '../codex/remix_scheduler';
export { codexBadge } from '../codex/codex_badge';
export { codexEcho } from '../codex/codex_echo';
export { addHistoryEntry } from '../codex/codex_history';
export { initiateGrandLaunch, collectGrandLaunchOverlays } from '../codex/orchestrator';
export type { GrandLaunchOverlay, GrandLaunchOutcome } from '../codex/orchestrator';

export interface CodexRegistry {
  version: string;
  status: 'sealed';
  registeredAt: string;
  orchestrator: {
    initiateGrandLaunch: typeof initiateGrandLaunch;
    ledgerSnapshot: () => LedgerEntry[];
    overlays: () => GrandLaunchOverlay[];
  };
  helpers: {
    scheduleRemix: typeof scheduleRemix;
    codexBadge: typeof codexBadge;
    codexEcho: typeof codexEcho;
    addHistoryEntry: typeof addHistoryEntry;
  };
}

let cachedRegistry: CodexRegistry | null = null;

export function registerCodexScrolls(): CodexRegistry {
  if (cachedRegistry) {
    return cachedRegistry;
  }
  cachedRegistry = {
    version: 'grand-launch',
    status: 'sealed',
    registeredAt: new Date().toISOString(),
    orchestrator: {
      initiateGrandLaunch,
      ledgerSnapshot: () => getGrandLaunchSnapshot(),
      overlays: () => collectGrandLaunchOverlays(),
    },
    helpers: {
      scheduleRemix,
      codexBadge,
      codexEcho,
      addHistoryEntry,
    },
  };
  return cachedRegistry;
}

export function resolveGrandLaunchLedger(): LedgerEntry[] {
  registerCodexScrolls();
  return getGrandLaunchSnapshot();
}

export function resolveGrandLaunchOverlays(): GrandLaunchOverlay[] {
  registerCodexScrolls();
  return collectGrandLaunchOverlays();
}

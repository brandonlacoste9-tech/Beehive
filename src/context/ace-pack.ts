// ace-pack.ts (BeeHive v1.4.5 Remix Scheduler)
// This file integrates Codex scroll helpers into the BeeHive context.

import { scheduleRemix } from '../codex/remix_scheduler';
import { codexBadge } from '../codex/codex_badge';
import { codexEcho } from '../codex/codex_echo';
import { addHistoryEntry } from '../codex/codex_history';

export { scheduleRemix, codexBadge, codexEcho, addHistoryEntry };

type CodexRegistry = {
  remix: typeof scheduleRemix;
  badge: typeof codexBadge;
  echo: typeof codexEcho;
  history: typeof addHistoryEntry;
};

let registry: CodexRegistry | null = null;

export function registerCodexScrolls(): CodexRegistry {
  if (!registry) {
    registry = {
      remix: scheduleRemix,
      badge: codexBadge,
      echo: codexEcho,
      history: addHistoryEntry,
    };
  }
  return registry;
}

export function getCodexRegistry(): CodexRegistry {
  return registerCodexScrolls();
}

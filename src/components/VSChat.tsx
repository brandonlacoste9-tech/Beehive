'use client';

import AgentChat from './AgentChat';

type Props = {
  windowMin?: number;
};

export default function VSChat({ windowMin = 60 }: Props) {
  return (
    <div className="space-y-4">
      <AgentChat windowMin={windowMin} />
      <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
        VS Sandbox mirrors `/api/agent-chat-sandbox` when `NEXT_PUBLIC_CODEX_INSTANCE=sandbox-codex`.
        Use it to iterate on prompt mixers before sealing rituals in the main Codex.
      </div>
    </div>
  );
}

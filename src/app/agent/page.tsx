import AgentChat from '@/components/AgentChat';
import { CODEX_INSTANCE } from '@/lib/instance';

export default function AgentPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Agent{' '}
        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 border">
          {CODEX_INSTANCE}
        </span>
      </h1>
      <AgentChat windowMin={180} />
    </main>
  );
}


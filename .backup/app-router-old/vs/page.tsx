'use client';

import VSChat from '@/components/VSChat';

const isSandbox = process.env.NEXT_PUBLIC_CODEX_INSTANCE === 'sandbox-codex';

export default function VSPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">VS Chat</h1>
      {isSandbox && (
        <div className="rounded-lg border bg-yellow-50 p-3 text-sm">
          <strong>Sandbox mode:</strong>{' '}
          using <code>/api/agent-chat-sandbox</code> (no keys required)
        </div>
      )}
      <VSChat windowMin={180} />
      <p className="text-sm text-gray-500">
        Sandbox agent: works without keys. If your real env is configured, it will
        reflect live mood via <code>/api/sentiment</code>; otherwise it assumes neutral.
      </p>
    </main>
  );
}

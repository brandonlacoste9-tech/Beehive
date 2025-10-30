'use client';

type Payload = Record<string, unknown>;

const CAPABILITY = process.env.NEXT_PUBLIC_CODEX_CAPABILITY ?? '';

async function invokeBroadcast(path: string, payload: Payload) {
  if (!CAPABILITY) {
    throw new Error('Missing NEXT_PUBLIC_CODEX_CAPABILITY');
  }

  const res = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: {
      'x-codex-capability': CAPABILITY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    const truncated = text.length > 300 ? `${text.slice(0, 300)}…` : text;
    throw new Error(`Failed (${res.status}): ${truncated}`);
  }

  return text;
}

export default function BroadcastActions() {
  const notify = async (path: string, payload: Payload) => {
    try {
      const text = await invokeBroadcast(path, payload);
      const message = text ? `Broadcast sent.\n${text}` : 'Broadcast sent.';
      window.alert(message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Broadcast failed unexpectedly';
      window.alert(message);
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-6 flex flex-wrap gap-4">
      <button
        type="button"
        className="px-4 py-2 rounded bg-blue-600 text-white"
        onClick={() =>
          notify('broadcast-pr', {
            title: '🧬 Codex Mutation sealed',
            body: 'Preservation Wave — sealed and broadcasted.',
            base: 'main',
            head: 'feature/preservation-wave',
          })
        }
      >
        Create PR
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded bg-purple-600 text-white"
        onClick={() =>
          notify('broadcast-gist', {
            filename: 'codex.yml',
            content: '…paste your codex.yml content here…',
            description: 'Main Codex manifest',
            public: true,
          })
        }
      >
        Publish Gist
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded bg-emerald-600 text-white"
        onClick={() => notify('broadcast-netlify', {})}
      >
        Trigger Netlify Digest
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded bg-slate-700 text-white"
        onClick={() =>
          notify('broadcast-discord', {
            message: '📣 Codex: Preservation Wave sealed.',
          })
        }
      >
        Discord Broadcast
      </button>
      <button
        type="button"
        className="px-4 py-2 rounded bg-amber-600 text-white"
        onClick={() =>
          notify('gemini-generate', {
            prompt: 'Write 5 ad hooks for a skincare launch in French and English.',
            model: 'gemini-2.5-flash',
          })
        }
      >
        Gemini Scroll
      </button>
    </section>
  );
}

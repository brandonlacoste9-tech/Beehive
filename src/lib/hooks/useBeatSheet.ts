// Optional client helper (keeps UI minimal and decoupled)
export async function generateBeatSheet(input: {
  topic: string;
  audience: string;
  windowMin?: number;
  userInput?: string;
}) {
  const res = await fetch('/api/beat-sheet', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ windowMin: 180, ...input }),
  });
  if (!res.ok) throw new Error(`Beat-Sheet failed: ${res.status}`);
  return res.json() as Promise<{ ok: boolean; sentiment: any; result: string }>;
}


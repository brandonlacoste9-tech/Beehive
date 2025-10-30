import type { Mutation } from '@/components/MutationFeed';

const capability = process.env.NEXT_PUBLIC_CODEX_CAPABILITY ?? '';

export async function loadMutations(): Promise<Mutation[]> {
  const res = await fetch('/.netlify/functions/mutations', {
    method: 'GET',
    headers: { 'x-codex-capability': capability },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Mutation fetch failed: ${res.status}`);
  }

  const json = (await res.json()) as Mutation[];
  return Array.isArray(json) ? json : [];
}

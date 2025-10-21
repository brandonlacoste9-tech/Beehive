import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseCodexIndex } from '../src/codex/codex_schema';

describe('codex-index manifest', () => {
  it('matches the schema contract', async () => {
    const raw = await readFile('docs/codex-index.json', 'utf8');
    const parsed = parseCodexIndex(JSON.parse(raw));
    expect(parsed.version).toBe('2.0.0');
  });
});

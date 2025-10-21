import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseCodexIndex } from '../src/codex/codex_schema';
import { renderCodexStatus } from '../src/codex/ritual_thesis';

describe('codex-status dashboard', () => {
  it('renders identically from codex index', async () => {
    const raw = await readFile('docs/codex-index.json', 'utf8');
    const index = parseCodexIndex(JSON.parse(raw));
    const rendered = renderCodexStatus(index);
    const dashboard = await readFile('docs/codex-status.md', 'utf8');

    expect(rendered).toBe(dashboard);
    expect(rendered).toMatchSnapshot();
  });
});

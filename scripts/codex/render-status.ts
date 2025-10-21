import { readFile, writeFile } from 'node:fs/promises';
import { parseCodexIndex } from '../../src/codex/codex_schema';
import { renderCodexStatus } from '../../src/codex/ritual_thesis';

const INDEX_PATH = 'docs/codex-index.json';
const STATUS_PATH = 'docs/codex-status.md';

async function main(): Promise<void> {
  const raw = await readFile(INDEX_PATH, 'utf8');
  const index = parseCodexIndex(JSON.parse(raw));
  const rendered = renderCodexStatus(index);

  const previous = await readFile(STATUS_PATH, 'utf8').catch(() => undefined);
  if (previous === rendered) {
    console.log('[codex:render] codex-status dashboard already synchronized.');
    return;
  }

  await writeFile(STATUS_PATH, rendered, 'utf8');
  console.log(
    `[codex:render] refreshed ${STATUS_PATH} (${Buffer.byteLength(rendered, 'utf8')} bytes).`
  );
}

main().catch((error) => {
  console.error('[codex:render] ritual failed:', error);
  process.exitCode = 1;
});

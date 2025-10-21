import { readFile } from 'node:fs/promises';
import { parseCodexIndex } from '../../src/codex/codex_schema';
import { STATUS_GLYPH_MAP } from '../../src/codex/codex_status';

async function main(): Promise<void> {
  const raw = await readFile('docs/codex-index.json', 'utf8');
  const index = parseCodexIndex(JSON.parse(raw));

  const summary = index.operations.map((operation) => ({
    jobId: operation.jobId,
    glyph: STATUS_GLYPH_MAP[operation.status],
    status: operation.status,
    artifactId: operation.artifactId,
    overlay: operation.replay.overlay
  }));

  console.log('[codex:notify] broadcast payload:');
  console.log(JSON.stringify({ generatedAt: index.generatedAt, summary }, null, 2));
}

main().catch((error) => {
  console.error('[codex:notify] ritual failed:', error);
  process.exitCode = 1;
});

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseCodexIndex } from '../../src/codex/codex_schema';
import { computeIndexCanonicalMetrics } from '../../src/codex/ritual_thesis';

async function computeMetrics(path: string): Promise<{ sizeBytes: number; checksum: string }> {
  const content = await readFile(path);
  const checksum = createHash('sha256').update(content).digest('hex');
  return { sizeBytes: content.byteLength, checksum };
}

async function main(): Promise<void> {
  const raw = await readFile('docs/codex-index.json', 'utf8');
  const index = parseCodexIndex(JSON.parse(raw));

  for (const artifact of index.artifacts) {
    if (artifact.status !== 'sealed') {
      continue;
    }

    if (artifact.id === 'codex-index') {
      const { sizeBytes, checksum } = computeIndexCanonicalMetrics(index);
      if (sizeBytes !== artifact.resource.sizeBytes || checksum !== artifact.resource.checksum) {
        throw new Error(
          `Artifact ${artifact.id} canonical metrics drift detected. expected size=${artifact.resource.sizeBytes} checksum=${artifact.resource.checksum} but received size=${sizeBytes} checksum=${checksum}`
        );
      }
      continue;
    }

    const { sizeBytes, checksum } = await computeMetrics(artifact.resource.path);
    if (sizeBytes !== artifact.resource.sizeBytes || checksum !== artifact.resource.checksum) {
      throw new Error(
        `Artifact ${artifact.id} metrics drift detected. expected size=${artifact.resource.sizeBytes} checksum=${artifact.resource.checksum} but received size=${sizeBytes} checksum=${checksum}`
      );
    }
  }

  console.log('[codex:validate] codex-index.json passes schema and integrity checks.');
}

main().catch((error) => {
  console.error('[codex:validate] ritual failed:', error);
  process.exitCode = 1;
});

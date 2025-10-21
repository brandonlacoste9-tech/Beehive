import { readFile, writeFile } from 'node:fs/promises';
import { buildCodexIndex } from '../../src/codex/ritual_thesis';
import { parseCodexIndex } from '../../src/codex/codex_schema';

const INDEX_PATH = 'docs/codex-index.json';

async function readExistingGeneratedAt(): Promise<string | undefined> {
  try {
    const raw = await readFile(INDEX_PATH, 'utf8');
    const parsed = parseCodexIndex(JSON.parse(raw));
    return parsed.generatedAt;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function writeIndex(content: string): Promise<void> {
  await writeFile(INDEX_PATH, `${content}\n`, 'utf8');
}

async function main(): Promise<void> {
  const existingGeneratedAt = await readExistingGeneratedAt();
  const { index } = buildCodexIndex({ existingGeneratedAt });
  const serialized = JSON.stringify(index, null, 2);

  const previous = await readFile(INDEX_PATH, 'utf8').catch(() => undefined);
  if (previous?.trim() === serialized.trim()) {
    console.log(`[codex:generate] ${INDEX_PATH} already up to date.`);
    return;
  }

  await writeIndex(serialized);
  console.log(
    `[codex:generate] wrote ${INDEX_PATH} (${Buffer.byteLength(serialized, 'utf8')} bytes, generatedAt=${index.generatedAt}).`
  );
}

main().catch((error) => {
  console.error('[codex:generate] ritual failed:', error);
  process.exitCode = 1;
});

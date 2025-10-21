import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const codexPath = resolve('Codex-Main-Scroll.md');
  const text = await readFile(codexPath, 'utf8');
  if (!text.includes('Cookbook & Rituals')) {
    throw new Error('Codex main scroll missing cookbook cross-link');
  }
  console.log(JSON.stringify({
    ritual: 'wiki-publish',
    status: 'primed',
    codexPath,
    bytes: Buffer.byteLength(text)
  }));
}

main().catch((error) => {
  console.error(JSON.stringify({ ritual: 'wiki-publish', status: 'error', message: error.message }));
  process.exitCode = 1;
});

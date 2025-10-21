import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const target = resolve('scrolls/smoke-tests-beereel.md');
  const content = await readFile(target, 'utf8');
  const requiredSections = [
    '## Ritual Overview',
    '### /api/reels',
    '### /api/personas',
    '### /api/uploads'
  ];

  const missing = requiredSections.filter((marker) => !content.includes(marker));
  if (missing.length) {
    throw new Error(`Missing smoke-test sections: ${missing.join(', ')}`);
  }

  const lines = content.split(/\r?\n/).length;
  console.log(JSON.stringify({
    ritual: 'beereel-smoke',
    status: 'ready',
    path: target,
    sections: requiredSections.length,
    lines
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ ritual: 'beereel-smoke', status: 'error', message: error.message }));
  process.exitCode = 1;
});

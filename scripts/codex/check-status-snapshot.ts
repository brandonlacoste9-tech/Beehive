import { promises as fs } from 'fs';
import path from 'path';

function normalize(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

async function main() {
  const root = process.cwd();
  const actualPath = path.resolve(root, 'docs', 'codex-status.md');
  const expectedPath = path.resolve(root, 'fixtures', 'expected-codex-status.md');

  const [actual, expected] = await Promise.all([
    fs.readFile(actualPath, 'utf8').catch((err) => {
      throw new Error(`Missing codex status at ${actualPath}: ${(err as Error).message}`);
    }),
    fs.readFile(expectedPath, 'utf8').catch((err) => {
      throw new Error(
        `Missing snapshot at ${expectedPath}: ${(err as Error).message}\nRun \"npm run update-snapshot\" after rendering.`
      );
    }),
  ]);

  if (normalize(actual) !== normalize(expected)) {
    throw new Error(
      'Codex status snapshot mismatch. Re-run the ritual (npm run codex:ritual) and update the snapshot via npm run update-snapshot if the changes are intentional.'
    );
  }

  console.log('🛡️  Codex status snapshot verified.');
}

main().catch((err) => {
  console.error('Snapshot guard failed.');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

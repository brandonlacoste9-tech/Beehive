import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const root = process.cwd();
  const sourcePath = path.resolve(root, 'docs', 'codex-status.md');
  const destPath = path.resolve(root, 'fixtures', 'expected-codex-status.md');

  const contents = await fs.readFile(sourcePath, 'utf8').catch((err) => {
    throw new Error(
      `Unable to read ${sourcePath}: ${(err as Error).message}. Render the status first with npm run codex:render.`
    );
  });

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, contents);
  console.log(`📸 Snapshot updated → ${path.relative(root, destPath)}`);
}

main().catch((err) => {
  console.error('Snapshot update failed.');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

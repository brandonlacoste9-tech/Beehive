import path from 'path';

import { loadScrollRecords, writeFileEnsured } from './common';

async function main() {
  const root = process.cwd();
  const scrolls = await loadScrollRecords(root);

  const statuses = scrolls.reduce<Record<string, number>>((acc, scroll) => {
    const key = scroll.status.toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const generatedAt = new Date().toISOString();
  const sanitized = generatedAt.replace(/[-:]/g, '').replace('T', '').split('.')[0];
  const jobId = `codex-index-${sanitized}`;
  const totalSizeBytes = scrolls.reduce((sum, scroll) => sum + scroll.sizeBytes, 0);

  const index = {
    meta: {
      generatedAt,
      jobId,
      scrollCount: scrolls.length,
      totalSizeBytes,
    },
    statuses,
    scrolls,
  };

  const outPath = path.resolve(root, 'docs', 'codex-index.json');
  await writeFileEnsured(outPath, JSON.stringify(index, null, 2) + '\n');
  console.log(`🧭 Codex index generated → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error('Codex index generation failed.', err);
  process.exitCode = 1;
});

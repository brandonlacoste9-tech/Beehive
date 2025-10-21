import path from 'path';

import { glyphForStatus, readCodexIndex, writeFileEnsured } from './common';

function humanizeStatus(status: string): string {
  return status
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'kB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const formatted = unitIndex === 0 ? `${value} ${units[unitIndex]}` : `${value.toFixed(1)} ${units[unitIndex]}`;
  return `${formatted} (${bytes} B)`;
}

async function main() {
  const root = process.cwd();
  const index = await readCodexIndex(root);
  const docDir = path.resolve(root, 'docs');
  const outPath = path.join(docDir, 'codex-status.md');

  const statusEntries = Object.entries(index.statuses).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const lines: string[] = [];
  lines.push('---');
  lines.push(`jobId: ${index.meta.jobId}`);
  lines.push(`generatedAt: ${index.meta.generatedAt}`);
  lines.push(`scrollCount: ${index.meta.scrollCount}`);
  lines.push(`totalSizeBytes: ${index.meta.totalSizeBytes}`);
  lines.push('---');
  lines.push('');
  lines.push('# Codex Status Ledger');
  lines.push('');
  lines.push('Glyph ledger for Codex scroll exports.');
  lines.push('');
  lines.push('| Glyph | Status | Count |');
  lines.push('| :---- | :----- | ----: |');
  for (const [status, count] of statusEntries) {
    const glyph = glyphForStatus(status);
    lines.push(`| ${glyph} | ${escapeCell(humanizeStatus(status))} | ${count} |`);
  }
  lines.push('');
  lines.push('## Scroll Directory');
  lines.push('');
  lines.push('| Glyph | Scroll | Status | Version | Last Updated | Owners | Size | Excerpt |');
  lines.push('| :---- | :----- | :----- | :------ | :----------- | :----- | ----: | :------ |');

  for (const scroll of index.scrolls) {
    const glyph = glyphForStatus(scroll.status);
    const statusLabel = humanizeStatus(scroll.status);
    const owners = scroll.owners.length ? scroll.owners.map(escapeCell).join('<br>') : '—';
    const relativeScroll = path
      .relative(path.dirname(outPath), path.resolve(root, scroll.path))
      .replace(/\\\\/g, '/')
      .replace(/\\/g, '/');
    const link = `[${escapeCell(scroll.title)}](${relativeScroll})`;
    const size = escapeCell(formatBytes(scroll.sizeBytes));
    const excerpt = scroll.excerpt ? escapeCell(truncate(scroll.excerpt)) : '—';
    const version = scroll.version ? escapeCell(scroll.version) : '—';
    const updated = scroll.lastUpdated ? escapeCell(scroll.lastUpdated) : '—';

    lines.push(
      `| ${glyph} | ${link} | ${escapeCell(statusLabel)} | ${version} | ${updated} | ${owners} | ${size} | ${excerpt} |`
    );
  }

  lines.push('');
  lines.push('<!-- Generated via npm run codex:render -->');

  await writeFileEnsured(outPath, `${lines.join('\n')}\n`);
  console.log(`🪶 Codex status rendered → ${path.relative(root, outPath)}`);
}

main().catch((err) => {
  console.error('Codex status render failed.', err);
  process.exitCode = 1;
});

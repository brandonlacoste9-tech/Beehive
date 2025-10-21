import { promises as fs } from 'fs';
import path from 'path';

import { z } from 'zod';

import { CodexIndex, readCodexIndex } from './common';

const ScrollSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.string().min(1),
  version: z.string().min(1),
  lastUpdated: z.string().min(1),
  owners: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), url: z.string() })),
  path: z.string().min(1),
  excerpt: z.string(),
  sizeBytes: z.number().int().nonnegative(),
});

const CodexIndexSchema = z.object({
  meta: z.object({
    generatedAt: z
      .string()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), 'generatedAt must be an ISO timestamp'),
    jobId: z.string().min(1),
    scrollCount: z.number().int().nonnegative(),
    totalSizeBytes: z.number().int().nonnegative(),
  }),
  statuses: z.record(z.number().int().nonnegative()),
  scrolls: z.array(ScrollSchema),
});

function assertIndexShape(index: CodexIndex) {
  const parsed = CodexIndexSchema.safeParse(index);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join('\n'));
  }
}

async function ensureFilesMatch(index: CodexIndex) {
  const root = process.cwd();
  const missing: string[] = [];
  const mismatchedSizes: string[] = [];

  for (const scroll of index.scrolls) {
    const abs = path.resolve(root, scroll.path);
    try {
      const content = await fs.readFile(abs, 'utf8');
      const actualSize = Buffer.byteLength(content, 'utf8');
      if (actualSize !== scroll.sizeBytes) {
        mismatchedSizes.push(`${scroll.id} (${scroll.path}) expected ${scroll.sizeBytes} bytes, found ${actualSize}`);
      }
    } catch (err) {
      missing.push(`${scroll.id} (${scroll.path}): ${(err as Error).message}`);
    }
  }

  if (missing.length) {
    throw new Error(['Missing scroll files:', ...missing].join('\n'));
  }
  if (mismatchedSizes.length) {
    throw new Error(['Size drift detected:', ...mismatchedSizes].join('\n'));
  }
}

function ensureCounts(index: CodexIndex) {
  if (index.meta.scrollCount !== index.scrolls.length) {
    throw new Error(
      `scrollCount ${index.meta.scrollCount} does not match entries ${index.scrolls.length}`
    );
  }

  const counts = index.scrolls.reduce<Record<string, number>>((acc, scroll) => {
    const key = scroll.status.toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const statusKeys = new Set([...Object.keys(counts), ...Object.keys(index.statuses)]);
  const discrepancies: string[] = [];
  for (const key of statusKeys) {
    if ((counts[key] ?? 0) !== (index.statuses[key] ?? 0)) {
      discrepancies.push(`${key}: expected ${counts[key] ?? 0}, found ${index.statuses[key] ?? 0}`);
    }
  }
  if (discrepancies.length) {
    throw new Error(['Status count mismatch detected:', ...discrepancies].join('\n'));
  }

  const totalStatuses = Object.values(index.statuses).reduce((sum, value) => sum + value, 0);
  if (totalStatuses !== index.scrolls.length) {
    throw new Error(
      `Status totals (${totalStatuses}) do not equal scroll count (${index.scrolls.length})`
    );
  }

  const ids = new Set<string>();
  for (const scroll of index.scrolls) {
    if (ids.has(scroll.id)) {
      throw new Error(`Duplicate scroll id detected: ${scroll.id}`);
    }
    ids.add(scroll.id);
  }
}

async function main() {
  const index = await readCodexIndex();
  assertIndexShape(index);
  ensureCounts(index);
  await ensureFilesMatch(index);
  console.log(`✅ Codex index validated (${index.scrolls.length} scrolls, job ${index.meta.jobId}).`);
}

main().catch((err) => {
  console.error('Codex index validation failed.');
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

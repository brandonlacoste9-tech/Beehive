import { promises as fs } from 'fs';
import path from 'path';

export type ScrollLink = {
  label: string;
  url: string;
};

export type ScrollRecord = {
  id: string;
  title: string;
  status: string;
  version: string;
  lastUpdated: string;
  owners: string[];
  links: ScrollLink[];
  path: string;
  excerpt: string;
  sizeBytes: number;
};

export type CodexIndex = {
  meta: {
    generatedAt: string;
    jobId: string;
    scrollCount: number;
    totalSizeBytes: number;
  };
  statuses: Record<string, number>;
  scrolls: ScrollRecord[];
};

export const STATUS_GLYPHS: Record<string, string> = {
  active: '🟢',
  draft: '🟡',
  review: '🟣',
  paused: '🟠',
  deprecated: '⚫',
  archived: '⚪',
};

export function glyphForStatus(status: string): string {
  const key = status.toLowerCase();
  return STATUS_GLYPHS[key] ?? '⚪';
}

function toCamel(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[-_]+(\w)/g, (_, ch: string) => ch.toUpperCase());
}

function parseOwners(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [];
  } catch {
    return trimmed
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }
}

function parseLinks(lines: string[], start: number): { links: ScrollLink[]; nextIndex: number } {
  const links: ScrollLink[] = [];
  let idx = start + 1;
  while (idx < lines.length) {
    const raw = lines[idx];
    if (!raw || !raw.trim()) {
      idx += 1;
      break;
    }
    if (!raw.trim().startsWith('-')) break;
    const cleaned = raw.trim().replace(/^[-\s]+/, '');
    const colon = cleaned.indexOf(':');
    let label = cleaned;
    let url = '';
    if (colon >= 0) {
      label = cleaned.slice(0, colon).trim();
      url = cleaned.slice(colon + 1).trim();
    }
    links.push({ label, url });
    idx += 1;
  }
  return { links, nextIndex: idx };
}

export async function loadScrollRecords(rootDir = process.cwd()): Promise<ScrollRecord[]> {
  const scrollDir = path.resolve(rootDir, 'scrolls');
  const entries = await fs.readdir(scrollDir, { withFileTypes: true });
  const records: ScrollRecord[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const filePath = path.join(scrollDir, entry.name);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = parseScrollFile(filePath, content);
    if (parsed) {
      records.push(parsed);
    }
  }

  return records.sort((a, b) => a.title.localeCompare(b.title));
}

function parseScrollFile(filePath: string, content: string): ScrollRecord | null {
  const lines = content.split(/\r?\n/);
  if (!lines.length) return null;

  let idx = 0;
  let title = lines[idx].trim();
  if (title.startsWith('#')) {
    title = title.replace(/^#+\s*/, '').trim();
    idx += 1;
  }

  const meta: Record<string, unknown> = {
    id: '',
    status: 'draft',
    version: '0.0.0',
    lastUpdated: '',
    owners: [],
    links: [],
  };

  let cursor = idx;
  while (cursor < lines.length) {
    const raw = lines[cursor];
    if (!raw || !raw.trim()) {
      cursor += 1;
      break;
    }
    if (!raw.includes(':')) break;

    const trimmed = raw.trim();
    if (trimmed.startsWith('links:')) {
      const { links, nextIndex } = parseLinks(lines, cursor);
      meta.links = links;
      cursor = nextIndex;
      continue;
    }

    const colon = trimmed.indexOf(':');
    if (colon < 0) break;
    const key = toCamel(trimmed.slice(0, colon));
    let value = trimmed.slice(colon + 1).trim();

    if (key === 'owners') {
      meta.owners = parseOwners(value);
    } else if (key === 'lastUpdated') {
      meta.lastUpdated = value;
    } else if (key === 'status' || key === 'version' || key === 'id') {
      meta[key] = value;
    } else {
      meta[key] = value;
    }

    cursor += 1;
  }

  const excerpt = extractExcerpt(lines.slice(cursor));
  const sizeBytes = Buffer.byteLength(content, 'utf8');
  const record: ScrollRecord = {
    id: String(meta.id ?? ''),
    title,
    status: String(meta.status ?? 'draft'),
    version: String(meta.version ?? ''),
    lastUpdated: String(meta.lastUpdated ?? ''),
    owners: Array.isArray(meta.owners) ? (meta.owners as string[]) : [],
    links: Array.isArray(meta.links) ? (meta.links as ScrollLink[]) : [],
    path: path.relative(process.cwd(), filePath),
    excerpt,
    sizeBytes,
  };

  if (!record.id || !record.status) {
    return null;
  }

  return record;
}

function extractExcerpt(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('- ')) {
      return trimmed.slice(2).trim();
    }
    return trimmed;
  }
  return '';
}

export async function readCodexIndex(rootDir = process.cwd()): Promise<CodexIndex> {
  const filePath = path.resolve(rootDir, 'docs', 'codex-index.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as CodexIndex;
}

export async function writeFileEnsured(filePath: string, contents: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents);
}

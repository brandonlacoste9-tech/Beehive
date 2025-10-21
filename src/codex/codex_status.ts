import type { CodexGlyph, CodexStatus } from './codex_types';

export const STATUS_GLYPH_MAP: Record<CodexStatus, CodexGlyph> = {
  sealed: '✅',
  draft: '📝',
  pending: '⏳',
  archived: '📦'
};

export const STATUS_ORDER: CodexStatus[] = ['sealed', 'pending', 'draft', 'archived'];

export function getGlyphForStatus(status: CodexStatus): CodexGlyph {
  return STATUS_GLYPH_MAP[status];
}

export function formatStatus(status: CodexStatus): string {
  switch (status) {
    case 'sealed':
      return 'sealed';
    case 'pending':
      return 'in progress';
    case 'draft':
      return 'draft';
    case 'archived':
      return 'archived';
    default:
      return status satisfies never;
  }
}

export type CodexStatus = 'sealed' | 'draft' | 'pending' | 'archived';

export type CodexGlyph = '✅' | '📝' | '⏳' | '📦';

export interface CodexLineage {
  introducedIn: string;
  scroll: string;
  owner: string;
}

export interface CodexResource {
  path: string;
  mediaType: string;
  sizeBytes: number;
  checksum: string;
}

export interface CodexPointers {
  changelog: string;
  statusPage: string;
  thread?: string;
}

export interface CodexArtifact {
  id: string;
  title: string;
  status: CodexStatus;
  glyph: CodexGlyph;
  summary: string;
  lineage: CodexLineage;
  resource: CodexResource;
  pointers: CodexPointers;
  lastUpdated: string;
  tags: string[];
}

export interface CodexLogEntry {
  step: 'generate' | 'render' | 'validate' | 'notify';
  status: CodexStatus;
  glyph: CodexGlyph;
  at: string;
  message: string;
}

export interface CodexRuntime {
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
}

export interface CodexReplay {
  overlay: string;
  url: string;
  exportRef: string;
}

export interface CodexOperation {
  jobId: string;
  ritual: string;
  artifactId: string;
  status: CodexStatus;
  glyph: CodexGlyph;
  sizeBytes: number;
  runtime: CodexRuntime;
  replay: CodexReplay;
  logs: CodexLogEntry[];
}

export interface CodexMeta {
  checksumAlgorithm: 'sha256';
  generator: string;
  ritualVersion: string;
  statusDocument: string;
}

export interface CodexIndex {
  $schema: string;
  version: string;
  generatedAt: string;
  artifacts: CodexArtifact[];
  operations: CodexOperation[];
  meta: CodexMeta;
}

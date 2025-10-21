import type { CodexIndex } from './codex_types';

export interface CodexEchoPayload {
  input: string;
  artifactId?: string;
  jobId?: string;
  timestamp: string;
}

export function codexEcho(index: CodexIndex, payload: CodexEchoPayload): string {
  const artifact = payload.artifactId
    ? index.artifacts.find((entry) => entry.id === payload.artifactId)
    : undefined;
  const operation = payload.jobId
    ? index.operations.find((entry) => entry.jobId === payload.jobId)
    : undefined;

  const detailSegments: string[] = [`input=${payload.input}`];
  if (artifact) {
    detailSegments.push(`artifact=${artifact.id}`, `status=${artifact.status}`, `glyph=${artifact.glyph}`);
  }
  if (operation) {
    detailSegments.push(`job=${operation.jobId}`, `ritual=${operation.ritual}`);
  }

  return `[codex-echo ${payload.timestamp}] ${detailSegments.join(' ')}`;
}

import type { CodexIndex, CodexGlyph, CodexStatus } from './codex_types';

export interface CodexBadge {
  label: string;
  status: CodexStatus;
  glyph: CodexGlyph;
  detail: string;
  resourcePath: string;
}

export function codexBadge(index: CodexIndex, artifactId: string): CodexBadge {
  const artifact = index.artifacts.find((entry) => entry.id === artifactId);
  if (!artifact) {
    throw new Error(`Artifact ${artifactId} is not registered in the Codex index.`);
  }

  return {
    label: artifact.title,
    status: artifact.status,
    glyph: artifact.glyph,
    detail: `${artifact.summary} — last touched ${artifact.lastUpdated}.`,
    resourcePath: artifact.resource.path
  };
}

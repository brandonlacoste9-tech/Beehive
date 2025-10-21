import { z } from 'zod';
import { STATUS_GLYPH_MAP } from './codex_status';
import type { CodexIndex } from './codex_types';

const statusValues = ['sealed', 'draft', 'pending', 'archived'] as const;
const glyphValues = ['✅', '📝', '⏳', '📦'] as const;

const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Value must be an ISO 8601 timestamp.');

const codexStatusSchema = z.enum(statusValues);
const codexGlyphSchema = z.enum(glyphValues);

const resourceSchema = z.object({
  path: z.string(),
  mediaType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, 'Checksum must be a 64 character hex-encoded SHA-256 digest.')
});

const lineageSchema = z.object({
  introducedIn: z.string(),
  scroll: z.string(),
  owner: z.string()
});

const pointersSchema = z.object({
  changelog: z.string(),
  statusPage: z.string(),
  thread: z.string().optional()
});

const logEntrySchema = z.object({
  step: z.enum(['generate', 'render', 'validate', 'notify']),
  status: codexStatusSchema,
  glyph: codexGlyphSchema,
  at: isoDateString,
  message: z.string()
});

const runtimeSchema = z.object({
  startedAt: isoDateString,
  completedAt: isoDateString.optional(),
  durationSeconds: z.number().nonnegative()
});

const replaySchema = z.object({
  overlay: z.string(),
  url: z.string().url(),
  exportRef: z.string()
});

const artifactSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    status: codexStatusSchema,
    glyph: codexGlyphSchema,
    summary: z.string(),
    lineage: lineageSchema,
    resource: resourceSchema,
    pointers: pointersSchema,
    lastUpdated: isoDateString,
    tags: z.array(z.string())
  })
  .superRefine((value, ctx) => {
    const expectedGlyph = STATUS_GLYPH_MAP[value.status];
    if (value.glyph !== expectedGlyph) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['glyph'],
        message: `Glyph ${value.glyph} does not match status ${value.status}. Expected ${expectedGlyph}.`
      });
    }
  });

const operationSchema = z
  .object({
    jobId: z.string(),
    ritual: z.string(),
    artifactId: z.string(),
    status: codexStatusSchema,
    glyph: codexGlyphSchema,
    sizeBytes: z.number().int().nonnegative(),
    runtime: runtimeSchema,
    replay: replaySchema,
    logs: z.array(logEntrySchema)
  })
  .superRefine((value, ctx) => {
    const expectedGlyph = STATUS_GLYPH_MAP[value.status];
    if (value.glyph !== expectedGlyph) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['glyph'],
        message: `Glyph ${value.glyph} does not match status ${value.status}. Expected ${expectedGlyph}.`
      });
    }
  });

export const codexIndexSchema = z
  .object({
    $schema: z.string(),
    version: z.string(),
    generatedAt: isoDateString,
    artifacts: z.array(artifactSchema),
    operations: z.array(operationSchema),
    meta: z.object({
      checksumAlgorithm: z.literal('sha256'),
      generator: z.string(),
      ritualVersion: z.string(),
      statusDocument: z.string()
    })
  })
  .superRefine((value, ctx) => {
    if (!value.version.startsWith('2.')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['version'],
        message: 'Codex index must be generated with the 2.x schema.'
      });
    }
    const artifactIds = new Set(value.artifacts.map((artifact) => artifact.id));
    value.operations.forEach((operation, index) => {
      if (!artifactIds.has(operation.artifactId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['operations', index, 'artifactId'],
          message: `Operation references unknown artifact: ${operation.artifactId}`
        });
      }
    });
  });

export type CodexIndexParseResult = z.infer<typeof codexIndexSchema>;

export function parseCodexIndex(data: unknown): CodexIndex {
  return codexIndexSchema.parse(data) as CodexIndex;
}

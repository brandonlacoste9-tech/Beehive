import type { Handler } from '@netlify/functions';
import { logMutation } from './_logger';

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const critical = [
  'netlify.toml',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'dockerfile',
  'Dockerfile',
  'scripts/',
  '/.github/workflows/',
  'src/worker.js',
];

export const handler: Handler = async (event) => {
  if (!CAP) return { statusCode: 500, body: 'Capability not configured' };
  if (!GEMINI_API_KEY) return { statusCode: 500, body: 'Missing GEMINI_API_KEY' };

  const actor = event.headers['x-codex-actor'] || 'Unknown Steward';
  if (event.headers['x-codex-capability'] !== CAP) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  let payload: any = {};
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  const { diffs } = payload as {
    diffs?: { filename: string; additions: number; deletions: number; patch: string }[];
  };
  if (!diffs || !Array.isArray(diffs) || diffs.length === 0) {
    return { statusCode: 400, body: 'Missing diffs' };
  }

  const hint = diffs.map((d) => `file: ${d.filename}, +${d.additions}, -${d.deletions}`).join('\n');
  const promptSections = [
    `Assess risk (0-100) for this change set. Consider critical files (${critical.join(', ')})`,
    'Config changes, dependency bumps, large deletions, and build/runtime hooks should influence the score.',
    'Return JSON with:',
    '{ "score": number, "level": "low|medium|high", "reasons": string[], "recommendations": string[] }',
    'Hints:',
    hint,
    'Patches:',
    diffs.map((d) => `--- ${d.filename}\n${d.patch}`).join('\n\n'),
  ];
  const prompt = promptSections.join('\n');

  let data: any = null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }]}],
        }),
      },
    );
    data = await res.json();
  } catch (error) {
    console.error('[risk-score] Gemini request failed:', error);
    return { statusCode: 502, body: 'Gemini request failed' };
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    result = {
      score: 50,
      level: 'medium',
      reasons: ['Parse fallback'],
      recommendations: ['Return structured JSON'],
    };
  }

  await logMutation({
    actor,
    ritual: 'risk-score',
    status: 'success',
    message: `Risk ${result.level} (${result.score})`,
    payload: { count: diffs.length },
    response: result,
    metadata: { filesCount: diffs.length, level: result.level, score: result.score },
  });

  return { statusCode: 200, body: JSON.stringify(result) };
};

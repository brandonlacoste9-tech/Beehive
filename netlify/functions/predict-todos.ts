import type { Handler } from '@netlify/functions';
import { logMutation } from './_logger';

const CAP = process.env.CODEX_CAPABILITY_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GH_TOKEN = process.env.GITHUB_PAT;
const GH_REPO = process.env.GITHUB_REPO;

type Diff = { filename: string; additions: number; deletions: number; patch: string };

type TodoPayload = {
  immediate: string[];
  followUps: string[];
  notes?: string[];
};

function formatList(items: string[], emptyLabel: string) {
  if (!items || items.length === 0) return `- ${emptyLabel}`;
  return items.map((item) => `- ${item}`).join('\n');
}

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

  const { pr_number, diffs } = payload as { pr_number?: number; diffs?: Diff[] };
  if (!pr_number) {
    return { statusCode: 400, body: 'Missing pr_number' };
  }
  if (!diffs || !Array.isArray(diffs) || diffs.length === 0) {
    return { statusCode: 400, body: 'Missing diffs' };
  }

  const hint = diffs.map((d) => `file: ${d.filename}, +${d.additions}, -${d.deletions}`).join('\n');
  const prompt = `Review the following patches and identify TODOs for the steward.\nRespond in JSON:\n{\n  "immediate": string[],\n  "followUps": string[],\n  "notes"?: string[]\n}\nImmediate items should unblock merge; follow-ups can be logged post-merge.\nHint summary:\n${hint}\nPatches:\n${diffs
    .map((d) => `--- ${d.filename}\n${d.patch}`)
    .join('\n\n')}`;

  let data: any = null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }]}] }),
      },
    );
    data = await res.json();
  } catch (error) {
    console.error('[predict-todos] Gemini request failed:', error);
    return { statusCode: 502, body: 'Gemini request failed' };
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  let todos: TodoPayload;
  try {
    const parsed = JSON.parse(text);
    todos = {
      immediate: Array.isArray(parsed?.immediate) ? parsed.immediate : [],
      followUps: Array.isArray(parsed?.followUps) ? parsed.followUps : [],
      notes: Array.isArray(parsed?.notes) ? parsed.notes : [],
    };
  } catch {
    todos = { immediate: [], followUps: [], notes: ['Gemini response parse failure'] };
  }

  await logMutation({
    actor,
    ritual: 'predict-todos',
    status: 'success',
    message: `TODOs generated (${todos.immediate.length} immediate, ${todos.followUps.length} follow-ups)`,
    payload: { pr_number, diffsCount: diffs.length },
    response: todos,
    metadata: {
      immediateCount: todos.immediate.length,
      followUpCount: todos.followUps.length,
      notesCount: todos.notes?.length ?? 0,
    },
  });

  if (GH_TOKEN && GH_REPO) {
    const comment = [
      `📝 Gemini TODOs for PR #${pr_number}`,
      '',
      '### Immediate',
      formatList(todos.immediate, 'No immediate blockers detected'),
      '',
      '### Follow-up',
      formatList(todos.followUps, 'No follow-up items recorded'),
    ];
    if (todos.notes && todos.notes.length > 0) {
      comment.push('', '### Notes', formatList(todos.notes, '—'));
    }

    try {
      await fetch(`https://api.github.com/repos/${GH_REPO}/issues/${pr_number}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: comment.join('\n') }),
      });
    } catch (error) {
      console.error('[predict-todos] Failed to post GitHub comment:', error);
    }
  }

  return { statusCode: 200, body: JSON.stringify(todos) };
};

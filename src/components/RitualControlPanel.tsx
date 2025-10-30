'use client';

import { useMemo, useState } from 'react';
import RiskBadge from './RiskBadge';
import { call } from '@/lib/rituals';

type SmokeResult = {
  pass: boolean;
  results: { url: string; status: number; ok: boolean; err?: string }[];
};

type RiskResult = {
  score: number;
  level: 'low' | 'medium' | 'high';
  reasons?: string[];
  recommendations?: string[];
};

type TodoResult = {
  immediate: string[];
  followUps: string[];
  notes?: string[];
};

type Metadata = Record<string, unknown> | null;

type DiffInput = { filename: string; additions: number; deletions: number; patch: string };

function renderMetadata(metadata: Metadata) {
  if (!metadata) return null;
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) return null;
  return (
    <div className="mt-2 text-[11px] text-gray-400">
      {entries.map(([key, value]) => `${key}: ${String(value)}`).join(' • ')}
    </div>
  );
}

function parseFiles(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function useDiffMemo(diffText: string): { raw: string; parsed: DiffInput[] | null; error: string | null } {
  return useMemo(() => {
    if (!diffText.trim()) {
      return { raw: diffText, parsed: [], error: null };
    }
    try {
      const candidate = JSON.parse(diffText);
      if (!Array.isArray(candidate)) {
        return { raw: diffText, parsed: null, error: 'Diff JSON must be an array' };
      }
      return { raw: diffText, parsed: candidate as DiffInput[], error: null };
    } catch (error: any) {
      return { raw: diffText, parsed: null, error: error?.message ?? 'Invalid JSON' };
    }
  }, [diffText]);
}

export default function RitualControlPanel() {
  const [prNumber, setPrNumber] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [tests, setTests] = useState('/,/favicon.ico');
  const [diffText, setDiffText] = useState(
    '[\n  {\n    "filename": "src/example.ts",\n    "additions": 5,\n    "deletions": 1,\n    "patch": "+const demo = true;\\n"\n  }\n]'
  );
  const diffMemo = useDiffMemo(diffText);
  const [filesText, setFilesText] = useState('src/example.ts\nnetlify.toml');

  const [smokeResult, setSmokeResult] = useState<SmokeResult | null>(null);
  const [smokeMeta, setSmokeMeta] = useState<Metadata>(null);
  const [smokeError, setSmokeError] = useState<string | null>(null);
  const [smokeBusy, setSmokeBusy] = useState(false);

  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [riskMeta, setRiskMeta] = useState<Metadata>(null);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [riskBusy, setRiskBusy] = useState(false);

  const [labelResult, setLabelResult] = useState<string[] | null>(null);
  const [labelMeta, setLabelMeta] = useState<Metadata>(null);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [labelBusy, setLabelBusy] = useState(false);

  const [todoResult, setTodoResult] = useState<TodoResult | null>(null);
  const [todoMeta, setTodoMeta] = useState<Metadata>(null);
  const [todoError, setTodoError] = useState<string | null>(null);
  const [todoBusy, setTodoBusy] = useState(false);

  async function runSmoke() {
    const target = previewUrl.trim();
    if (!target) {
      setSmokeError('Preview URL is required');
      return;
    }
    const pr = parseNumber(prNumber);
    if (prNumber.trim() && pr === undefined) {
      setSmokeError('PR number must be numeric');
      return;
    }
    const list = parseFiles(tests);

    setSmokeBusy(true);
    setSmokeError(null);
    try {
      const response = await call<SmokeResult>('smoke-test', {
        actor: 'Dashboard Control Panel',
        pr_number: pr,
        preview_url: target,
        tests: list.length > 0 ? list : undefined,
      });
      setSmokeResult(response.data);
      setSmokeMeta(response.metadata ?? null);
    } catch (error: any) {
      setSmokeError(error?.message ?? 'Smoke test ritual failed');
      setSmokeResult(null);
      setSmokeMeta(error?.metadata ?? null);
    } finally {
      setSmokeBusy(false);
    }
  }

  async function runRisk() {
    if (diffMemo.error) {
      setRiskError(diffMemo.error);
      return;
    }
    const diffs = diffMemo.parsed ?? [];
    if (diffs.length === 0) {
      setRiskError('Provide at least one diff for scoring');
      return;
    }

    setRiskBusy(true);
    setRiskError(null);
    try {
      const response = await call<RiskResult>('risk-score', {
        actor: 'Dashboard Control Panel',
        diffs,
      });
      setRiskResult(response.data);
      setRiskMeta(response.metadata ?? null);
    } catch (error: any) {
      setRiskError(error?.message ?? 'Risk score ritual failed');
      setRiskResult(null);
      setRiskMeta(error?.metadata ?? null);
    } finally {
      setRiskBusy(false);
    }
  }

  async function runLabel() {
    const pr = parseNumber(prNumber);
    if (!pr) {
      setLabelError('PR number required');
      return;
    }
    const files = parseFiles(filesText);
    if (files.length === 0) {
      setLabelError('List at least one touched file');
      return;
    }

    setLabelBusy(true);
    setLabelError(null);
    try {
      const response = await call<{ labels: string[] }>('label-pr', {
        actor: 'Dashboard Control Panel',
        pr_number: pr,
        files,
      });
      setLabelResult(response.data.labels);
      setLabelMeta(response.metadata ?? null);
    } catch (error: any) {
      setLabelError(error?.message ?? 'Label ritual failed');
      setLabelResult(null);
      setLabelMeta(error?.metadata ?? null);
    } finally {
      setLabelBusy(false);
    }
  }

  async function runTodos() {
    const pr = parseNumber(prNumber);
    if (!pr) {
      setTodoError('PR number required');
      return;
    }
    if (diffMemo.error) {
      setTodoError(diffMemo.error);
      return;
    }
    const diffs = diffMemo.parsed ?? [];
    if (diffs.length === 0) {
      setTodoError('Provide at least one diff for TODO synthesis');
      return;
    }

    setTodoBusy(true);
    setTodoError(null);
    try {
      const response = await call<TodoResult>('predict-todos', {
        actor: 'Dashboard Control Panel',
        pr_number: pr,
        diffs,
      });
      setTodoResult(response.data);
      setTodoMeta(response.metadata ?? null);
    } catch (error: any) {
      setTodoError(error?.message ?? 'TODO ritual failed');
      setTodoResult(null);
      setTodoMeta(error?.metadata ?? null);
    } finally {
      setTodoBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ritual Control Panel</h2>
        <p className="mt-1 text-sm text-gray-500">
          Trigger Netlify rituals after deploys and capture Codex lineage metadata without leaving the dashboard.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Post-deploy smoke tests</h3>
          <p className="mt-1 text-xs text-gray-500">Runs HTTP checks against the Netlify preview and records the outcome.</p>
          <div className="mt-3 space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">PR number (optional for smoke)</span>
              <input
                value={prNumber}
                onChange={(event) => setPrNumber(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="123"
                inputMode="numeric"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Preview URL</span>
              <input
                value={previewUrl}
                onChange={(event) => setPreviewUrl(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="https://deploy-preview--site.netlify.app"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Paths to probe (comma or newline)</span>
              <textarea
                value={tests}
                onChange={(event) => setTests(event.target.value)}
                rows={2}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={runSmoke}
              disabled={smokeBusy}
              className="rounded bg-teal-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {smokeBusy ? 'Running…' : 'Run smoke tests'}
            </button>
            {smokeError && <div className="text-xs text-rose-600">{smokeError}</div>}
            {smokeResult && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">
                  Result: {smokeResult.pass ? '✅ Pass' : '❌ Fail'}
                </div>
                <ul className="space-y-1 text-[11px] text-gray-600">
                  {smokeResult.results.map((item) => (
                    <li key={item.url}>
                      {item.ok ? '✅' : '❌'} {item.url} <span className="text-gray-400">(status {item.status})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {renderMetadata(smokeMeta)}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Patch risk scoring</h3>
          <p className="mt-1 text-xs text-gray-500">
            Sends diffs to Gemini for a risk estimate, flagging infra/config hotspots and heavy churn.
          </p>
          <div className="mt-3 space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Diff JSON</span>
              <textarea
                value={diffText}
                onChange={(event) => setDiffText(event.target.value)}
                rows={8}
                className="w-full rounded-lg border px-3 py-2 font-mono text-[11px]"
              />
            </label>
            <button
              type="button"
              onClick={runRisk}
              disabled={riskBusy}
              className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            >
              {riskBusy ? 'Scoring…' : 'Score patch risk'}
            </button>
            {riskError && <div className="text-xs text-rose-600">{riskError}</div>}
            {riskResult && (
              <div className="space-y-2">
                <RiskBadge level={riskResult.level} score={riskResult.score} />
                {riskResult.reasons && riskResult.reasons.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-gray-700">Reasons</div>
                    <ul className="mt-1 space-y-1 text-[11px] text-gray-600">
                      {riskResult.reasons.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {riskResult.recommendations && riskResult.recommendations.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-gray-700">Recommendations</div>
                    <ul className="mt-1 space-y-1 text-[11px] text-gray-600">
                      {riskResult.recommendations.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {renderMetadata(riskMeta)}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Mutation labeling</h3>
          <p className="mt-1 text-xs text-gray-500">
            Applies GitHub labels by scanning touched paths for infra, auth, routing, or dependency signals.
          </p>
          <div className="mt-3 space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">PR number</span>
              <input
                value={prNumber}
                onChange={(event) => setPrNumber(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="123"
                inputMode="numeric"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">Touched files</span>
              <textarea
                value={filesText}
                onChange={(event) => setFilesText(event.target.value)}
                rows={5}
                className="w-full rounded-lg border px-3 py-2 font-mono text-[11px]"
              />
            </label>
            <button
              type="button"
              onClick={runLabel}
              disabled={labelBusy}
              className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {labelBusy ? 'Labeling…' : 'Label PR'}
            </button>
            {labelError && <div className="text-xs text-rose-600">{labelError}</div>}
            {labelResult && (
              <div className="space-y-1 text-[11px] text-gray-600">
                <div className="font-semibold text-gray-700">Applied labels</div>
                <div>{labelResult.length > 0 ? labelResult.join(', ') : '—'}</div>
              </div>
            )}
            {renderMetadata(labelMeta)}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Gemini TODO synthesis</h3>
          <p className="mt-1 text-xs text-gray-500">
            Generates immediate blockers and follow-up ideas directly from the diff context.
          </p>
          <div className="mt-3 space-y-3 text-xs">
            <label className="block space-y-1">
              <span className="font-medium text-gray-700">PR number</span>
              <input
                value={prNumber}
                onChange={(event) => setPrNumber(event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="123"
                inputMode="numeric"
              />
            </label>
            <p className="text-[11px] text-gray-500">
              Uses the same diff JSON as the risk scorer above.
            </p>
            <button
              type="button"
              onClick={runTodos}
              disabled={todoBusy}
              className="rounded bg-amber-500 px-4 py-2 text-white disabled:opacity-50"
            >
              {todoBusy ? 'Predicting…' : 'Predict TODOs'}
            </button>
            {todoError && <div className="text-xs text-rose-600">{todoError}</div>}
            {todoResult && (
              <div className="space-y-2 text-[11px] text-gray-600">
                <div>
                  <div className="font-semibold text-gray-700">Immediate</div>
                  <ul className="mt-1 space-y-1">
                    {(todoResult.immediate.length ? todoResult.immediate : ['No immediate blockers detected']).map((item, index) => (
                      <li key={`immediate-${index}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Follow-up</div>
                  <ul className="mt-1 space-y-1">
                    {(todoResult.followUps.length ? todoResult.followUps : ['No follow-up items recorded']).map((item, index) => (
                      <li key={`follow-${index}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
                {todoResult.notes && todoResult.notes.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700">Notes</div>
                    <ul className="mt-1 space-y-1">
                      {todoResult.notes.map((item, index) => (
                        <li key={`note-${index}`}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {renderMetadata(todoMeta)}
          </div>
        </div>
      </div>
    </section>
  );
}

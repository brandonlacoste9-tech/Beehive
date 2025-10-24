'use client';

import { useState } from 'react';
import { toMood } from '@/lib/sandboxAgent';

type Props = {
  windowMin?: number;
};

type SandboxResponse = {
  ok: boolean;
  reply?: string;
  sentiment?: {
    windowMin: number;
    count: number;
    avg: number;
  };
  error?: string;
};

export default function VSChat({ windowMin = 180 }: Props) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<SandboxResponse['sentiment'] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSend() {
    if (!input.trim()) return;
    setBusy(true);
    setErr(null);
    setReply(null);
    setSentiment(null);
    try {
      const res = await fetch('/api/agent-chat-sandbox', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: input, windowMin }),
      });
      const json: SandboxResponse = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `sandbox error (${res.status})`);
      }
      setReply(json.reply ?? '(no reply)');
      if (json.sentiment) setSentiment(json.sentiment);
      setInput('');
    } catch (e: any) {
      setErr(e?.message ?? 'network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        className="w-full rounded-xl border p-3 text-sm dark:bg-gray-900"
        rows={4}
        value={input}
        placeholder="Ask the sandbox agent to riff on live sentiment…"
        onChange={(e) => setInput(e.target.value)}
        disabled={busy}
      />
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="text-xs text-gray-500">
          Ritual sandbox • window {windowMin}m
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={busy || !input.trim()}
          className="rounded-lg bg-black px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send'}
        </button>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {sentiment && (
        <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
          <div className="font-semibold text-gray-800">Sentiment Snapshot</div>
          <div>Mentions: {sentiment.count}</div>
          <div>Mean: {sentiment.avg.toFixed(2)}</div>
          <div>Mood: {toMood(sentiment.avg)}</div>
        </div>
      )}
      {reply && (
        <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 p-3 text-sm">
          {reply}
        </div>
      )}
    </div>
  );
}

'use client';

import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  windowMin?: number;
};

type SentimentSummary = {
  windowMin: number;
  count: number;
  avg: number;
  mood?: string;
};

export default function AgentChat({ windowMin = 180 }: Props) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [controller, setController] = useState<AbortController | null>(null);
  const [sessionId] = useState(() => (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'session'));
  const [sentiment, setSentiment] = useState<SentimentSummary | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [reply]);

  async function handleSend() {
    if (!input.trim()) return;
    controller?.abort();
    setController(null);
    setBusy(true);
    setErr(null);
    setReply(null);
    setSentiment(null);
    try {
      if (streaming) {
        await sendStream();
      } else {
        await sendOnce();
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setErr('request cancelled');
      } else {
        setErr(e?.message ?? 'network error');
      }
    } finally {
      setBusy(false);
      setController(null);
    }
  }

  async function sendOnce() {
    const payload = { message: input, windowMin, sessionId };
    const primary = await fetch('/api/agent-chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let json: any = null;
    if (primary.ok) {
      json = await primary.json();
      if (!json.ok) throw new Error(json.error || 'agent error');
      setReply(json.reply ?? json.result ?? '(no reply)');
      setInput('');
      return;
    }

    const fallback = await fetch('/api/agent-chat-sandbox', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    json = await fallback.json();
    if (!fallback.ok || !json?.ok) {
      throw new Error(json?.error || `agent error (${fallback.status})`);
    }
    setReply(json.reply ?? json.result ?? '(no reply)');
    setInput('');
  }

  async function sendStream() {
    setReply('');
    const aborter = new AbortController();
    setController(aborter);

    const res = await fetch('/api/agent-chat/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
      },
      body: JSON.stringify({ message: input, windowMin, sessionId }),
      signal: aborter.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`stream failed: ${res.status}`);
    }

    setInput('');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let index: number;
      while ((index = buffer.indexOf('\n\n')) >= 0) {
        const chunk = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 2);
        if (!chunk) continue;
        const line = chunk.startsWith('data:') ? chunk.slice(5).trim() : chunk;
        if (!line || line === '[DONE]') continue;
        let payload: any = null;
        try {
          payload = JSON.parse(line);
        } catch {
          payload = null;
        }
        if (!payload) continue;
        if (payload.error) throw new Error(payload.error);
        if (payload.type === 'meta') {
          const summary = payload.sentiment;
          if (summary) {
            const avg = typeof summary.avg === 'number' ? summary.avg : 0;
            const mood =
              avg > 0.25 ? 'optimistic/positive' : avg < -0.25 ? 'frustrated/negative' : 'mixed/neutral';
            setSentiment({
              windowMin: summary.windowMin ?? windowMin,
              count: summary.count ?? 0,
              avg,
              mood,
            });
          } else {
            setSentiment(null);
          }
        } else if (payload.type === 'delta') {
          const text = typeof payload.text === 'string' ? payload.text : '';
          if (text) {
            setReply((prev) => (prev ?? '') + text);
          }
        } else if (payload.type === 'done') {
          return;
        }
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!busy) handleSend();
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        className="w-full rounded-xl border p-3 text-sm dark:bg-gray-900"
        rows={4}
        value={input}
        placeholder="Ask the agent to synthesize the latest sentiment + guidance…"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={busy && streaming}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            disabled={busy}
          />
          Stream responses
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => controller?.abort()}
            disabled={!controller}
            className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
          >
            {controller ? 'Cancel' : 'Idle'}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={busy || !input.trim()}
            className="rounded-lg bg-black px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {sentiment && (
        <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-600">
          <div className="font-semibold text-gray-800">Sentiment Snapshot</div>
          <div>Window: {sentiment.windowMin}m</div>
          <div>Mentions: {sentiment.count}</div>
          <div>Mean: {sentiment.avg?.toFixed?.(2)}</div>
          {sentiment.mood && <div>Mood: {sentiment.mood}</div>}
        </div>
      )}
      {reply !== null && (
        <div className="whitespace-pre-wrap rounded-xl border bg-gray-50 p-3 text-sm">
          {reply}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

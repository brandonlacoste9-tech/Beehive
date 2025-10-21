import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { readSparkStatus } from '../lib/codex_spark_echo';
import { readCodexHistory } from '../lib/codex_history';

const STORE = 'beehive_badge';
const HISTORY_KEY = 'history';
const VERSION = 1;

// keep payloads compact and bounded
function pruneHistory(list: any[], max = 1000, maxDays = 90) {
  const cutoff = Date.now() - maxDays * 86_400_000;
  return (list || [])
    .filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return Number.isFinite(t) && t > cutoff;
    })
    .slice(-max);
}

export const handler: Handler = async () => {
  const store = getStore(STORE);
  const history = ((await store.get(HISTORY_KEY, { type: 'json' })) as any[]) || [];
  const spark = await readSparkStatus();
  const sparkHistory = await readCodexHistory(20);

  const now = Date.now();
  const lastDay = now - 86_400_000;

  const total = history.length;
  const ok = history.filter((e) => e.status === 'ok').length;
  const fail = history.filter((e) => e.status === 'fail').length;

  const recent = history.filter((e) => new Date(e.timestamp).getTime() > lastDay);
  const last24 = recent.length;
  const last24Ok = recent.filter((e) => e.status === 'ok').length;

  const payload = {
    version: VERSION,
    current: total ? history[total - 1] : null,
    statistics: {
      total,
      ok,
      fail,
      success_ratio: total ? (ok / total) * 100 : null,
    },
    uptime: {
      last_24h: last24 ? (last24Ok / last24) * 100 : null,
    },
    recent_history: pruneHistory(history, 10),
    spark_deploy: {
      current: spark,
      recent_history: sparkHistory.slice(-10),
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'max-age=30',
    },
    body: JSON.stringify(payload),
  };
};

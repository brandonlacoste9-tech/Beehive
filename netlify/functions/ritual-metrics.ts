import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { getCodexHistory, isCodexSuccessStatus } from '../../src/lib/codex_history';

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

  const now = Date.now();
  const lastDay = now - 86_400_000;

  const total = history.length;
  const ok = history.filter((e) => e.status === 'ok').length;
  const fail = history.filter((e) => e.status === 'fail').length;

  const recent = history.filter((e) => new Date(e.timestamp).getTime() > lastDay);
  const last24 = recent.length;
  const last24Ok = recent.filter((e) => e.status === 'ok').length;

  const sparkHistory = await getCodexHistory(1000);
  const sparkTotal = sparkHistory.length;
  const sparkSuccess = sparkHistory.filter((entry) => isCodexSuccessStatus(entry.status)).length;
  const sparkFail = sparkHistory.filter((entry) => entry.status === 'failed').length;
  const sparkRecent = sparkHistory.filter(
    (entry) => new Date(entry.timestamp).getTime() > lastDay,
  );
  const sparkLast24 = sparkRecent.length;
  const sparkLast24Ok = sparkRecent.filter((entry) => isCodexSuccessStatus(entry.status)).length;
  const sparkCurrent = sparkTotal ? sparkHistory[sparkTotal - 1] : null;

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
    codex_spark: {
      current: sparkCurrent,
      statistics: {
        total: sparkTotal,
        success: sparkSuccess,
        fail: sparkFail,
        success_ratio: sparkTotal ? (sparkSuccess / sparkTotal) * 100 : null,
      },
      uptime: {
        last_24h: sparkLast24 ? (sparkLast24Ok / sparkLast24) * 100 : null,
      },
      recent_history: pruneHistory(sparkHistory, 10),
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

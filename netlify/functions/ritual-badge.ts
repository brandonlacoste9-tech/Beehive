import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import {
  getCodexCurrent,
  isCodexFailureStatus,
  isCodexPendingStatus,
  isCodexSuccessStatus,
} from '../../src/lib/codex_history';

const STORE = 'beehive_badge';
const KEY = 'ritual_status';

export const handler: Handler = async () => {
  try {
    const store = getStore(STORE);
    const [current, codexSnapshot] = await Promise.all([
      store.get(KEY, { type: 'json' }) as Promise<
        | { status: 'ok' | 'fail'; updatedAt: string; actor?: string }
        | null
      >,
      getCodexCurrent(),
    ]);

    const status = current?.status ?? 'unknown';
    const sparkStatus = codexSnapshot?.status ?? 'unknown';

    const ritualSegment =
      status === 'ok' ? 'RITUAL:OK' : status === 'fail' ? 'RITUAL:FAIL' : 'RITUAL:??';
    let sparkSegment = 'SPARK:??';
    if (codexSnapshot) {
      if (isCodexSuccessStatus(sparkStatus)) {
        sparkSegment = 'SPARK:OK';
      } else if (isCodexFailureStatus(sparkStatus)) {
        sparkSegment = 'SPARK:FAIL';
      } else if (isCodexPendingStatus(sparkStatus)) {
        sparkSegment = 'SPARK:PENDING';
      }
    }

    const hasFailure = status === 'fail' || isCodexFailureStatus(sparkStatus);
    const hasPending =
      status === 'unknown' || isCodexPendingStatus(sparkStatus) || sparkStatus === 'unknown';

    const color = hasFailure ? 'red' : hasPending ? 'orange' : 'green';
    const msg = `${ritualSegment} • ${sparkSegment}`;

    const schema = {
      schemaVersion: 1,
      label: 'beehive ritual',
      message: msg,
      color,
      cacheSeconds: 30,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(schema),
    };
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        schemaVersion: 1,
        label: 'beehive ritual',
        message: 'RITUAL:?? • SPARK:??',
        color: 'lightgrey',
        cacheSeconds: 30,
      }),
    };
  }
};

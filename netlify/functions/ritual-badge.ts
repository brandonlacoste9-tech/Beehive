import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE = 'beehive_badge';
const KEY = 'ritual_status';

export const handler: Handler = async () => {
  try {
    const store = getStore(STORE);
    const current = (await store.get(KEY, { type: 'json' })) as
      | { status: 'ok' | 'fail'; updatedAt: string; actor?: string }
      | null;

    const status = current?.status ?? 'unknown';
    const color =
      status === 'ok'
        ? 'green'
        : status === 'fail'
        ? 'red'
        : 'lightgrey';
    const msg =
      status === 'ok'
        ? 'OK'
        : status === 'fail'
        ? 'FAIL'
        : 'unknown';

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
        message: 'unknown',
        color: 'lightgrey',
        cacheSeconds: 30,
      }),
    };
  }
};

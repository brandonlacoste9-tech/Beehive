import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { readSparkStatus } from '../lib/codex_spark_echo';

const STORE = 'beehive_badge';
const KEY = 'ritual_status';
const CODEX_LABEL = 'codex spark';

export const handler: Handler = async () => {
  try {
    const spark = await readSparkStatus();
    if (spark) {
      const status = spark.status ?? 'unknown';
      const messageParts = [status.toUpperCase()];
      if (spark.jobId) {
        messageParts.push(`#${spark.jobId}`);
      }

      const color =
        status === 'success'
          ? 'green'
          : status === 'failed'
          ? 'red'
          : status === 'deploying'
          ? 'blue'
          : status === 'building'
          ? 'yellow'
          : 'lightgrey';

      const schema = {
        schemaVersion: 1,
        label: CODEX_LABEL,
        message: messageParts.join(' · '),
        color,
        namedLogo: 'netlify',
        extra: {
          jobId: spark.jobId,
          previewUrl: spark.previewUrl ?? null,
          status,
        },
      };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(schema),
      };
    }

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

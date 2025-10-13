// src/lib/telemetry.ts
type Dict = Record<string, unknown>;

export function logAuditEvent(event: string, props: Dict = {}) {
  // SAFE NO-OP: replace with Supabase insert later
  // Example shape: { ts, event, props }
  // eslint-disable-next-line no-console
  console.info("[audit]", new Date().toISOString(), event, props);
}

export function incrementMetric(name: string, value = 1, tags: Dict = {}) {
  // SAFE NO-OP: replace with Upstash or other metrics sink
  // eslint-disable-next-line no-console
  console.info("[metric]", new Date().toISOString(), name, value, tags);
}

export function startSpan<T>(name: string, fn: () => Promise<T> | T): Promise<T> | T {
  // SAFE NO-OP span wrapper; later wire to OpenTelemetry
  const t0 = performance.now?.() ?? Date.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        const t1 = performance.now?.() ?? Date.now();
        // eslint-disable-next-line no-console
        console.info("[trace]", name, { duration_ms: Math.round(t1 - t0) });
      }) as Promise<T>;
    }
    const t1 = performance.now?.() ?? Date.now();
    // eslint-disable-next-line no-console
    console.info("[trace]", name, { duration_ms: Math.round(t1 - t0) });
    return result;
  } catch (err) {
    const t1 = performance.now?.() ?? Date.now();
    // eslint-disable-next-line no-console
    console.info("[trace-error]", name, { duration_ms: Math.round(t1 - t0), err });
    throw err;
  }
}

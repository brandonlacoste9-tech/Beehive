import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./_logger', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  logMutation: vi.fn().mockResolvedValue(undefined),
}));

const originalFetch = global.fetch;

function makeResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), { status: 200, ...init });
}

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn(async () => makeResponse({ ok: true })) as unknown as typeof fetch;
  process.env.GITHUB_REPO = 'owner/repo';
  process.env.CODEX_GITHUB_REPO = '';
  process.env.GITHUB_TOKEN = '';
  process.env.GITHUB_PAT = '';
  process.env.CODEX_GITHUB_TOKEN = '';
  process.env.GITHUB_APP_TOKEN = '';
});

afterAll(() => {
  if (originalFetch) {
    global.fetch = originalFetch;
  } else {
    // @ts-expect-error -- cleanup when fetch was undefined
    delete global.fetch;
  }
});

import { handler } from './orchestrator';

function event(body: unknown) {
  return { httpMethod: 'POST', body: JSON.stringify(body) } as any;
}

describe('orchestrator handler', () => {
  it('rejects non-POST requests', async () => {
    const res = await handler({ httpMethod: 'GET' } as any, {} as any);
    expect(res.statusCode).toBe(405);
  });

  it('runs sequential rituals without hydration token', async () => {
    const res = await handler(
      event({
        rituals: [
          {
            kind: 'sequential',
            steps: [{ type: 'run-webhook', url: 'https://example.com/hook', payload: { ok: true } }],
          },
        ],
      }),
      {} as any
    );
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.ok).toBe(true);
    expect(res.headers?.['x-replay-ready']).toBe('false');
  });

  it('hydrates pull requests when token is present', async () => {
    process.env.GITHUB_TOKEN = 'token';
    const mockFetch = global.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce(makeResponse({})); // PR
    mockFetch.mockResolvedValueOnce(makeResponse([])); // files
    mockFetch.mockResolvedValueOnce(makeResponse([])); // comments
    mockFetch.mockResolvedValueOnce(makeResponse([])); // commits

    const res = await handler(
      event({
        rituals: [
          { kind: 'sequential', steps: [{ type: 'hydrate-pr', number: 123 }] },
        ],
      }),
      {} as any
    );
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body as string);
    expect(body.codexReplayOverlay.replayReady).toBe(true);
  });
});

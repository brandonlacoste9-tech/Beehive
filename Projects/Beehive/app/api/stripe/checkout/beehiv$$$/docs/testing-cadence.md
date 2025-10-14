# Testing Cadence · Beehive Forge

This repo treats tests as rituals: fast smoke 🪄, thorough suite 🔬, and enforced gates 🛡️.

---

## Philosophy
- **Speed first** (smoke) → **Confidence second** (full).
- Every PR must prove liveness (smoke) and correctness (full).
- Small, isolated tests; name intent clearly; keep flake at zero.

---

## Taxonomy
- **Smoke**: micro checks proving the app can start + core utilities behave.
  - File pattern: `*smoke*.test.ts`
  - Scope: no network, file, or DB unless mocked.
- **Unit**: pure logic, functions, utils.
- **Integration**: modules together, light I/O, adapters.
- **E2E** (optional here): user journeys; runs out-of-band (not required by default).

---

## Naming & Locations
- Tests live under `__tests__/`.
- Prefer co-located helpers under `__tests__/helpers/`.
- Smoke files include `smoke` in the filename:
  - `__tests__/smoke_log.test.ts` ✅
  - `__tests__/api.health.smoke.test.ts` ✅

---

## Commands
```bash
npm run test:list      # list discovered tests
npm test               # full suite
npm run test:smoke     # smoke-only path
npm run test:coverage  # full suite with coverage
```

**Scripts (root `package.json`)**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:list": "vitest --list",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:smoke": "vitest run \"**/__tests__/**/*smoke*.{test,spec}.{ts,tsx,js}\""
  }
}
```

---

## Vitest Config (root)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.{test,spec}.{ts,tsx,js}'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 60, functions: 60, branches: 50, statements: 60 }
    }
  }
})
```

**Monorepo**

* Root has `vitest.workspace.ts` (optional) to scope `apps/*` and `packages/*`.
* Each package with tests:

  * `package.json`: `{ "scripts": { "test": "vitest run" } }`
  * `vitest.config.ts` (add `@` alias if you use `src/`).

---

## CI Gates

* **Smoke**: runs on PR + push (`.github/workflows/smoke.yml`)
* **Full**: runs on PR + push (`.github/workflows/test.yml`)
* Branch protection (GitHub → Settings → Branches):

  * Require checks: `Smoke / smoke`, `Tests / test (ubuntu-latest, Node 20)` (match exact names shown on PRs).

Badges (README):

```md
[![Tests](https://github.com/brandonlacoste9-tech/Beehive/actions/workflows/test.yml/badge.svg)](https://github.com/brandonlacoste9-tech/Beehive/actions/workflows/test.yml)
[![Smoke](https://github.com/brandonlacoste9-tech/Beehive/actions/workflows/smoke.yml/badge.svg)](https://github.com/brandonlacoste9-tech/Beehive/actions/workflows/smoke.yml)
```

---

## New Package Checklist

* Add `package.json` with `"test": "vitest run"`.
* Add `vitest.config.ts` (alias if needed).
* Add a sentinel: `__tests__/sentinel.test.ts`.
* Add at least one `*smoke*.test.ts` for CI gate.

---

## Troubleshooting

* **“0 tests”** → widen `include` in `vitest.config.ts`; verify path casing; run `npm run test:list`.
* **Alias not found** → set `resolve.alias` or remove `@/` imports.
* **CI passes locally but fails in Actions** → lock Node to 20, use `npm ci`.
* **Flaky tests** → no retries by default. Fix or quarantine with `describe.skip` + issue link; remove quarantine within 48h.

---

## Style Notes

* Use explicit assertions: `toBe`, `toEqual`, `toMatch`.
* Avoid global state; reset mocks: `vi.restoreAllMocks()`.
* Keep tests deterministic; mock time: `vi.setSystemTime(new Date(...))`.

---

## Exit Criteria for a PR

* All smoke tests pass within < 60s.
* Full suite passes and coverage thresholds hold (if enabled).
* No skipped tests left without an issue link.

*Forge bright. Rituals repeatable. Bugs exiled.*

# Changelog / Summary: Theme Import Robustness & Fallback

**Title:** fix(build): add fallback import for TopBar & harden TypeScript path aliases

## Summary
This change hardens theme import resolution across environments. It adds a temporary fallback *relative* import for `TopBar.tsx` to guarantee `../../lib/theme` is resolved correctly in CI/Netlify (Linux, case-sensitive). It also ensures TypeScript path aliases resolve consistently by adding `baseUrl: "."` to `tsconfig.json`. `lib/theme.ts` was added as the canonical theme module. These changes fix a Netlify build error where `@/lib/theme` could not be found during the Netlify build.

## Files touched
- `app/components/TopBar.tsx` — fallback import to `../../lib/theme` (temporary)
- `tsconfig.json` — add `"baseUrl": "."` to `compilerOptions` (robust path alias resolution)
- (already present) `lib/theme.ts` — centralized theme module (committed to `main`)

## Why
- Netlify runs on Linux where filesystem lookups are case-sensitive and TypeScript path alias behavior requires `baseUrl`. Some environments (Windows devs) may not surface the missing-file problem. The fallback relative import ensures `TopBar` can find `theme` during CI builds while we validate alias configuration. Adding `baseUrl` makes `@/*` aliases reliable for Next/webpack/tsc across platforms.

## Testing
- Local test: `npm ci && npm run build` should succeed.
- Netlify: Clear cache and trigger deploy — confirm Netlify builds commit that contains `tsconfig` fix and `lib/theme.ts`.

## Code diff for `TopBar.tsx` (fallback import)
**Before**
```ts
import { getInitialTheme, setTheme, applyTheme, Theme } from "@/lib/theme";
```
**After**
```ts
// Preferred (alias) import — fallback to relative for robust CI builds
import { getInitialTheme, setTheme, applyTheme, Theme } from "../../lib/theme";
```

## Commit & PR text
fix(TopBar): use relative fallback import for theme to avoid alias resolution failures on CI/Netlify

## Revert plan
Once Netlify builds succeed and you confirm `@/lib/theme` resolves across CI:
1. Replace relative import with the original alias:
   ```ts
   import { getInitialTheme, setTheme, applyTheme, Theme } from "@/lib/theme";
   ```
2. Commit:
   ```bash
   git commit -am "chore(TopBar): revert fallback import to alias @/lib/theme"
   git push
   ```

## Additional items
- Add `baseUrl` to `tsconfig.json` (`"baseUrl": "."`) so `paths` aliases function consistently across environments.
- `lib/theme.ts`: canonical theme module added (colors, spacing, typography). It is present on `main`.
- Suggested Netlify hygiene: add `.nvmrc` with `18` and set `NODE_VERSION=18` in Netlify environment to ensure consistent Node runtime. Also, clear Netlify cache and re-deploy.

## Tests & verification
1. Local build: `npm ci && npm run build` (expect success)
2. Netlify: Clear cache and deploy (expect success)
3. Functional: Visit site, confirm theme switching and no console errors.

## Caveats
- If using a `require`-try-catch fallback, TypeScript static typing is bypassed; prefer direct import for type safety.
- Watch for case-sensitivity issues in imports (e.g., `Theme` vs `theme`).

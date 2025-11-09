# Copilot Guardrails

These guardrails **hard-limit** the Copilot Coding Agent's autonomy during Phase-2 execution. Violating any of these causes the PR to be blocked and the agent to escalate to human review.

---

## Size & Scope

- **PR size**: **< 400 LOC** net change. If larger, split into multiple stacked PRs.
- **Scope**: One primary area per PR (Providers XOR Supabase XOR Auth).
- **Blast radius**: Any PR touching `middleware.ts`, `package.json`, or `.env` configs requires explicit human approval before merge.

---

## Secrets & Credentials

- ❌ **Never hardcode secrets** (API keys, tokens, passwords) in code.
- ✅ **Always use `process.env.*`** for sensitive values.
- ✅ Validate that **all required env vars are documented** in `.env.example` or `INTEGRATION_QUICKSTART.md`.
- ✅ If adding a new secret, update:
  1. `.env.example` with placeholder
  2. `INTEGRATION_QUICKSTART.md` (Setup section)
  3. Netlify/CI secrets list in docs

**Check:** Every `process.env` access should have a fallback or explicit error if missing.

---

## Code Quality

### TypeScript
- ✅ **Strict mode**: All `.ts` files must satisfy `npm run type-check`
- ✅ No `any` types unless necessary (document why)
- ✅ Exported types must be explicit (no implicit inference)

### ESLint
- ✅ **Zero violations**: `npm run lint` must pass with no warnings/errors
- ✅ If ignoring a rule, document with `// eslint-disable-next-line [rule]` + reason

### Testing
- ✅ **All behavior changes** require tests (unit or integration)
- ✅ Tests must pass: `npm test`
- ✅ New tests should cover happy path + error cases

---

## Database & Auth

### Supabase (PR-1 only)
- ✅ Every query must reference an RLS policy (comment with policy name)
- ✅ Never use raw SQL unless absolutely necessary (document why + security review)
- ✅ Prefer views/RPC for complex queries over ad-hoc SQL in routes
- ✅ All user-scoped reads must filter by `auth.uid()` or `user_id = auth.uid()`

### Auth (PR-5 only)
- ✅ Every API route must check `session?.user.id` + verify ownership before read/write
- ✅ Dashboard/client pages must read from `useSession()` or server context, never localStorage for auth
- ✅ Never skip RLS enforcement ("security is not optional")

### Providers (PR-3 only)
- ✅ Fallback logic must be tested (unit test for fallback path)
- ✅ Feature flag `AI_PROVIDER` must be checked before selecting adapter
- ✅ Streaming errors must not break the entire request (try-catch at stream boundary)

---

## Documentation

- ✅ **Update with every change:**
  1. `docs/INTEGRATION_QUICKSTART.md` (if setup/env changes)
  2. `docs/PROVIDER_INTEGRATION.md` (if providers change)
  3. `docs/DATABASE_SCHEMA.md` (if schema/RLS policies change)
  4. Inline comments for complex logic (RLS rules, fallback logic, etc.)

- ✅ **PR template checklist** must be completed:
  - [ ] ESLint clean
  - [ ] TS strict passes
  - [ ] Tests added/updated
  - [ ] Docs updated (link)
  - [ ] No secrets committed
  - [ ] Scoped label applied (PR-3 | PR-1 | PR-5)

---

## Git & Process

- ✅ **Commit messages**: Use conventional format: `fix(auth): enforce RLS on user queries (CCR-suggested)`
- ✅ **Branch naming**: `copilot/pr-[1-3]-[brief-slug]` (e.g., `copilot/pr-3-openai-fallback`)
- ✅ **Link to Phase-2**: Every PR must be added to GitHub project **Phase-2**
- ✅ **Labels**: Apply scoped label (`PR-3: Providers`, `PR-1: Supabase`, `PR-5: Auth`)
- ✅ **Reference original PR**: In stacked PR description, link back to the original PR that triggered CCR

---

## Escalation Triggers

**If any of these occur, the agent STOPS and escalates to human review:**

1. ❌ Secrets found in code → **Block + escalate**
2. ❌ Removing or modifying RLS policies → **Block + escalate**
3. ❌ Removing auth checks from API routes → **Block + escalate**
4. ❌ TypeScript strict mode violation → **Block + escalate**
5. ❌ ESLint violations → **Block + escalate**
6. ❌ Tests failing → **Block + escalate**
7. ❌ PR size > 400 LOC → **Block + request split**
8. ❌ Multiple areas touched in one PR → **Block + request split**
9. ❌ `.env` or `middleware.ts` changes without explicit approval → **Block + escalate**

**On escalation:**
- Comment: `@github mention team/security or team/leads` (notify humans)
- Tag PR: `⚠️ escalated: [reason]`
- Stop all further automation until human review

---

## Review Checklist (for Copilot Agent)

Before opening a PR, verify:

- [ ] **Size**: < 400 LOC net change
- [ ] **Scope**: Single area (PR-3 XOR PR-1 XOR PR-5)
- [ ] **Secrets**: No hardcoded API keys, tokens, passwords
- [ ] **TypeScript**: `npm run type-check` passes
- [ ] **ESLint**: `npm run lint` passes
- [ ] **Tests**: `npm test` passes, new tests for behavior changes
- [ ] **Database**: RLS policies referenced in comments (if PR-1/PR-5)
- [ ] **Auth**: User/org ownership checked (if API routes, PR-5)
- [ ] **Docs**: QUICKSTART/PROVIDER_INTEGRATION/DATABASE_SCHEMA updated
- [ ] **Label**: PR-3/PR-1/PR-5 applied
- [ ] **Project**: Added to Phase-2 GitHub project
- [ ] **Reference**: Original PR linked in description

---

## Example: Safe PR (should merge)

✅ **PR-3: Add OpenAI streaming adapter**
- Size: 250 LOC net change
- Scope: Provider adapter only
- Tests: 5 new tests (happy path, fallback, abort, error, timeout)
- Docs: Updated PROVIDER_INTEGRATION.md, added example to QUICKSTART
- No secrets: Uses `process.env.OPENAI_API_KEY`
- ESLint + TS: ✅ Pass
- Labels: `PR-3: Providers`
- Status: **→ Merge approved**

---

## Example: Unsafe PR (should block)

❌ **PR-1: "Quick Supabase migration"**
- Size: 850 LOC net change → **Blocks (too large, split required)**
- Scope: Supabase + Auth + Docs (multiple areas) → **Blocks (split required)**
- Secrets: Found `NEXT_PUBLIC_SUPABASE_KEY` in hardcoded query → **Blocks (escalate)**
- RLS: No RLS policies referenced → **Blocks (escalate)**
- Status: **→ STOP. Escalate to human. No merge.**

---

## Guardrails Summary

| Check | Status | Action |
|-------|--------|--------|
| No secrets | ✅ Must pass | Block if violated |
| < 400 LOC | ✅ Must pass | Block if violated |
| Single area | ✅ Must pass | Block if violated |
| TS strict | ✅ Must pass | Block if violated |
| ESLint | ✅ Must pass | Block if violated |
| Tests pass | ✅ Must pass | Block if violated |
| RLS checked | ✅ Must pass | Block if violated (auth areas) |
| Auth checks | ✅ Must pass | Block if violated (auth areas) |
| Docs updated | ✅ Must pass | Block if violated |
| Labeled | ✅ Must pass | Block if violated |
| Project linked | ✅ Must pass | Block if violated |

---

**Remember:** These guardrails exist to keep Phase-2 **fast, safe, and quality-assured**. Violations trigger escalation—not silence.

Let's ship Phase-2 with confidence! 🚀

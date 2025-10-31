# Copilot Code Review — Instructions

This guide configures **Copilot Code Review (CCR)** and the **Copilot Coding Agent** for Phase-2 execution on Beehive.

---

## Review Priorities

1. **Security** (blocking)
   - RLS policies enforced on all Supabase queries
   - Auth checks on every API route (user/tenant ownership)
   - No secrets in code; use `process.env.*` only
   - OWASP Top 10 basics (injection, XSS, CSRF, etc.)

2. **Correctness** (blocking)
   - Provider fallback logic (OpenAI → GitHub Models)
   - Streaming handlers complete + non-blocking
   - Real-time subscriptions work bidirectionally
   - Tests cover new/changed behavior

3. **Quality Gates** (non-blocking, mergeable if documented)
   - ESLint clean
   - TypeScript strict mode compliance
   - Test coverage for new functions
   - Docs in sync (QUICKSTART, PROVIDER_INTEGRATION, DATABASE_SCHEMA)

---

## Enforcement Rules

**Must enforce:**
- ✅ **No secrets** in code. All config from `process.env.*`.
- ✅ **PR size**: Net change **< 400 LOC**. Split if larger.
- ✅ **Tests**: Add/update tests for behavior changes.
- ✅ **Docs**: Keep QUICKSTART, PROVIDER_INTEGRATION, DATABASE_SCHEMA in sync.
- ✅ **Labels**: Apply scoped label (PR-3/PR-1/PR-5).
- ✅ **ESLint + TS**: Must pass `npm run lint && npm run type-check`.

---

## Repo Context

### Providers (PR-3)
- **Primary:** OpenAI (`gpt-4-turbo`, `gpt-4o`)
- **Fallback:** GitHub Models (free tier)
- **Selection:** Via `AI_PROVIDER=openai|github` env var
- **Streaming:** SSE with AbortController
- **Error handling:** Exponential backoff, circuit breaker, fallback trigger

### Database (PR-1)
- **Engine:** Supabase PostgreSQL
- **Data access:** Prefer views/RPC over ad-hoc SQL in API routes
- **RLS:** Row-level security enforced on all tables
- **Real-time:** `onSubscription` for live updates
- **Types:** Generated from Supabase schema via `types generate`

### Auth (PR-5)
- **Service:** Supabase Auth (JWT tokens in session cookie)
- **Verification:** Every API route checks `session?.user.id` + `org_id` ownership
- **RLS enforcement:** Queries automatically scoped to `auth.uid()` via policies
- **Dashboard:** Reads user/org context from `session` (not localStorage)

---

## When Suggesting Fixes

**If you find issues during review:**

1. **Check severity**
   - 🔴 Blocking: Security, RLS bypass, secrets, broken tests → Request fixes before merge
   - 🟡 Non-blocking: Style, minor optimization → Suggest, allow merge with note
   - 🟢 Nice-to-have: Refactor opportunity, performance polish → Comment for future

2. **Propose a stacked PR**
   - One PR per area (Providers / Supabase / Auth)
   - Include: 1-paragraph rationale + bullet list of files + test notes
   - Title format: `fix(phase2): [area] [specific issue] (CCR-suggested)`
   - Reference the original PR in description

3. **Link to Phase-2 project**
   - Add PR to **Phase-2** GitHub project
   - Apply label: PR-3, PR-1, or PR-5
   - Link back to the original PR

4. **Test coverage**
   - Include unit tests for the fix
   - Add integration test if touching API routes
   - Verify ESLint + TS strict pass

---

## Examples

### ✅ Good: Secure, tested, documented

```typescript
// lib/providers/openai-adapter.ts
async function streamCompletion(
  params: StreamCompletionParams,
  signal?: AbortSignal
): Promise<ReadableStream<string>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set");
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          stream: true,
        }),
        signal,
      }
    );

    return response.body!;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      // Stream cancelled by user → OK
      throw new Error("Stream cancelled");
    }
    // Trigger fallback in provider selector
    throw new Error(`OpenAI error: ${err.message}`);
  }
}
```

**Tests:**
```typescript
test("streamCompletion respects AbortSignal", async () => {
  const controller = new AbortController();
  const promise = streamCompletion({ ... }, controller.signal);
  controller.abort();
  await expect(promise).rejects.toThrow("Stream cancelled");
});

test("streamCompletion throws on missing API key", async () => {
  delete process.env.OPENAI_API_KEY;
  await expect(streamCompletion({ ... })).rejects.toThrow("OPENAI_API_KEY not set");
});
```

---

### ❌ Bad: Secrets exposed, no tests

```typescript
// ❌ DON'T DO THIS
const API_KEY = "sk-proj-xxxxx"; // HARDCODED SECRET!
const response = await fetch("...", { headers: { "Authorization": `Bearer ${API_KEY}` } });
```

→ **CCR blocks merge.** Request fix: Use `process.env.OPENAI_API_KEY`.

---

## Checklist for CCR

Before approving a PR, verify:

- [ ] No hardcoded secrets
- [ ] No `console.log(user)` or `console.log(data)` in prod code
- [ ] RLS policies referenced in comments for all Supabase queries
- [ ] Auth checks (user/org ownership) on every API route
- [ ] Tests added/updated for behavior changes
- [ ] ESLint + TS strict pass
- [ ] Docs updated (QUICKSTART/PROVIDER_INTEGRATION/DATABASE_SCHEMA)
- [ ] PR < 400 LOC net change (split if larger)
- [ ] Labeled with PR-3/PR-1/PR-5
- [ ] Linked to Phase-2 project

---

## For the Copilot Coding Agent

**When opening a stacked PR:**

1. **Propose the plan first** (as a comment or PR draft) before large edits
2. **Keep it tight**: < 400 LOC per PR, split if needed
3. **Include tests**: Unit + integration tests for the change
4. **Update docs**: Sync QUICKSTART/PROVIDER_INTEGRATION/DATABASE_SCHEMA
5. **No secrets**: All config via `process.env.*`
6. **Link**: Reference original PR + link to Phase-2 project
7. **Label**: Apply PR-3/PR-1/PR-5

---

## Reference: Key Files

- **Provider adapters**: `lib/providers/` (interface, openai, github-models)
- **Supabase client**: `lib/supabase/client.ts`, `lib/supabase/types.ts`
- **Auth middleware**: `middleware.ts` (session verification)
- **Dashboard pages**: `app/dashboard/*/page.tsx` (use `useSupabaseQuery` hook)
- **API routes**: `app/api/*/route.ts` (check user ownership)
- **Tests**: `**/*.test.ts`, `e2e/**`
- **Docs**: `docs/PROVIDER_INTEGRATION.md`, `docs/DATABASE_SCHEMA.md`, `docs/INTEGRATION_QUICKSTART.md`

---

**Remember:** CCR is here to speed up Phase-2. Be decisive, propose stacked PRs early, and keep the feedback loop tight.

Let's ship it! 🚀

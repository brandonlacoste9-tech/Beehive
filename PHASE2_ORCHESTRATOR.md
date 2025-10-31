# Phase-2 Orchestrator — Autonomous PR Pipeline

**Status**: ✅ Ready to Deploy
**Components**: 6 files + 1 workflow + setup scripts
**Goal**: Let Copilot Code Review + Claude + CI/CD autonomously execute Phase-2 (Providers, Supabase, Auth)

---

## What Is This?

The **Phase-2 Orchestrator** is a self-healing GitHub workflow system that:

1. **Monitors PRs** touching Phase-2 code (providers, Supabase, auth)
2. **Runs CI** (lint, typecheck, test, build)
3. **Auto-labels** PRs by changed paths
4. **Requests Copilot Code Review (CCR)** with deterministic tools (ESLint, CodeQL, TypeScript)
5. **Pings Copilot Coding Agent** to open **stacked fix PRs** if issues found
6. **Briefs Claude** with a planning prompt to propose diffs
7. **Provides summary** of what ran and what's next

**Result:** You push a branch → orchestrator runs → Copilot suggests fixes → stacked PRs opened → you review/merge → deploy. **All automated.**

---

## Files in This Repo

### Core Orchestration

| File | Purpose |
|------|---------|
| `.github/workflows/phase2.yml` | Orchestrator workflow (CI + CCR + Agent + Claude briefs) |
| `.github/labeler.yml` | Auto-label PRs by paths (PR-3/PR-1/PR-5) |
| `.github/pull_request_template.md` | Checklist for PRs (helps humans + bots align) |

### Guidelines & Guardrails

| File | Purpose |
|------|---------|
| `copilot-instructions.md` | CCR priorities & enforcement rules (security first) |
| `COPILOT_GUARDRAILS.md` | Hard constraints (< 400 LOC, no secrets, tests required) |
| `PHASE2_ORCHESTRATOR.md` | This file—overview & usage |

### Setup Scripts

| File | Purpose |
|------|---------|
| `PHASE2_SETUP.sh` | Bash setup (create labels, project) |
| `PHASE2_SETUP.bat` | Windows batch setup (create labels) |

---

## How It Works

### Trigger Flow

```
User pushes to feature branch
    ↓
GitHub detects changes to Phase-2 files
    ↓
phase2.yml workflow starts
    ├─ Run: Lint • Typecheck • Test • Build (CI)
    │   ↓
    │   If any fail → PR blocks, workflow stops
    │   ↓
    │   If all pass → continue
    │
    ├─ Run: Auto-label by paths (PR-3/PR-1/PR-5)
    │   ↓
    │
    ├─ Request Copilot Code Review (CCR)
    │   └─ @copilot comment mentioning CCR priorities
    │
    ├─ Request Claude planning prompt
    │   └─ @claude comment with Phase-2 scope + constraints
    │
    └─ Summarize (print success + next steps)

Human/Bot reviews responses from @copilot and @claude
    ↓
Copilot opens stacked fix PRs (if needed)
    ↓
Human approves fix PRs
    ↓
Deploy workflow auto-deploys on main merge
```

---

## Setup (One-Time, 5 Minutes)

### 1. Run Setup Script

**On macOS/Linux:**
```bash
bash PHASE2_SETUP.sh
```

**On Windows:**
```cmd
PHASE2_SETUP.bat
```

This creates:
- 6 GitHub labels (PR-3, PR-1, PR-5, area: ci-cd, type: docs, type: test)
- Phase-2 GitHub project for tracking

### 2. Verify Secrets Are Set

Go to **Settings → Secrets and variables → Actions** and confirm:

```
✓ NETLIFY_AUTH_TOKEN
✓ NETLIFY_SITE_ID
✓ OPENAI_API_KEY (or AI_PROVIDER=github for fallback-only)
✓ SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
✓ GITHUB_TOKEN
```

### 3. (Optional) Set Up Copilot Coding Agent

If using **GitHub Copilot Coding Agent** (requires Copilot Pro):

1. Go to **Code → Copilot → Agents** in your repo (or Copilot for GitHub UI)
2. Create a new agent with this prompt:

```markdown
# Phase-2 Executor

You are an expert full-stack developer executing the Phase-2 roadmap for Beehive.

## Task
Implement PR-3 (Providers), PR-1 (Supabase), or PR-5 (Auth) based on @copilot CCR findings.

## Constraints
- Keep each PR **< 400 LOC** net change. Split if larger.
- No hardcoded secrets. Use `process.env.*` only.
- Include tests for behavior changes. `npm test` must pass.
- Update docs (QUICKSTART, PROVIDER_INTEGRATION, DATABASE_SCHEMA).
- Apply label: PR-3, PR-1, or PR-5.
- Link to **Phase-2** GitHub project.

## Scope Details
- **PR-3 (Providers)**: Real OpenAI streaming + GitHub Models fallback via `AI_PROVIDER=openai|github` env var.
- **PR-1 (Supabase)**: Mock data → real Supabase queries (views/RPC) + real-time subscriptions + types.
- **PR-5 (Auth)**: Supabase Auth integration + enforce RLS on all queries + user/org ownership checks.

## Process
1. Analyze @copilot CCR findings
2. Propose a plan (files + diff summary) in a comment
3. Open a stacked PR per area
4. Include tests + docs updates
5. Link back to original PR

Follow `copilot-instructions.md` and `COPILOT_GUARDRAILS.md` strictly.
```

---

## Usage (Per PR)

### When You Open a PR

1. **Push to a feature branch** (not main):
   ```bash
   git checkout -b feat/phase2-my-feature
   # ... make changes ...
   git push -u origin feat/phase2-my-feature
   ```

2. **Open PR against main** (via GitHub web UI)
   - PR template auto-populates with checklist

3. **Orchestrator runs automatically:**
   - CI jobs run (lint, typecheck, test, build)
   - PR gets auto-labeled (PR-3/PR-1/PR-5 based on changed files)
   - @copilot gets pinged with CCR request
   - @claude gets pinged with planning prompt

4. **Review feedback:**
   - Copilot comments with code review
   - Claude comments with suggested diffs/plan
   - You decide: fix yourself or let agent open stacked PR

5. **Merge or let agent fix:**
   - If your PR is good → merge to main → auto-deploy ✅
   - If CCR finds issues → let Copilot agent open fix PRs → review/merge those → re-merge original ✅

---

## Example Workflow

### Scenario: You implement PR-3 (Providers)

```bash
# 1. Create branch
git checkout -b feat/pr3-openai-streaming
mkdir -p lib/providers
cat > lib/providers/openai.ts << 'EOF'
export async function streamCompletion(...) {
  // ... implementation ...
}
EOF
git add -A
git commit -m "feat(pr3): add OpenAI streaming adapter"
git push -u origin feat/pr3-openai-streaming
```

2. **Open PR on GitHub** → PR template auto-fills
3. **Orchestrator runs:**
   - ✅ CI passes (lint, typecheck, test, build)
   - ✅ Auto-labeled: `PR-3: Providers`
   - 📝 @copilot comment: "Found 2 issues: missing error handling, no tests"
   - 📝 @claude comment: "Plan: add try-catch + 3 test cases"

4. **You fix it:**
   - Add error handling + tests
   - Push to same branch
   - Orchestrator re-runs CI + CCR

5. **Merge:**
   - ✅ CCR approves
   - You click "Squash and merge"
   - Deploy workflow auto-runs
   - Your changes are live on Netlify ✨

---

## Phase-2 Scope

The orchestrator tracks and facilitates these three critical PRs:

### PR-3: Providers
**Goal:** Real streaming via OpenAI with GitHub Models fallback

**Files:**
- `lib/providers/interface.ts` - Adapter interface
- `lib/providers/openai.ts` - OpenAI implementation
- `lib/providers/github-models.ts` - GitHub Models implementation
- `lib/providers/selector.ts` - Feature flag logic (`AI_PROVIDER=openai|github`)
- `app/api/chat/route.ts` - Use selected provider for streaming

**Tests:** Happy path, fallback trigger, abort signal, error handling
**Docs:** Update PROVIDER_INTEGRATION.md, QUICKSTART

---

### PR-1: Supabase
**Goal:** Replace mock data with real Supabase queries

**Files:**
- `lib/supabase/client.ts` - Client setup (RLS-aware)
- `lib/supabase/types.ts` - Generated types from schema
- `lib/db/queries.ts` - RPC/view queries
- `app/dashboard/*.tsx` - Use real queries (remove mock data)
- `app/api/dashboard/*.ts` - Real data endpoints

**Tests:** RLS enforcement (ensure user scoping), real-time subscriptions
**Docs:** Update DATABASE_SCHEMA.md, QUICKSTART

---

### PR-5: Auth
**Goal:** Supabase Auth + enforce RLS

**Files:**
- `middleware.ts` - Session verification (JWT from `@supabase/auth-helpers`)
- `lib/auth/session.ts` - Session context utilities
- `app/api/*.ts` - Check `session?.user.id` + `org_id` ownership
- `app/dashboard/layout.tsx` - Read user from `session` (not localStorage)
- `lib/supabase/rls.sql` - RLS policies (enforce `auth.uid()`)

**Tests:** Unauthorized access blocked, user can only see own data
**Docs:** Update INTEGRATION_QUICKSTART.md

---

## Guardrails

The orchestrator **strictly enforces** these constraints via `COPILOT_GUARDRAILS.md`:

- ✅ **No secrets** in code (use `process.env.*`)
- ✅ **< 400 LOC** per PR (split if larger)
- ✅ **Tests required** for behavior changes
- ✅ **ESLint + TS strict** must pass
- ✅ **Docs updated** (QUICKSTART/PROVIDER_INTEGRATION/DATABASE_SCHEMA)
- ✅ **Labeled** (PR-3/PR-1/PR-5)
- ✅ **Linked** to Phase-2 project

If any guardrail is violated, the PR is **blocked** and escalates to human review.

---

## Monitoring & Debugging

### View Workflow Runs

Go to **Actions** tab in your repo:
```
Click on "Phase 2 — Providers • Supabase • Auth (Orchestrator)"
  ↓
Select a workflow run
  ↓
Expand job details to see logs
```

### Common Outputs

**Success:**
```
✅ Phase 2 Orchestrator Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ CI (Lint/Typecheck/Test/Build)
✓ Auto-labeled by paths
✓ @copilot CCR requested
✓ @claude planning prompt posted

🤖 Next: Copilot opens stacked fix PRs
👤 You: Review → approve → merge → auto-deploy
```

**CI Failure:**
```
ESLint: 3 violations found
  → Fix locally
  → Push to same branch
  → Orchestrator re-runs
```

**CCR Blocks Merge:**
```
@copilot: "Found RLS policy missing on user query (lines 42-45)"
  → Apply fix
  → Push to same branch
  → Orchestrator re-runs CCR
```

---

## FAQ

**Q: Can I skip CCR?**
A: No. CCR is blocking. If it finds security issues, the PR won't merge until fixed.

**Q: What if my PR is > 400 LOC?**
A: Orchestrator blocks it and asks to split. This keeps PRs reviewable.

**Q: Can Copilot agent push directly to main?**
A: No. It opens stacked PRs on branches. You review + merge. (Safety first.)

**Q: What if tests fail?**
A: CI blocks the PR. Fix locally, push to same branch, orchestrator re-runs.

**Q: Do I have to use the agent?**
A: No. You can fix everything yourself. Agent is optional and only activates if CCR requests it.

**Q: Can I disable CCR for a PR?**
A: No, CCR is always on. But you can request it skip certain checks (documented in PR).

---

## Next Steps

### Immediate (Now)
1. ✅ Run `PHASE2_SETUP.sh` or `PHASE2_SETUP.bat`
2. ✅ Verify secrets are set
3. ✅ Read `copilot-instructions.md` (CCR priorities)
4. ✅ Read `COPILOT_GUARDRAILS.md` (hard constraints)

### Start Phase-2
```bash
git checkout -b feat/phase2-kickoff
mkdir -p lib/providers
echo "// Phase-2 starting..." > lib/providers/README.md
git add -A
git commit -m "chore(phase2): kickoff orchestrator"
git push -u origin feat/phase2-kickoff
```

Then open a PR and watch the orchestrator run! 🚀

### Optional: Set up Copilot Agent
If using GitHub Copilot Pro, configure the agent with the prompt above.

---

## Support

- **How does CCR work?** → `copilot-instructions.md`
- **What are the hard limits?** → `COPILOT_GUARDRAILS.md`
- **How do I run locally?** → See INFRASTRUCTURE_COMPLETE.md
- **CI failed, help!** → Check GitHub Actions logs

---

## Summary

You now have **an autonomous PR pipeline** that:
- Runs tests on every change
- Enforces code quality (ESLint, TS, tests)
- Requests expert code review (Copilot CCR)
- Suggests fixes (Claude planning)
- Opens stacked PRs (Copilot agent)
- Deploys automatically on merge

**Phase-2 is now automated. Let's ship it! 🚀**

---

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: October 31, 2025

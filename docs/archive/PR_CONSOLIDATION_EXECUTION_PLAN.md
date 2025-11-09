# PR Consolidation Execution Plan
**Status:** Ready to Execute
**Date:** Nov 1, 2025
**Objective:** Consolidate 20+ open PRs into focused 2-3 PRs, clearing blocker for Phase 2.2

---

## Prerequisites

Before executing any phase:
1. ✅ Verify main branch is stable: `npm run build && npm run type-check`
2. ✅ Ensure all 4 target PRs (#38, #32, #7, #4) have passing Netlify deploys
3. ✅ Pull latest from origin: `git fetch origin && git pull origin main`

---

## Phase 1: Duplicate Resolution ⏱️ ~5 mins

**Objective:** Close duplicate PR #33 (Revert CodeQL) which is a duplicate of PR #32

### Step 1.1 - Close PR #33
```bash
gh pr close 33 --comment "Duplicate of #32. Consolidated into single PR."
```

**Expected Result:** PR #33 closed with consolidated message

### Step 1.2 - Review CI/CD PRs #24 vs #25
```bash
# View PR #24
gh pr view 24 --json title,body,commits

# View PR #25
gh pr view 25 --json title,body,commits
```

**Decision Point:**
- If #25 is newer and covers #24: Close #24 with `gh pr close 24 -c "Superseded by #25 (newer CI/CD implementation)"`
- If #24 is better: Close #25 instead
- If both needed: Keep both and merge both in Phase 2

---

## Phase 2: Merge High-Priority Infrastructure & Features ⏱️ ~15 mins

**Objective:** Merge critical infrastructure, observability, and Phase-2 features

### Infrastructure (2 PRs)
```bash
# PR #25: CI/CD with security scanning + ECS
gh pr merge 25 --auto --delete-branch

# PR #36: /status page for telemetry monitoring
gh pr merge 36 --auto --delete-branch
```

### Core Features (3 PRs)
```bash
# PR #22: Phase-2 AI providers, Supabase auth integration
gh pr merge 22 --auto --delete-branch

# PR #19: Merge Beehive repository integration
gh pr merge 19 --auto --delete-branch

# PR #18: Fix telemetry & codex health monitoring
gh pr merge 18 --auto --delete-branch
```

**After Phase 2:** Run verification
```bash
npm run build
npm run type-check
npm test
```

---

## Phase 3: Merge Documentation & Governance ⏱️ ~10 mins

**Objective:** Merge documentation, code governance, and developer guidance

```bash
# PR #14: CODEOWNERS & reviewer checklist
gh pr merge 14 --auto --delete-branch

# PR #13: Codex operational docs & fixtures
gh pr merge 13 --auto --delete-branch

# PR #11: Capture codex artifacts documentation
gh pr merge 11 --auto --delete-branch

# PR #16: Update README
gh pr merge 16 --auto --delete-branch

# PR #38: Copilot instructions for AI-assisted development
gh pr merge 38 --auto --delete-branch

# PR #15: Refactor - centralize JSON helpers
gh pr merge 15 --auto --delete-branch
```

**After Phase 3:** Verify documentation is in place
```bash
ls -la docs/
cat CODEOWNERS
cat README.md | head -20
```

---

## Phase 4: Auto-Merge Dependencies ⏱️ ~5 mins

**Objective:** Update dependencies for security and type definitions

```bash
# PR #4: @netlify/blobs bump (7.4.0 → 10.3.0)
gh pr merge 4 --auto --delete-branch

# PR #7: @types/node bump (20.19.23 → 24.9.1)
gh pr merge 7 --auto --delete-branch
```

**After Phase 4:** Verify dependencies
```bash
npm list @netlify/blobs
npm list @types/node
npm run type-check  # Should pass with new @types/node
```

---

## Phase 5: Close Non-Critical PRs ⏱️ ~5 mins

**Objective:** Close PRs that are redundant, deferred, or reverted

```bash
# PR #12: Beehive integration script (redundant with #19)
gh pr close 12 --comment "Superseded by PR #19 (Beehive merge). Consolidated into broader integration."

# PR #21: npm package publishing workflow (out of scope for Phase 2)
gh pr close 21 --comment "Deferred: npm publishing not required for current Phase 2.2 scope. Can revisit in Phase 3."

# PR #23: CodeQL analysis workflow (being reverted by #32)
gh pr close 23 --comment "Reverted by PR #32. CodeQL deferred pending security strategy clarification."
```

---

## Phase 6: Monitor Work-in-Progress ⏱️ Ongoing

**PR #9: Sensory Cortex Agent Mode (WIP)**

```bash
# Check status
gh pr view 9 --json title,state,comments

# Decision points:
# - If complete: Merge with gh pr merge 9 --auto
# - If abandoned: Close with appropriate message
# - If active: Keep open, check back in 1 week
```

**Monitoring checklist:**
- [ ] PR #9 has recent activity (commits/comments)
- [ ] No conflicts with merged PRs
- [ ] Implementation aligns with Phase 2.2 objectives

---

## Full Execution Summary

| Phase | Action | PRs | Time | Status |
|-------|--------|-----|------|--------|
| 1 | Close duplicates | #33, review #24/#25 | 5 min | ⏳ Ready |
| 2 | Merge infrastructure & features | #25, #36, #22, #19, #18 | 15 min | ⏳ Ready |
| 3 | Merge docs & governance | #14, #13, #11, #16, #38, #15 | 10 min | ⏳ Ready |
| 4 | Auto-merge dependencies | #4, #7 | 5 min | ⏳ Ready |
| 5 | Close non-critical | #12, #21, #23 | 5 min | ⏳ Ready |
| 6 | Monitor WIP | #9 | Ongoing | ⏳ Ready |

**Total Time: ~40 minutes for complete consolidation**

---

## Execution Checklist

### Pre-Execution
- [ ] Main branch builds successfully
- [ ] All 4 target PRs (#38, #32, #7, #4) have green Netlify deploys
- [ ] Fresh `git fetch origin`
- [ ] No uncommitted changes locally

### Phase 1
- [ ] PR #33 closed
- [ ] Decision made on #24 vs #25
- [ ] Losing PR closed (if applicable)

### Phase 2
- [ ] PR #25 merged
- [ ] PR #36 merged
- [ ] PR #22 merged
- [ ] PR #19 merged
- [ ] PR #18 merged
- [ ] Build passes after merges
- [ ] Type-check passes

### Phase 3
- [ ] PR #14 merged
- [ ] PR #13 merged
- [ ] PR #11 merged
- [ ] PR #16 merged
- [ ] PR #38 merged
- [ ] PR #15 merged
- [ ] Documentation verified

### Phase 4
- [ ] PR #4 merged
- [ ] PR #7 merged
- [ ] Dependencies verified
- [ ] Type-check passes with new @types/node

### Phase 5
- [ ] PR #12 closed
- [ ] PR #21 closed
- [ ] PR #23 closed

### Phase 6
- [ ] PR #9 status checked
- [ ] Decision documented

### Post-Execution
- [ ] Final build: `npm run build` ✅
- [ ] Final type-check: `npm run type-check` ✅
- [ ] Tests pass: `npm test` ✅
- [ ] Verify main branch: `git log --oneline -10`
- [ ] Open PR count reduced to ~2

---

## Troubleshooting

### Merge Conflicts in Phase 2
If any Phase 2 PR fails to merge due to conflicts:

```bash
# The merge will be attempted. If it fails:
# 1. Identify the conflicting files
# 2. Check the PR for conflict resolution
# 3. Either:
#    a. Manually resolve and push to PR branch
#    b. Rebase the PR on latest main
# 4. Retry merge

gh pr merge <NUMBER> --auto  # Retries
```

### Build Failure After Merges
If build fails after Phase 2 merges:

```bash
# Revert the problematic merge
git revert -m 1 <merge-commit-hash>
git push origin main

# Then investigate the failing PR
gh pr view <NUMBER> --json commits
```

### Merge Already Done
If `gh pr merge` says PR is already merged:
```bash
# It's already merged, just proceed to next
# Or verify with:
gh pr view <NUMBER> --json state
```

---

## Success Criteria

After complete execution:

✅ **PR Count:** Reduced from 20+ to ~2 open (only #9 WIP)
✅ **Main Branch:** All merged PRs successfully integrated
✅ **Build:** `npm run build` completes without errors
✅ **Type-Check:** `npm run type-check` passes
✅ **Tests:** `npm test` passes
✅ **Documentation:** CODEOWNERS, README, docs updated
✅ **Dependencies:** @netlify/blobs and @types/node updated
✅ **Infrastructure:** CI/CD and status monitoring merged
✅ **Ready for Phase 2.2:** Clean repository state, focus on serverless publishing

---

## Next Steps After Consolidation

Once consolidation is complete:

1. **Verify Phase 2.2 readiness:** Infrastructure in place ✅
2. **Begin Phase 2.2:** Serverless Publishing Pipeline
   - Instagram, TikTok, YouTube integrations
   - Autonomous content scheduling
   - Performance analytics
3. **Maintain:** Monitor PR #9 (Sensory Cortex Agent Mode)

---

## Quick Copy-Paste Execution

If you want to execute all phases rapidly, here's the consolidated command sequence:

```bash
# Phase 1
gh pr close 33 --comment "Duplicate of #32. Consolidated into single PR."

# Phase 2
gh pr merge 25 --auto --delete-branch
gh pr merge 36 --auto --delete-branch
gh pr merge 22 --auto --delete-branch
gh pr merge 19 --auto --delete-branch
gh pr merge 18 --auto --delete-branch

# Phase 3
gh pr merge 14 --auto --delete-branch
gh pr merge 13 --auto --delete-branch
gh pr merge 11 --auto --delete-branch
gh pr merge 16 --auto --delete-branch
gh pr merge 38 --auto --delete-branch
gh pr merge 15 --auto --delete-branch

# Phase 4
gh pr merge 4 --auto --delete-branch
gh pr merge 7 --auto --delete-branch

# Phase 5
gh pr close 12 --comment "Superseded by PR #19 (Beehive merge)."
gh pr close 21 --comment "Deferred: npm publishing not needed for current scope."
gh pr close 23 --comment "Reverted by PR #32. CodeQL deferred."

# Verification
npm run build
npm run type-check
npm test
```

---

**Status:** Document created and ready for execution.
**Next Action:** Execute phases sequentially, running verification after Phase 2.

# Netlify Deployment Fixes for Open PRs
**Status:** Guide for fixing failing deploy previews
**Date:** Oct 31, 2024

---

## Problem Summary
PRs #38, #32, #7, #4 are experiencing Netlify deploy preview failures.
Main branch builds successfully, so issues are likely in older PR branches.

---

## Common Deployment Failures & Fixes

### 1. ❌ Missing Root Layout or Home Page
**Symptom:** `Module not found: Can't resolve '@/app/page'` or layout errors

**Root Cause:** PRs based on older commits before home page restoration

**Fix:** PR branches need these files:
```bash
# Ensure these exist:
- app/layout.tsx  ✅ (SEO metadata, HTML structure)
- app/page.tsx    ✅ (Home page with hero, features, footer)
```

**Solution:** Rebase PR on latest main, or cherry-pick commits:
```bash
# Option A: Rebase PR on main
git rebase origin/main

# Option B: Cherry-pick missing commits
git cherry-pick f81d5a1  # Restores layout and page
```

---

### 2. ❌ Missing tsconfig.json Fixes
**Symptom:** `Module not found: Can't resolve '@/lib/...'`

**Root Cause:** tsconfig.json lacks `baseUrl: "."` for path resolution

**Fix:** Ensure tsconfig.json has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*", "./lib/*"],
      "@/components/*": ["./app/components/*"],
      "@/lib/*": ["./lib/*"]
    }
  }
}
```

**Solution:** Cherry-pick commit:
```bash
git cherry-pick 095ce1a  # Adds baseUrl to tsconfig
```

---

### 3. ❌ Missing AI Generation Engine Files
**Symptom:** `Module not found` errors for Creative Studio

**Root Cause:** PR branches don't have Phase 2.1 files

**Files needed:**
- `lib/personas.ts` - 5 buyer personas
- `lib/claude.ts` - Claude API integration
- `lib/ad-generation.ts` - Core generation logic
- `app/api/generate/*` - API endpoints
- `app/components/CreativeStudio/*` - UI components
- `app/creative-studio/*` - Page and layout

**Solution:** Cherry-pick Phase 2.1 commit:
```bash
git cherry-pick 1e101f7  # Full Phase 2.1 implementation
```

---

### 4. ❌ ESLint/Build Warnings
**Symptom:** Build warnings cause deploy delays

**Root Cause:** Unused variables, missing imports

**Files fixed:**
- `app/components/Pricing.tsx` - Removed unused GooglePayButton import
- `lib/claude.ts` - Removed unused fullPrompt variable
- `app/components/CreativeStudio/AdPreview.tsx` - Removed unused state

**Solution:** Cherry-pick quality fix:
```bash
git cherry-pick f81d5a1  # Fixes ESLint warnings
```

---

### 5. ❌ Missing API Validation
**Symptom:** API endpoints lack proper validation

**Root Cause:** New validation utilities not in PR branches

**File needed:** `lib/api-validation.ts`

**Solution:** Cherry-pick validation commit:
```bash
git cherry-pick 5d8ff30  # Adds API validation utilities
```

---

## Quick Fix for Each PR

### PR #38 - Copilot Instructions
**Issue:** Likely missing home page and layout fixes
**Fix:**
```bash
# Checkout PR branch
git checkout copilot/add-copilot-instructions

# Rebase on main to get all fixes
git rebase origin/main

# Resolve conflicts (if any)
git add .
git rebase --continue

# Push updated branch
git push --force origin copilot/add-copilot-instructions
```

### PR #32 - Revert CodeQL
**Issue:** Older commit, missing recent improvements
**Fix:**
```bash
git checkout origin/main -- app/ lib/
git add app/ lib/
git commit -m "Sync latest app and lib changes from main"
git push
```

### PR #7 - @types/node Bump
**Issue:** Dependency update on old code
**Fix:**
```bash
git rebase origin/main
git push --force-with-lease
```

### PR #4 - @netlify/blobs Bump
**Issue:** Dependency update on old code
**Fix:**
```bash
git rebase origin/main
git push --force-with-lease
```

---

## Automated Fix Script

```bash
#!/bin/bash
# Fix all failing PRs by rebasing on main

PRs=(38 32 7 4)

for pr in "${PRs[@]}"; do
  echo "Fixing PR #$pr..."

  # Get PR branch name (would need gh pr view $pr --json headRefName)
  # For now, manually rebase each

  # git fetch origin
  # git checkout pr-branch-name
  # git rebase origin/main
  # Resolve conflicts if needed
  # git push --force-with-lease

  echo "Done with PR #$pr"
done
```

---

## Testing Before & After

### Before Rebase
```bash
npm run build  # May fail
```

### After Rebase
```bash
npm run build          # ✅ Should pass
npm run type-check     # ✅ Should pass
npm run lint           # ✅ Should pass
npm test --if-present  # ✅ Should pass
```

---

## Netlify Build Configuration

Ensure `netlify.toml` is correct:
```toml
[build]
  command = "npm run build"
  publish = "/opt/build/repo/out"
  functions = "netlify/functions"
```

---

## Summary of Commits to Cherry-Pick

| Commit | Title | Purpose |
|--------|-------|---------|
| `f81d5a1` | Restore home page & layout | Critical - fixes missing files |
| `095ce1a` | Add baseUrl to tsconfig | Critical - fixes path resolution |
| `1e101f7` | Phase 2.1 AI Generation Engine | Important - adds creative studio |
| `5d8ff30` | API validation utilities | Important - hardens APIs |

---

## Manual Steps to Fix Any PR

1. **Checkout the PR branch:**
   ```bash
   git fetch origin
   git checkout pr-branch-name
   ```

2. **Rebase on main:**
   ```bash
   git rebase origin/main
   ```

3. **Resolve conflicts** (if any):
   ```bash
   # Git will tell you which files have conflicts
   # Edit them, then:
   git add .
   git rebase --continue
   ```

4. **Verify build works:**
   ```bash
   npm install
   npm run build
   npm run type-check
   ```

5. **Push updated branch:**
   ```bash
   git push --force-with-lease origin pr-branch-name
   ```

6. **GitHub will auto-update the PR** with new commits

---

## Success Criteria

✅ Netlify deploy preview succeeds
✅ Build completes without errors
✅ TypeScript type-check passes
✅ ESLint passes
✅ Home page renders
✅ Creative Studio page loads
✅ API endpoints respond

---

## Need Help?

If PRs still fail after these fixes:
1. Check Netlify build logs for specific error
2. Compare PR branch files with main
3. Look for missing imports or dependencies
4. Verify environment variables are set

Main branch is the source of truth - it builds successfully! 🎉

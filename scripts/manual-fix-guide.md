# Manual Fix Guide: Remove Corrupted Workflow File

## Problem
Your `main` branch contains a corrupted directory structure:
```
.github/workflows/- name: Cache   uses: actions/- name: Cache   uses: actions/.../cache@v4.3.0
```

This is blocking all git operations on Windows.

## Solution: GitHub Web UI (RECOMMENDED - 2 minutes)

### Option 1: Direct Navigation

1. **Go to:** https://github.com/brandonlacoste9-tech/Beehive

2. **Navigate to:** Settings → Code and automation → Actions

3. **Delete invalid workflows:**
   - Look for any workflow with a strange name containing "Cache uses actions"
   - Delete it

### Option 2: File Browser

1. **Go to:** https://github.com/brandonlacoste9-tech/Beehive/tree/main/.github/workflows

2. **Look for** a directory or file named:
   - `- name: Cache   uses: actions`
   - It will stand out as obviously wrong

3. **If it's a directory:**
   - Click into it
   - Navigate to the deepest file
   - Click the trash icon (🗑️)
   - Commit message: `fix: remove corrupted workflow`
   - Commit directly to `main`

4. **If you can't navigate into it:**
   - Try deleting from the command line (see Option 3 below)

### Option 3: Command Line via Git Filter-Repo

**Prerequisites:**
```bash
pip install git-filter-repo
```

**Steps:**
```bash
# Clone a fresh copy (in a temp directory)
cd /tmp
git clone https://github.com/brandonlacoste9-tech/Beehive beehive-fix
cd beehive-fix

# Remove the corrupted path from history
git filter-repo --path '.github/workflows/- name: Cache   uses: actions' --invert-paths

# Force push to fix main
git push origin main --force
```

⚠️ **WARNING:** This rewrites history. Only do this if you're okay with force-pushing to main.

### Option 4: Create a Fresh Main Branch

If all else fails, you can create a new `main` branch from a working commit:

```bash
# Find the last good commit before the corruption
git log --oneline origin/main --all | grep -v "Cache"

# Create new main from that commit
git checkout <last-good-commit-sha>
git checkout -b main-fixed
git push origin main-fixed

# Then in GitHub UI:
# 1. Go to Settings → Branches
# 2. Change default branch to main-fixed
# 3. Delete the old main branch
# 4. Rename main-fixed to main
```

## After the Fix

Once the corrupted file is removed, run:

```bash
cd c:/Users/north/OneDrive/Documents/GitHub/Beehive
git fetch origin
git checkout main
git reset --hard origin/main
bash scripts/recover-webhook-automation.sh
```

This will:
1. Sync your local main with the fixed remote
2. Create a fresh webhook automation branch
3. Cherry-pick your webhook commits
4. Create the PR

## Verification

After fixing, verify with:

```bash
git ls-tree -r origin/main | grep "Cache"
```

Should return empty (no results).

## What Caused This

This typically happens from:
- Accidentally committing a directory with a malformed name
- A merge conflict that created an invalid path
- Copy-paste errors in workflow files
- Git operations interrupted mid-way

The Windows filesystem doesn't allow certain characters in filenames, which is why this breaks on Windows but might work on Linux/Mac.

## Need Help?

If you're stuck, you can:
1. Ask me to help navigate the GitHub UI
2. Share screenshots of what you see in `.github/workflows/`
3. Try the git-filter-repo approach (requires Python)

## Quick Start (TL;DR)

**Fastest fix:**
1. Open: https://github.com/brandonlacoste9-tech/Beehive/tree/main/.github/workflows
2. Delete the directory with the weird "Cache" name
3. Commit with message: `fix: remove corrupted workflow`
4. Run: `git fetch origin && git reset --hard origin/main`
5. Run: `bash scripts/recover-webhook-automation.sh`

Done! 🎉

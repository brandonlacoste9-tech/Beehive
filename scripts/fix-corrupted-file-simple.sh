#!/usr/bin/env bash
set -euo pipefail

# Simple fix for corrupted workflow file using GitHub API
# This removes the entire corrupted directory tree

REPO="brandonlacoste9-tech/Beehive"
BRANCH="main"

echo "🔧 Removing corrupted workflow directory structure from $REPO:$BRANCH"

# Get current main commit
MAIN_SHA=$(gh api "repos/$REPO/git/ref/heads/$BRANCH" --jq '.object.sha')
echo "Current main SHA: $MAIN_SHA"

# Get the commit's tree
COMMIT_TREE=$(gh api "repos/$REPO/git/commits/$MAIN_SHA" --jq '.tree.sha')
echo "Current tree SHA: $COMMIT_TREE"

# Get the .github tree
GITHUB_TREE=$(gh api "repos/$REPO/git/trees/$COMMIT_TREE" --jq '.tree[] | select(.path == ".github") | .sha')
echo ".github tree SHA: $GITHUB_TREE"

# Get the workflows tree
WORKFLOWS_TREE=$(gh api "repos/$REPO/git/trees/$GITHUB_TREE" --jq '.tree[] | select(.path == "workflows") | .sha')
echo "workflows tree SHA: $WORKFLOWS_TREE"

# Get all valid workflow files (exclude the corrupted ones)
echo "Fetching valid workflow files..."
VALID_WORKFLOWS=$(gh api "repos/$REPO/git/trees/$WORKFLOWS_TREE" --jq '.tree[] | select(.path | startswith("- name:") | not) | {path: .path, mode: .mode, type: .type, sha: .sha}')

echo "Valid workflows:"
echo "$VALID_WORKFLOWS" | jq -r '.path'

# Create new workflows tree
echo "Creating new workflows tree without corrupted files..."
NEW_WORKFLOWS_TREE=$(echo "$VALID_WORKFLOWS" | jq -s '{tree: .}' | gh api --method POST "repos/$REPO/git/trees" --input - --jq '.sha')
echo "New workflows tree SHA: $NEW_WORKFLOWS_TREE"

# Get all .github items except workflows
GITHUB_ITEMS=$(gh api "repos/$REPO/git/trees/$GITHUB_TREE" --jq '.tree[] | select(.path != "workflows") | {path: .path, mode: .mode, type: .type, sha: .sha}')

# Add the new workflows tree
NEW_GITHUB_TREE=$(echo "$GITHUB_ITEMS" | jq -s '. + [{path: "workflows", mode: "040000", type: "tree", sha: "'$NEW_WORKFLOWS_TREE'"}] | {tree: .}' | gh api --method POST "repos/$REPO/git/trees" --input - --jq '.sha')
echo "New .github tree SHA: $NEW_GITHUB_TREE"

# Get root tree items except .github
ROOT_ITEMS=$(gh api "repos/$REPO/git/trees/$COMMIT_TREE" --jq '.tree[] | select(.path != ".github") | {path: .path, mode: .mode, type: .type, sha: .sha}')

# Create new root tree
NEW_ROOT_TREE=$(echo "$ROOT_ITEMS" | jq -s '. + [{path: ".github", mode: "040000", type: "tree", sha: "'$NEW_GITHUB_TREE'"}] | {tree: .}' | gh api --method POST "repos/$REPO/git/trees" --input - --jq '.sha')
echo "New root tree SHA: $NEW_ROOT_TREE"

# Create commit
COMMIT_MESSAGE="fix: remove corrupted workflow directory structure

Removes invalid nested directories and file with malformed name:
.github/workflows/- name: Cache   uses: actions/.../cache@v4.3.0

This was blocking all git operations on Windows.

🤖 Auto-fixed via GitHub API"

NEW_COMMIT=$(gh api --method POST "repos/$REPO/git/commits" \
  --field message="$COMMIT_MESSAGE" \
  --field tree="$NEW_ROOT_TREE" \
  --field parents[]="$MAIN_SHA" \
  --jq '.sha')

echo "New commit SHA: $NEW_COMMIT"

# Update main branch
gh api --method PATCH "repos/$REPO/git/refs/heads/$BRANCH" \
  --field sha="$NEW_COMMIT" \
  --field force=false

echo "✅ Corrupted file structure removed from main!"
echo ""
echo "Next steps:"
echo "1. git fetch origin"
echo "2. git checkout main"
echo "3. git reset --hard origin/main"
echo "4. bash scripts/recover-webhook-automation.sh"

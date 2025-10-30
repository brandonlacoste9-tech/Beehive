#!/bin/bash

set -e

echo "=== Fixing corrupted workflow file in main branch ==="
echo ""

# Get the current commit SHA of origin/main
MAIN_SHA=$(git rev-parse origin/main)
echo "Current main branch SHA: $MAIN_SHA"

# Get the tree SHA of the current main commit
TREE_SHA=$(git cat-file -p $MAIN_SHA | grep '^tree' | cut -d' ' -f2)
echo "Current tree SHA: $TREE_SHA"

# List all files in the tree, excluding the corrupted workflow file
echo ""
echo "Creating new tree without corrupted file..."
git ls-tree -r $TREE_SHA | \
  grep -v "\.github/workflows/- name: Cache" > /tmp/tree-list.txt

# Check if we successfully filtered the file
ORIGINAL_COUNT=$(git ls-tree -r $TREE_SHA | wc -l)
NEW_COUNT=$(cat /tmp/tree-list.txt | wc -l)
echo "Original tree had $ORIGINAL_COUNT entries"
echo "New tree will have $NEW_COUNT entries"
echo "Removed $((ORIGINAL_COUNT - NEW_COUNT)) corrupted entry"

# Get the parent tree structure
echo ""
echo "Rebuilding tree structure..."

# We need to rebuild the tree from the bottom up
# First, let's get all the subtrees we need

# Create a new .github/workflows tree without the corrupted file
git ls-tree $TREE_SHA:.github/workflows 2>/dev/null | \
  grep -v "- name: Cache" > /tmp/workflows-tree.txt || echo "No valid workflows found"

# Create the new workflows tree
WORKFLOWS_TREE=$(cat /tmp/workflows-tree.txt | git mktree)
echo "New workflows tree: $WORKFLOWS_TREE"

# Get the .github tree and replace the workflows subtree
git ls-tree $TREE_SHA:.github | \
  sed "s|tree [0-9a-f]* workflows|tree $WORKFLOWS_TREE workflows|" > /tmp/github-tree.txt

GITHUB_TREE=$(cat /tmp/github-tree.txt | git mktree)
echo "New .github tree: $GITHUB_TREE"

# Get the root tree and replace the .github subtree
git ls-tree $TREE_SHA | \
  sed "s|tree [0-9a-f]* .github|tree $GITHUB_TREE .github|" > /tmp/root-tree.txt

ROOT_TREE=$(cat /tmp/root-tree.txt | git mktree)
echo "New root tree: $ROOT_TREE"

# Create a new commit with the fixed tree
COMMIT_MSG="fix: Remove corrupted workflow file

This commit removes the corrupted workflow file with the invalid path:
.github/workflows/- name: Cache   uses: actions/.../cache@v4.3.0

This file was causing git operations to fail on Windows filesystems
due to the invalid characters in the filename."

NEW_COMMIT=$(git commit-tree $ROOT_TREE -p $MAIN_SHA -m "$COMMIT_MSG")
echo ""
echo "Created new commit: $NEW_COMMIT"

# Show what we're about to do
echo ""
echo "=== Summary ==="
echo "Old main commit: $MAIN_SHA"
echo "New main commit: $NEW_COMMIT"
echo ""
echo "This commit will be pushed to the current branch first for review."
echo "After verification, it can be pushed to main."

# Update the current branch to point to the new commit
git reset --hard $NEW_COMMIT

echo ""
echo "✓ Current branch updated to the fixed commit"
echo "✓ Ready to push to origin/$(git rev-parse --abbrev-ref HEAD)"

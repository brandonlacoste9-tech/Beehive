#!/usr/bin/env bash
# scripts/pr-create.sh
# Create branch, add/commit files, push, and open a PR via gh.
# Usage examples:
#  ./scripts/pr-create.sh --branch feature/my-change --title "feat: my change" --body "desc" --all
#  ./scripts/pr-create.sh --branch feature/x --title "docs" --paths "README.md,docs/foo.md" --reviewer user1 --label infra

set -euo pipefail
PROG="$(basename "$0")"

usage() {
  cat <<EOF
Usage: $PROG [options]

Options:
  --branch NAME        Branch name (required)
  --base NAME          Base branch (default: main)
  --title TEXT         PR title (defaults to commit message or "chore: update")
  --body TEXT          PR body
  --paths CSV          Comma-separated paths to add (mutually exclusive with --all)
  --all                Stage all changes (git add -A)
  --draft              Create draft PR
  --reviewer USER      Request reviewer (repeatable)
  --label LABEL        Add label (repeatable)
  --open               Open PR in browser after creation (uses gh)
  --force              Reuse existing branch if present
  -h, --help           Show this help
EOF
  exit 1
}

# defaults
BRANCH=""
BASE="main"
TITLE=""
BODY=""
ALL=false
DRAFT=false
OPEN=false
FORCE=false
PATHS=""
REVIEWERS=()
LABELS=()

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch) BRANCH="$2"; shift 2;;
    --base) BASE="$2"; shift 2;;
    --title) TITLE="$2"; shift 2;;
    --body) BODY="$2"; shift 2;;
    --paths) PATHS="$2"; shift 2;;
    --all) ALL=true; shift;;
    --draft) DRAFT=true; shift;;
    --reviewer) REVIEWERS+=("$2"); shift 2;;
    --label) LABELS+=("$2"); shift 2;;
    --open) OPEN=true; shift;;
    --force) FORCE=true; shift;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1"; usage;;
  esac
done

if [[ -z "$BRANCH" ]]; then
  echo "ERROR: --branch is required"
  usage
fi

# sanity
command -v git >/dev/null 2>&1 || { echo "git required"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "gh (GitHub CLI) required"; exit 1; }

# detect repo root
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  echo "Must run inside a git repo."
  exit 1
fi
cd "$REPO_ROOT"

# branch handling
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Branch $BRANCH exists locally."
  if [ "$FORCE" = "true" ]; then
    git checkout "$BRANCH"
  else
    echo "Checking out existing branch $BRANCH."
    git checkout "$BRANCH"
  fi
else
  echo "Creating branch $BRANCH"
  git checkout -b "$BRANCH"
fi

# stage
if [ "$ALL" = "true" ]; then
  git add -A
elif [[ -n "$PATHS" ]]; then
  IFS=',' read -ra P <<< "$PATHS"
  for p in "${P[@]}"; do
    p="$(echo "$p" | xargs)"  # trim
    if [[ -e "$p" ]]; then
      git add -- "$p"
    else
      echo "Warning: path not found: $p"
    fi
  done
else
  echo "No paths or --all provided; nothing to stage."
fi

# commit if there are staged changes
if git diff --cached --quiet; then
  echo "No staged changes to commit."
else
  COMMIT_MSG="${TITLE:-chore: update}"
  echo "Committing: $COMMIT_MSG"
  git commit -m "$COMMIT_MSG"
fi

# push
git push -u origin "$BRANCH"

# create PR
PR_CMD=(gh pr create --base "$BASE" --head "$BRANCH")
if [[ -n "$TITLE" ]]; then PR_CMD+=(--title "$TITLE"); fi
if [[ -n "$BODY" ]]; then PR_CMD+=(--body "$BODY"); fi
if [[ "$DRAFT" = "true" ]]; then PR_CMD+=(--draft); fi

# Add reviewers and labels if supported by gh (modern gh supports --reviewer and --label)
for r in "${REVIEWERS[@]}"; do PR_CMD+=(--reviewer "$r"); done
for l in "${LABELS[@]}"; do PR_CMD+=(--label "$l"); done

# create and capture URL
echo "Creating PR..."
set +e
PR_OUTPUT="$("${PR_CMD[@]}" 2>&1)"
PR_EXIT=$?
set -e

if [[ $PR_EXIT -ne 0 ]]; then
  echo "gh pr create failed. Output:"
  echo "$PR_OUTPUT"
  echo "Attempting fallback: create PR via gh api"
  # attempt octokit fallback
  gh api repos/{owner}/{repo}/pulls || true
  exit 1
fi

echo "$PR_OUTPUT"

# try to extract URL from output
PR_URL="$(echo "$PR_OUTPUT" | grep -Eo 'https://github.com/[^[:space:]]+/pull/[0-9]+' | head -n1 || true)"
if [[ -n "$PR_URL" ]]; then
  echo "PR created: $PR_URL"
  if [[ "$OPEN" = "true" ]]; then
    gh pr view --web --repo "$PR_URL" || gh pr view --web
  fi
else
  echo "Could not parse PR URL from gh output; run 'gh pr list --head $BRANCH' to find it."
fi

exit 0


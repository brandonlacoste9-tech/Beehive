#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [-p PR_NUMBER] [-b BRANCH] [-s SUBJECT] [-m BODY]" >&2
  echo "Examples:" >&2
  echo "  $0 -b infra/dev-machine -s 'feat(dev): Playwright+LLM' -m 'Merging infra/dev-machine'" >&2
  echo "  $0 -p 123" >&2
  exit 2
}

PR=""
BRANCH=""
SUBJECT="${SUBJECT:-feat: safe merge}"
BODY="${BODY:-Merged via safe-merge.sh}"

while getopts ":p:b:s:m:h" opt; do
  case "$opt" in
    p) PR="$OPTARG" ;;
    b) BRANCH="$OPTARG" ;;
    s) SUBJECT="$OPTARG" ;;
    m) BODY="$OPTARG" ;;
    h) usage ;;
    \?) usage ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "gh not found; install GitHub CLI" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated; run 'gh auth login'" >&2; exit 1; }

if [[ -z "$PR" && -n "$BRANCH" ]]; then
  PR=$(gh pr list --head "$BRANCH" --json number --jq '.[0].number' || true)
fi
if [[ -z "$PR" ]]; then
  echo "No PR resolved. Provide -p PR_NUMBER or -b BRANCH." >&2
  usage
fi

STATE=$(gh pr view "$PR" --json statusCheckRollup -q '.statusCheckRollup.state' 2>/dev/null || echo "UNKNOWN")
echo "PR=$PR state=$STATE"
if [[ "$STATE" != "SUCCESS" ]]; then
  echo "Checks not green (state=$STATE). Inspect runs and retry:" >&2
  echo "  gh pr view $PR --json statusCheckRollup -q '.statusCheckRollup'" >&2
  if [[ -n "$BRANCH" ]]; then
    echo "  gh run list --json databaseId,name,status,conclusion,headBranch -q '.[] | select(.headBranch==\"$BRANCH\")'" >&2
  fi
  exit 1
fi

gh pr merge "$PR" --squash --delete-branch --subject "$SUBJECT" --body "$BODY"
echo "Merged PR $PR."

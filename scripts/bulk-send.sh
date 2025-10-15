#!/usr/bin/env bash
# Bulk ritual to publish all local work and open PRs
set -euo pipefail

OWNER="${OWNER:-brandonlacoste9-tech}"
REPO="${REPO:-$(basename -s .git "$(git rev-parse --show-toplevel)")}"
BASE="${BASE:-main}"
MSG="${MSG:-chore: send local changes}"

printf '📡 CodexReplay.jobId=%s\n' "${JOB_ID:-local}" >&2
printf '📦 CodexReplay.sizeBytes=%s\n' "${SIZE_BYTES:-0}" >&2
printf '🚦 CodexReplay.status=pending\n' >&2

echo "🔐 verifying auth & refreshing remotes"
gh auth status >/dev/null
echo "🌐 fetching latest refs"
git fetch --all --tags --prune

if [ -n "$(git status --porcelain)" ]; then
  echo "🧮 staging and committing working tree"
  git add -A
  git commit -m "$MSG"
else
  echo "✅ working tree already clean"
fi

echo "🚢 pushing local branches"
for b in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  git push -u origin "$b"
done

echo "🏷️ pushing tags"
git push --tags

echo "🪄 conjuring pull requests"
for b in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  [ "$b" = "$BASE" ] && continue
  if gh pr list --head "$b" --state all --json number | jq -e 'length>0' >/dev/null; then
    continue
  fi
  if git diff --quiet "$BASE"..."$b"; then
    continue
  fi
  TITLE=$(git log "$BASE".."$b" --pretty=format:'%s' -n 1)
  BODY="Auto-opened via bulk ritual.\n\nLineage: reference an ADR (e.g., ADR-0002) or CHANGELOG.md."
  gh pr create --title "${TITLE:-Bulk: $b}" --body "$BODY" --base "$BASE" --head "$b" || true
done

echo "🏷️ applying foundation labels"
for pr in $(gh pr list --state open --json number --jq '.[].number'); do
  gh pr edit "$pr" --add-label "foundation-v1" 2>/dev/null || true
  gh pr edit "$pr" --add-label "roadmap" 2>/dev/null || true
  gh pr edit "$pr" --milestone "Q1 — AgentKit & Learn" 2>/dev/null || true
done

echo "🧮 open PR inventory"
gh pr list --state open --json number,title,headRefName --jq '.[] | "\(.number)\t\(.headRefName)\t\(.title)"'

printf '🚦 CodexReplay.status=complete\n' >&2
echo "✅ All rituals complete."

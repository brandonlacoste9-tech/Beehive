#!/usr/bin/env bash
set -euo pipefail

BASE_REF=""
ARTIFACT=".codex/codex_review_findings.txt"
SYSTEM="You are Codex, the BeeHive reviewer. Highlight clarity, modularity, and teachability."

print_usage() {
  cat <<'USAGE'
Usage: scripts/codex_review_exec.sh [--base <ref>] [--artifact <path>]

Options:
  --base <ref>       Git ref to diff against (defaults to origin/main or main).
  --artifact <path>  File path to store the Codex review (defaults to .codex/codex_review_findings.txt).
  -h, --help         Show this help message.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE_REF="$2"
      shift 2
      ;;
    --artifact)
      ARTIFACT="$2"
      shift 2
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      BASE_REF="$1"
      shift
      ;;
  esac
done

if [[ -z "${OPENAI_API_KEY:-}" && -z "${OPENAI_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is required for Codex review." >&2
  exit 1
fi

if [[ -z "$BASE_REF" ]]; then
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    BASE_REF="origin/main"
  elif git rev-parse --verify main >/dev/null 2>&1; then
    BASE_REF="main"
  else
    BASE_REF="$(git rev-list --max-parents=1 HEAD | tail -n 1)"
  fi
fi

DIFF=$(git diff --unified=3 --no-color "${BASE_REF}...HEAD")

if [[ -z "$DIFF" ]]; then
  echo "No changes detected compared to ${BASE_REF}." >&2
  exit 0
fi

PROMPT=$(cat <<EOF2
Draft a Codex review for the following patch. Respond with actionable findings and note any follow-up rituals. Remember BeeHive conventions.

${DIFF}
EOF2
)

mkdir -p "$(dirname "$ARTIFACT")"

CMD=(node scripts/gpt5_exec.mjs)
if command -v tsx >/dev/null 2>&1; then
  CMD=(tsx scripts/gpt5_exec.ts)
fi

RESULT=$(printf '%s\n' "$PROMPT" | "${CMD[@]}" --stdin --system "$SYSTEM")

printf '%s\n' "$RESULT" | tee "$ARTIFACT"

echo "Codex findings stored at $ARTIFACT" >&2

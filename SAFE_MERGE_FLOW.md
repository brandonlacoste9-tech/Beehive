# Safe Merge Flow (GitHub CLI)

Purpose
- One-stop, deterministic merge steps using GitHub CLI with clear checks, labels, and fallbacks.

Prerequisites
- GitHub CLI authenticated: `gh auth status` (or `gh auth login`)
- Permissions to view checks and merge PRs

Fast Path (one‑shot)
- `PR=$(gh pr list --head <branch> --json number --jq '.[0].number'); echo "PR=$PR"`
- `gh pr view "$PR" --json statusCheckRollup -q '.statusCheckRollup.state'`  # SUCCESS | FAILURE | PENDING
- `gh pr merge "$PR" --squash --delete-branch --subject "<subject>" --body "<body>"`

Detailed Steps
1) Identify PR
- `gh pr list --head <branch> --json number,title,headRefName`
- `gh pr view <PR> --web`

2) Verify CI checks
- Overall: `gh pr view <PR> --json statusCheckRollup -q '.statusCheckRollup.state'`
- If PENDING: wait and recheck; if FAILURE: inspect runs
  - `gh run list --json databaseId,name,status,conclusion,headBranch -q '.[] | select(.headBranch=="<branch>")'`
  - `gh run view <run-id> --web`

3) Merge (squash + delete branch)
- `gh pr merge <PR> --squash --delete-branch --subject "feat: <summary>" --body "Merging <branch>"`

4) Auto‑merge (Codex‑driven) alternative
- Apply label (repo policy + GH_TOKEN if automated): `gh pr edit <PR> --add-label auto-merge`

5) Rollback / Recovery
- Revert the merge commit:
  - `gh pr view <PR> --json mergeCommit -q .mergeCommit.oid | xargs -I{} sh -c 'git fetch && git checkout -b revert/{} origin/main && git revert {} && git push -u origin revert/{}'`
  - Or open a manual revert PR in the UI.

CLI Quick Reference
- List PRs: `gh pr list --search "<text>" --limit 50`
- View PR: `gh pr view <PR> --json number,title,headRefName,baseRefName,author,mergeStateStatus`
- Status checks: `gh pr view <PR> --json statusCheckRollup -q '.statusCheckRollup'`
- Labels: `gh label create <name> --description "<desc>"` | `gh pr edit <PR> --add-label <name>`
- Merge: `gh pr merge <PR> --squash|--merge|--rebase [--delete-branch]`
- Runs: `gh run list` | `gh run view <id> --web` | `gh run watch <id>`

Manuals
- GitHub CLI manual: https://cli.github.com/manual/
- gh reference: https://cli.github.com/manual/gh
- Agent tasks: https://cli.github.com/manual/gh_agent-task
- Create agent task: https://cli.github.com/manual/gh_agent-task_create

Notes
- Keep the auto‑merge label restricted to trusted operators.
- Confirm branch protections and required checks before merging.

Helper Scripts
- Bash: `scripts/safe-merge.sh` (-p PR or -b BRANCH, plus -s/-m)
- PowerShell: `scripts/safe-merge.ps1` (-PR <number> or -Branch <name>, plus -Subject/-Body)

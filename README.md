

See Safe Merge Flow: SAFE_MERGE_FLOW.md


See Netlify deployment checklist: DOCS/NETLIFY_DEPLOY.md

PowerShell PR automation: scripts/pr-create.ps1:1
  - Create branch, commit changes, push, and open a PR via `gh`.
  - Examples:
    - `./scripts/pr-create.ps1 -Branch feature/my-change -Title "feat: my change" -Body "Description" -All`
    - `./scripts/pr-create.ps1 -Branch infra/dev-machine -Draft -Reviewer user1 -Label automerge`
  - Parameters:
    - `-Branch` (required): new or existing branch name
    - `-Base` (optional): base branch (defaults to repo default)
    - `-Title`, `-Body` (optional): PR title/body; uses `--fill` if omitted
    - `-All` or `-Paths` (optional): what to commit
    - `-Draft`, `-Label`, `-Reviewer`, `-Open`, `-Force`

Bash PR automation: scripts/pr-create.sh:1
  - Same helper for Bash users; `chmod +x` then run from repo root.
  - Examples:
    - `./scripts/pr-create.sh --branch feature/my-change --title "feat: my change" --body "desc" --all`
    - `./scripts/pr-create.sh --branch feature/x --paths "README.md,docs/foo.md" --reviewer user1 --label infra`
  - Flags: `--branch` (required), `--base`, `--title`, `--body`, `--paths` or `--all`, `--draft`, `--reviewer`, `--label`, `--open`, `--force`

GitHub Action: .github/workflows/auto-pr.yml:1
  - Manually triggered (`workflow_dispatch`) workflow to create a PR from pushed changes.
  - Inputs: `branch`, `base`, `title`, `body`, `paths`, `all`, `draft`, `reviewers`, `labels`, `force`.
  - Uses `GITHUB_TOKEN`; ensure repo permissions allow pushes from Actions if needed.

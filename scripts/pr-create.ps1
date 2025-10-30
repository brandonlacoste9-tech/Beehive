<#
.SYNOPSIS
  Create a branch, commit changes, push, and open a PR with GitHub CLI (gh).

.EXAMPLE
  .\pr-create.ps1 -Branch feature/safe-merge-docs -Title "docs: add safe merge flow" -Body "Add SAFE_MERGE_FLOW.md" -All

.EXAMPLE
  .\pr-create.ps1 -Branch infra/dev-machine -Draft -Reviewer user1 -Label automerge
#>

[CmdletBinding()] param(
  [Parameter(Mandatory = $true)] [string]$Branch,
  [string]$Base,
  [string]$Title,
  [string]$Body,
  [string[]]$Paths,
  [switch]$All,
  [switch]$Draft,
  [string[]]$Label,
  [string[]]$Reviewer,
  [switch]$Open,
  [switch]$Force
)

function Fail([string]$Message, [int]$Code = 1) {
  Write-Error $Message
  exit $Code
}

# Require git and gh
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail 'git not found. Install from https://git-scm.com/' 1
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Fail 'GitHub CLI (gh) not found. Install from https://cli.github.com/' 1
}
gh auth status *> $null
if ($LASTEXITCODE -ne 0) { Fail 'GitHub CLI not authenticated. Run: gh auth login' 2 }

# Ensure we are in a git repo
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) { Fail 'Not inside a git repository.' 2 }

# Resolve base branch (default to repo default branch)
if ([string]::IsNullOrWhiteSpace($Base)) {
  try {
    $Base = gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
  } catch {
    $Base = 'main'
  }
}
Write-Host "Base=$Base Branch=$Branch"

# Create or switch to branch
git show-ref --verify "refs/heads/$Branch" *> $null
if ($LASTEXITCODE -eq 0) {
  if (-not $Force) { Fail "Branch '$Branch' already exists. Use -Force to reuse it." 3 }
  git checkout "$Branch" || Fail "Failed to checkout existing branch '$Branch'" 3
} else {
  git fetch origin "$Base" *> $null
  if ($LASTEXITCODE -ne 0) { Write-Host "Warning: could not fetch origin/$Base; continuing from local $Base" }
  git checkout -b "$Branch" "origin/$Base" *> $null
  if ($LASTEXITCODE -ne 0) { git checkout -b "$Branch" "$Base" || Fail "Failed to create branch '$Branch' from '$Base'" 3 }
}

# Stage changes
if ($All -or -not $Paths -or $Paths.Count -eq 0) {
  git add -A
} else {
  git add -- $Paths
}

# Commit if there are staged changes
$staged = git diff --cached --name-only
if (-not [string]::IsNullOrWhiteSpace($staged)) {
  if ([string]::IsNullOrWhiteSpace($Title)) { $Title = 'chore: update via pr-create.ps1' }
  git commit -m "$Title" || Fail 'Commit failed.' 4
} else {
  Write-Host 'No staged changes to commit.'
}

# Push branch
git push -u origin "$Branch" || Fail 'Push failed.' 5

# Build gh pr create args
$createArgs = @('pr','create','--head', $Branch, '--base', $Base)
if ($Title) { $createArgs += @('--title', $Title) } else { $createArgs += '--fill' }
if ($Body) { $createArgs += @('--body', $Body) }
if ($Draft) { $createArgs += '--draft' }
if ($Label) { foreach ($l in $Label) { if ($l) { $createArgs += @('--label', $l) } } }
if ($Reviewer) { foreach ($r in $Reviewer) { if ($r) { $createArgs += @('--reviewer', $r) } } }

# Try to create PR; if it already exists, show it
$created = $null
try {
  $json = & gh @createArgs --json number,url 2>$null
  if ($LASTEXITCODE -eq 0 -and $json) { $created = $json | ConvertFrom-Json }
} catch {}

if ($created) {
  Write-Host ("Created PR #{0} {1}" -f $created.number, $created.url)
  if ($Open) { gh pr view --web --json url --jq .url --head "$Branch" *> $null }
  exit 0
}

# Fallback: show existing PR for this branch
$existing = $null
try {
  $json2 = gh pr view --head "$Branch" --json number,url 2>$null
  if ($LASTEXITCODE -eq 0 -and $json2) { $existing = $json2 | ConvertFrom-Json }
} catch {}

if ($existing) {
  Write-Host ("PR already exists: #{0} {1}" -f $existing.number, $existing.url)
  if ($Open) { gh pr view --web --json url --jq .url --head "$Branch" *> $null }
  exit 0
}

Fail 'Failed to create or locate a PR for this branch.' 6


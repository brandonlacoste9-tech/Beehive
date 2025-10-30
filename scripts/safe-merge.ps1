<#
.SYNOPSIS
  Deterministic, safe PR merge flow using GitHub CLI (gh) for PowerShell.

.DESCRIPTION
  Resolves a PR by number or branch, verifies CI checks are SUCCESS, then merges with squash and deletes the branch.

.PARAMETER PR
  Pull request number to merge.

.PARAMETER Branch
  Source branch name; if provided (and PR not), resolves PR from branch.

.PARAMETER Subject
  Merge subject line.

.PARAMETER Body
  Merge body text.

.EXAMPLE
  .\safe-merge.ps1 -Branch infra/dev-machine -Subject 'feat(dev): Playwright+LLM' -Body 'Merging infra/dev-machine'

.EXAMPLE
  .\safe-merge.ps1 -PR 123
#>

[CmdletBinding()] param(
  [int]$PR,
  [string]$Branch,
  [string]$Subject = 'feat: safe merge',
  [string]$Body = 'Merged via safe-merge.ps1'
)

function Fail([string]$Message, [int]$Code = 1) {
  Write-Error $Message
  exit $Code
}

# Require gh
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Fail 'GitHub CLI (gh) not found. Install from https://cli.github.com/' 1
}
gh auth status *> $null
if ($LASTEXITCODE -ne 0) { Fail "GitHub CLI not authenticated. Run: gh auth login" 2 }

if (-not $PR -and [string]::IsNullOrWhiteSpace($Branch)) {
  Fail 'Provide -PR <number> or -Branch <name>.' 2
}

if (-not $PR -and $Branch) {
  try {
    $prJson = gh pr list --head $Branch --json number --jq '.[0].number'
    if ($prJson) { $PR = [int]$prJson }
  } catch { }
}
if (-not $PR) { Fail "No PR resolved from parameters. Branch='$Branch'" 3 }

$state = gh pr view $PR --json statusCheckRollup --jq '.statusCheckRollup.state' 2>$null
if (-not $state) { Fail "Unable to read status checks for PR #$PR" 4 }
Write-Host "PR=$PR state=$state"

switch ($state) {
  'SUCCESS' { }
  'PENDING' { Fail 'Status checks are pending. Wait for completion.' 5 }
  'FAILURE' {
    Write-Error 'Status checks failed. Inspect recent runs:'
    if ($Branch) {
      gh run list --json databaseId,name,status,conclusion,headBranch --jq (".[] | select(.headBranch==\"$Branch\")")
    } else {
      gh pr view $PR --json statusCheckRollup --jq '.statusCheckRollup'
    }
    exit 6
  }
  Default { Fail "Unknown status: $state" 7 }
}

gh pr merge $PR --squash --delete-branch --subject $Subject --body $Body
if ($LASTEXITCODE -eq 0) {
  Write-Host "Merged PR #$PR."
} else {
  Fail "Merge failed with exit code $LASTEXITCODE" $LASTEXITCODE
}

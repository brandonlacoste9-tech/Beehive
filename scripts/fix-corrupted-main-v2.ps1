# Fix corrupted file in GitHub main branch
# This script removes the invalid file using GitHub API

$ErrorActionPreference = "Stop"

$REPO = "brandonlacoste9-tech/Beehive"
$BRANCH = "main"
$CORRUPTED_PATH = ".github/workflows/- name: Cache   uses: actions"

Write-Host "Fixing corrupted file in $REPO..." -ForegroundColor Yellow

# Get current branch SHA
Write-Host "Getting current main branch state..." -ForegroundColor Cyan
$branchInfo = gh api "repos/$REPO/git/ref/heads/$BRANCH" | ConvertFrom-Json
$currentSha = $branchInfo.object.sha
Write-Host "Current main SHA: $currentSha" -ForegroundColor Cyan

# Get the commit tree
$commitInfo = gh api "repos/$REPO/git/commits/$currentSha" | ConvertFrom-Json
$treeSha = $commitInfo.tree.sha
Write-Host "Current tree SHA: $treeSha" -ForegroundColor Cyan

# Get the root tree
$rootTree = gh api "repos/$REPO/git/trees/$treeSha" | ConvertFrom-Json

# Find .github tree
$githubTreeEntry = $rootTree.tree | Where-Object { $_.path -eq ".github" }
if (-not $githubTreeEntry) {
    Write-Host "Error: .github directory not found" -ForegroundColor Red
    exit 1
}

$githubTreeSha = $githubTreeEntry.sha
Write-Host ".github tree SHA: $githubTreeSha" -ForegroundColor Cyan

# Get .github tree contents
$githubTree = gh api "repos/$REPO/git/trees/$githubTreeSha" | ConvertFrom-Json

# Find workflows tree
$workflowsTreeEntry = $githubTree.tree | Where-Object { $_.path -eq "workflows" }
if (-not $workflowsTreeEntry) {
    Write-Host "Error: workflows directory not found" -ForegroundColor Red
    exit 1
}

$workflowsTreeSha = $workflowsTreeEntry.sha
Write-Host "workflows tree SHA: $workflowsTreeSha" -ForegroundColor Cyan

# Get workflows tree and filter out corrupted entries
$workflowsTree = gh api "repos/$REPO/git/trees/$workflowsTreeSha" | ConvertFrom-Json
$validWorkflows = $workflowsTree.tree | Where-Object { -not ($_.path -like "- name:*") }

Write-Host "Valid workflow files found:" -ForegroundColor Green
$validWorkflows | ForEach-Object { Write-Host "  - $($_.path)" -ForegroundColor White }

# Create new workflows tree
$newWorkflowsTree = @{
    tree = @($validWorkflows | ForEach-Object {
        @{
            path = $_.path
            mode = $_.mode
            type = $_.type
            sha = $_.sha
        }
    })
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "Creating new workflows tree..." -ForegroundColor Yellow
$newWorkflowsTreeSha = ($newWorkflowsTree | gh api --method POST "repos/$REPO/git/trees" --input - | ConvertFrom-Json).sha
Write-Host "New workflows tree SHA: $newWorkflowsTreeSha" -ForegroundColor Green

# Get other .github items (excluding workflows)
$otherGithubItems = $githubTree.tree | Where-Object { $_.path -ne "workflows" }

# Create new .github tree with fixed workflows
$newGithubTreeItems = @($otherGithubItems | ForEach-Object {
    @{
        path = $_.path
        mode = $_.mode
        type = $_.type
        sha = $_.sha
    }
})
$newGithubTreeItems += @{
    path = "workflows"
    mode = "040000"
    type = "tree"
    sha = $newWorkflowsTreeSha
}

$newGithubTree = @{
    tree = $newGithubTreeItems
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "Creating new .github tree..." -ForegroundColor Yellow
$newGithubTreeSha = ($newGithubTree | gh api --method POST "repos/$REPO/git/trees" --input - | ConvertFrom-Json).sha
Write-Host "New .github tree SHA: $newGithubTreeSha" -ForegroundColor Green

# Get other root items (excluding .github)
$otherRootItems = $rootTree.tree | Where-Object { $_.path -ne ".github" }

# Create new root tree
$newRootTreeItems = @($otherRootItems | ForEach-Object {
    @{
        path = $_.path
        mode = $_.mode
        type = $_.type
        sha = $_.sha
    }
})
$newRootTreeItems += @{
    path = ".github"
    mode = "040000"
    type = "tree"
    sha = $newGithubTreeSha
}

$newRootTree = @{
    tree = $newRootTreeItems
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "Creating new root tree..." -ForegroundColor Yellow
$newRootTreeSha = ($newRootTree | gh api --method POST "repos/$REPO/git/trees" --input - | ConvertFrom-Json).sha
Write-Host "New root tree SHA: $newRootTreeSha" -ForegroundColor Green

# Create commit
$commitMessage = @"
fix: remove corrupted workflow directory structure

Removes invalid nested directories with malformed name:
.github/workflows/- name: Cache   uses: actions/.../cache@v4.3.0

This was blocking all git operations on Windows.

Auto-fixed via GitHub API
"@

$newCommitPayload = @{
    message = $commitMessage
    tree = $newRootTreeSha
    parents = @($currentSha)
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "Creating commit..." -ForegroundColor Yellow
$newCommit = ($newCommitPayload | gh api --method POST "repos/$REPO/git/commits" --input - | ConvertFrom-Json)
$newCommitSha = $newCommit.sha
Write-Host "New commit SHA: $newCommitSha" -ForegroundColor Green

# Update main branch reference
$updateRef = @{
    sha = $newCommitSha
    force = $false
} | ConvertTo-Json -Compress

Write-Host "Updating main branch reference..." -ForegroundColor Yellow
$updateRef | gh api --method PATCH "repos/$REPO/git/refs/heads/$BRANCH" --input - | Out-Null

Write-Host ""
Write-Host "Main branch fixed! Corrupted file removed." -ForegroundColor Green
Write-Host ""
Write-Host "New main SHA: $newCommitSha" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: git fetch origin" -ForegroundColor White
Write-Host "2. Run: git reset --hard origin/main" -ForegroundColor White
Write-Host "3. Create your webhook automation branch fresh from main" -ForegroundColor White

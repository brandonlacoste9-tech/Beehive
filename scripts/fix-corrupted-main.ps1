# Fix corrupted file in GitHub main branch
# This script removes the invalid file using GitHub API

$ErrorActionPreference = "Stop"

$REPO = "brandonlacoste9-tech/Beehive"
$BRANCH = "main"
$CORRUPTED_FILE = ".github/workflows/- name: Cache   uses: actions/- name: Cache   uses: actions/- name: Cache   uses: actions/- name: Cache   uses: actions/- name: Cache   uses: actions/cache@v4.3.0"

Write-Host "🔧 Fixing corrupted file in $REPO..." -ForegroundColor Yellow

# Get current branch SHA
$branchInfo = gh api "repos/$REPO/git/ref/heads/$BRANCH" | ConvertFrom-Json
$currentSha = $branchInfo.object.sha

Write-Host "Current main SHA: $currentSha" -ForegroundColor Cyan

# Get the commit tree
$commitInfo = gh api "repos/$REPO/git/commits/$currentSha" | ConvertFrom-Json
$treeSha = $commitInfo.tree.sha

Write-Host "Current tree SHA: $treeSha" -ForegroundColor Cyan

# Create new tree without the corrupted file
Write-Host "Creating new tree without corrupted file..." -ForegroundColor Yellow

$newTreeJson = @{
    base_tree = $treeSha
    tree = @(
        @{
            path = $CORRUPTED_FILE
            mode = "100644"
            type = "blob"
            sha = $null  # This will delete the file
        }
    )
} | ConvertTo-Json -Depth 10

# Create the new tree
$newTree = gh api --method POST "repos/$REPO/git/trees" --input - <<< $newTreeJson | ConvertFrom-Json

Write-Host "New tree created: $($newTree.sha)" -ForegroundColor Green

# Create new commit
$commitMessage = "fix: remove corrupted workflow file from main branch`n`nRemoves invalid filename that was blocking git operations on Windows.`n`nThis file had an invalid path:`n$CORRUPTED_FILE`n`n🤖 Auto-fixed with GitHub API"

$newCommitJson = @{
    message = $commitMessage
    tree = $newTree.sha
    parents = @($currentSha)
} | ConvertTo-Json -Depth 10

$newCommit = gh api --method POST "repos/$REPO/git/commits" --input - <<< $newCommitJson | ConvertFrom-Json

Write-Host "New commit created: $($newCommit.sha)" -ForegroundColor Green

# Update main branch reference
$updateRefJson = @{
    sha = $newCommit.sha
    force = $false
} | ConvertTo-Json

gh api --method PATCH "repos/$REPO/git/refs/heads/$BRANCH" --input - <<< $updateRefJson | Out-Null

Write-Host "✅ Main branch fixed! Corrupted file removed." -ForegroundColor Green
Write-Host "`nNew main SHA: $($newCommit.sha)" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: git fetch origin" -ForegroundColor White
Write-Host "2. Run: git reset --hard origin/main" -ForegroundColor White
Write-Host "3. Create your webhook automation branch fresh from main" -ForegroundColor White

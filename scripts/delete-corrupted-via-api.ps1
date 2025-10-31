# Delete corrupted workflow via GitHub contents API
# This forcibly removes the bad path

$REPO = "brandonlacoste9-tech/Beehive"
$BRANCH = "main"
$BAD_PATH = ".github/workflows/- name: Cache   uses: actions"

Write-Host "Attempting to delete corrupted path via GitHub API..." -ForegroundColor Yellow

try {
    # Try to get the file to get its SHA
    $response = gh api "repos/$REPO/contents/$BAD_PATH" `
        --header "Accept: application/vnd.github.v3+json" `
        2>&1

    if ($LASTEXITCODE -eq 0) {
        $content = $response | ConvertFrom-Json
        $sha = $content.sha

        Write-Host "Found object with SHA: $sha" -ForegroundColor Cyan

        # Delete it
        $deleteBody = @{
            message = "fix: remove corrupted workflow directory"
            sha = $sha
            branch = $BRANCH
        } | ConvertTo-Json

        gh api --method DELETE "repos/$REPO/contents/$BAD_PATH" `
            --input - <<< $deleteBody

        Write-Host "✅ Deleted corrupted path!" -ForegroundColor Green
    } else {
        Write-Host "Could not find object at path (might be too nested)" -ForegroundColor Red
        Write-Host "You'll need to use the GitHub web UI" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Manual deletion via GitHub UI required" -ForegroundColor Yellow
}

Write-Host "`nIf this didn't work, follow the manual steps:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/$REPO/tree/$BRANCH/.github/workflows" -ForegroundColor White
Write-Host "2. Find and delete the directory starting with '- name: Cache'" -ForegroundColor White
Write-Host "3. Commit with message: fix: remove corrupted workflow" -ForegroundColor White

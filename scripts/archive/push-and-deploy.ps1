#!/usr/bin/env pwsh
# push-and-deploy.ps1
# Push bee-ship changes and trigger Netlify deployment

param(
    [string]$Branch = "feat/bee-ship-complete",
    [switch]$CreatePR,
    [switch]$Force
)

Write-Host "`n🚢 Bee-ship Push & Deploy" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# --- 1) Verify git status ---
Write-Host "▶ Checking git status..." -ForegroundColor Yellow

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne $Branch) {
    Write-Host "  ⚠ Warning: Current branch is '$currentBranch', expected '$Branch'" -ForegroundColor Yellow
    if (-not $Force) {
        $response = Read-Host "  Continue anyway? (y/N)"
        if ($response -ne 'y') {
            Write-Host "Aborted." -ForegroundColor Red
            exit 1
        }
    }
}

# --- 2) Push to remote ---
Write-Host "`n▶ Pushing to origin/$Branch..." -ForegroundColor Yellow

try {
    git push origin $Branch 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Pushed successfully" -ForegroundColor Green
    } else {
        # Try with -u if branch doesn't exist upstream
        git push -u origin $Branch
        Write-Host "  ✓ Branch created and pushed" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Push failed: $_" -ForegroundColor Red
    exit 1
}

# --- 3) Create PR (optional) ---
if ($CreatePR) {
    Write-Host "`n▶ Creating Pull Request..." -ForegroundColor Yellow
    
    # Check if gh CLI is available
    $ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
    
    if ($ghAvailable) {
        $prTitle = "feat(bee): Complete Bee-ship deployment with platform integrations"
        $prBody = @"
## 🐝 Bee-ship Complete Deployment

This PR adds the complete Bee-ship autonomous deployment system:

### ✨ Features
- **Platform Integrations**: Instagram, YouTube, TikTok (stub)
- **Serverless Function**: Netlify function for bee-ship automation
- **Payment Flows**: Stripe, Coinbase Commerce, Google Pay
- **Analytics**: Usage tracking, crypto intel feeds
- **Email**: Welcome emails, receipts via nodemailer
- **Security**: CSP headers, pre-commit hooks

### 📦 New Files
- ``lib/platforms/{instagram,youtube,tiktok}.ts``
- ``netlify/functions/bee-ship.ts``
- ``app/api/checkout/``, ``app/api/crypto/``
- ``app/components/UsageBadge.tsx``, ``CryptoFeed.tsx``

### 🔧 Environment Variables Required
See ``.env.example`` for complete list. Key vars:
- ``BEE_API_URL``, ``BEE_API_KEY``
- ``SUPABASE_URL``, ``SUPABASE_SERVICE_ROLE_KEY``
- ``INSTAGRAM_ACCOUNT_ID``, ``FB_ACCESS_TOKEN``
- ``STRIPE_SECRET_KEY``, ``COINBASE_API_KEY``

### ✅ Testing
- [ ] Set all environment variables in Netlify
- [ ] Test bee-ship function with test seed
- [ ] Verify Instagram publish (test account)
- [ ] Check Supabase asset upload
- [ ] Confirm payment flows work

### 🚀 Deploy Steps
1. Merge this PR to ``main``
2. Netlify auto-deploys
3. Test function at ``/.netlify/functions/bee-ship``
4. Monitor logs for errors

---
**Ready to ship the swarm! 🐝**
"@
        
        gh pr create --title $prTitle --body $prBody --base main --head $Branch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Pull Request created" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ PR creation failed - create manually on GitHub" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ GitHub CLI (gh) not found. Install with:" -ForegroundColor Yellow
        Write-Host "    winget install GitHub.cli" -ForegroundColor Gray
        Write-Host "  Or create PR manually at:" -ForegroundColor Yellow
        Write-Host "    https://github.com/brandonlacoste9-tech/Beehive/compare/$Branch" -ForegroundColor Cyan
    }
}

# --- 4) Netlify deployment status ---
Write-Host "`n▶ Checking Netlify deployment..." -ForegroundColor Yellow

$netlifyAvailable = Get-Command netlify -ErrorAction SilentlyContinue

if ($netlifyAvailable) {
    Write-Host "  → Triggering Netlify build..." -ForegroundColor Gray
    netlify deploy --prod 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Deployment triggered" -ForegroundColor Green
        Write-Host "  → Monitor at: https://app.netlify.com" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠ Deploy command failed - check Netlify CLI auth" -ForegroundColor Yellow
        Write-Host "  Run: netlify login" -ForegroundColor Gray
    }
} else {
    Write-Host "  ℹ Netlify CLI not found. Auto-deploy will happen on merge to main." -ForegroundColor Gray
    Write-Host "  Install CLI: npm i -g netlify-cli" -ForegroundColor Gray
}

# --- 5) Summary ---
Write-Host "`n✨ Push complete!" -ForegroundColor Green
Write-Host "`nNext actions:" -ForegroundColor Cyan
Write-Host "  1. Review PR (if created) or merge $Branch to main" -ForegroundColor White
Write-Host "  2. Set environment variables in Netlify UI" -ForegroundColor White
Write-Host "  3. Monitor deployment at https://app.netlify.com" -ForegroundColor White
Write-Host "  4. Test function endpoint once deployed" -ForegroundColor White

Write-Host "`n🐝 The swarm is ready to ship!`n" -ForegroundColor Yellow

#!/usr/bin/env pwsh
# Complete Setup Script for Crypto Intel + Payments + Production Features
# Run: powershell -ExecutionPolicy Bypass -File setup-complete-stack.ps1

$ErrorActionPreference = "Continue"

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  AdGenXAI Beehive - Complete Stack Setup      ║" -ForegroundColor Cyan
Write-Host "║  Crypto Intel + Payments + Production Ready   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
$dirs = @(
    "app\api\crypto-intel\history",
    "app\api\checkout",
    "app\api\stripe-webhook",
    "app\api\crypto",
    "app\api\crypto-webhook",
    "app\api\usage",
    "app\thanks",
    "app\blog\[slug]",
    "content\posts",
    "scripts",
    "data",
    ".github\workflows"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✓ $dir" -ForegroundColor Green
}

# Step 2: Check package.json for required dependencies
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
$requiredDeps = @(
    "stripe",
    "zod",
    "nodemailer",
    "@stripe/stripe-js",
    "framer-motion"
)

$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    if (-not $packageJson.dependencies.$dep) {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host "  ℹ Missing dependencies: $($missingDeps -join ', ')" -ForegroundColor Yellow
    Write-Host "  Run: npm install $($missingDeps -join ' ')" -ForegroundColor Cyan
} else {
    Write-Host "  ✓ All required dependencies present" -ForegroundColor Green
}

# Step 3: Check for optional crypto payment dependencies
Write-Host "`n💎 Optional crypto payment deps..." -ForegroundColor Yellow
if (-not $packageJson.dependencies."coinbase-commerce-node") {
    Write-Host "  ℹ For crypto payments: npm i coinbase-commerce-node" -ForegroundColor Gray
}
if (-not $packageJson.dependencies."gray-matter") {
    Write-Host "  ℹ For blog: npm i gray-matter marked" -ForegroundColor Gray
}

# Step 4: Verify component files
Write-Host "`n🧩 Verifying component files..." -ForegroundColor Yellow
$components = @(
    "app\components\Sparkline.tsx",
    "app\components\CryptoIntel.tsx",
    "app\components\ThemeToggle.tsx",
    "app\components\MetricCounter.tsx",
    "app\components\UsageBadge.tsx"
)

foreach ($comp in $components) {
    if (Test-Path $comp) {
        Write-Host "  ✓ $comp" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $comp (missing)" -ForegroundColor Red
    }
}

# Step 5: Check globals.css for aurora styles
Write-Host "`n🎨 Checking CSS enhancements..." -ForegroundColor Yellow
$css = Get-Content "app\globals.css" -Raw
if ($css -match "\.aurora\s*\{") {
    Write-Host "  ✓ Aurora effects present" -ForegroundColor Green
} else {
    Write-Host "  ✗ Aurora styles missing - check globals.css" -ForegroundColor Red
}

# Step 6: Environment variable checklist
Write-Host "`n🔐 Environment Variable Checklist..." -ForegroundColor Yellow
Write-Host "  Add these to Netlify Environment or .env.local:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Core" -ForegroundColor Gray
Write-Host "  NEXT_PUBLIC_SITE_URL=https://yoursite.netlify.app"
Write-Host "  GITHUB_TOKEN=ghp_xxx (for models:read)"
Write-Host ""
Write-Host "  # Stripe (optional)" -ForegroundColor Gray
Write-Host "  STRIPE_SECRET_KEY=sk_test_xxx"
Write-Host "  STRIPE_PRICE_MONTHLY=price_xxx"
Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_xxx"
Write-Host "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx"
Write-Host ""
Write-Host "  # Coinbase Commerce (optional)" -ForegroundColor Gray
Write-Host "  COINBASE_API_KEY=xxx"
Write-Host "  COINBASE_WEBHOOK_SECRET=xxx"
Write-Host ""
Write-Host "  # Email (optional)" -ForegroundColor Gray
Write-Host "  SMTP_HOST=smtp.example.com"
Write-Host "  SMTP_PORT=587"
Write-Host "  SMTP_USER=xxx"
Write-Host "  SMTP_PASS=xxx"
Write-Host "  FROM_EMAIL=AdGenXAI <no-reply@example.com>"
Write-Host ""

# Step 7: Create .env.example if missing
if (-not (Test-Path ".env.example")) {
    Write-Host "📝 Creating .env.example..." -ForegroundColor Yellow
    $envExample = @"
# Public
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_123

# GitHub Models
GITHUB_TOKEN=ghp_xxx

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_123
STRIPE_PRICE_MONTHLY=price_123
STRIPE_WEBHOOK_SECRET=whsec_123

# Coinbase Commerce (optional)
COINBASE_API_KEY=cb_api_123
COINBASE_WEBHOOK_SECRET=cb_whsec_123

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=***
FROM_EMAIL="AdGenXAI <no-reply@adgenxai.com>"
"@
    Set-Content -Path ".env.example" -Value $envExample -Encoding UTF8
    Write-Host "  ✓ Created .env.example" -ForegroundColor Green
}

# Step 8: Initialize data directory
Write-Host "`n💾 Initializing data store..." -ForegroundColor Yellow
if (-not (Test-Path "data\users.json")) {
    Set-Content -Path "data\users.json" -Value "[]" -Encoding UTF8
    Write-Host "  ✓ Created data\users.json" -ForegroundColor Green
}

# Step 9: Git status check
Write-Host "`n📊 Git Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --short 2>&1
    if ($gitStatus) {
        Write-Host "  ℹ You have uncommitted changes. Review them before deploying." -ForegroundColor Cyan
    } else {
        Write-Host "  ✓ Working directory clean" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠ Git not configured" -ForegroundColor Yellow
}

# Step 10: Next steps
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete! 🎉                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Install any missing dependencies:" -ForegroundColor White
Write-Host "     npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Run setup-crypto-files.ps1 to create API routes:" -ForegroundColor White
Write-Host "     powershell -ExecutionPolicy Bypass -File setup-crypto-files.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Add CryptoIntel to your page:" -ForegroundColor White
Write-Host "     import CryptoIntel from '@/components/CryptoIntel';" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Test locally:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Build and deploy:" -ForegroundColor White
Write-Host "     npm run build && git push" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Read CRYPTO_INTEL_SETUP.md for full documentation" -ForegroundColor Cyan
Write-Host ""

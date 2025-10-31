# Complete AdGenXAI Enhancement Setup Script
# Run this in regular Windows PowerShell (5.1+)

Write-Host "🚀 Setting up AdGenXAI enhancements..." -ForegroundColor Cyan

# Create directories
Write-Host "`n📁 Creating directories..." -ForegroundColor Yellow
$dirs = @(
    "app\api\checkout",
    "app\api\stripe-webhook",
    "app\api\usage",
    "app\api\crypto-feed",
    "app\api\crypto",
    "app\api\crypto-webhook",
    "app\thanks",
    "data",
    "public",
    "content\posts",
    "scripts"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    }
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install coinbase-commerce-node gray-matter marked @stripe/react-stripe-js

Write-Host "`n✅ Setup complete! Now creating files..." -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Files will be created via separate script"
Write-Host "2. Run: git add ."
Write-Host "3. Run: git commit -m 'feat(payments+ux): Add Stripe, crypto feed, usage tracking, theme toggle'"
Write-Host "4. Run: npm run dev or npx netlify dev" -ForegroundColor Yellow

# Beehive Endgame - Complete Setup Script
# Run this from repo root in PowerShell

Write-Host "🚀 ENDGAME: Complete AdGenXAI Stack Setup" -ForegroundColor Magenta

# Create all necessary API directories
Write-Host "`n📁 Creating API directories..." -ForegroundColor Yellow
$apiDirs = @(
    "app\api\checkout",
    "app\api\stripe-webhook",
    "app\api\crypto",
    "app\api\crypto-webhook",
    "app\api\email",
    "test",
    "test\components",
    "e2e",
    "logs",
    "public\icons"
)

foreach ($dir in $apiDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    }
}

# Install dependencies
Write-Host "`n📦 Installing payment & email dependencies..." -ForegroundColor Yellow
npm install stripe @stripe/stripe-js nodemailer
npm install -D @types/nodemailer ts-node

Write-Host "`n✅ ENDGAME SETUP COMPLETE!" -ForegroundColor Green
Write-Host "`nRun the API file creation scripts next..." -ForegroundColor Cyan

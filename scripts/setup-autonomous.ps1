# Beehive Autonomous Stack - Setup Script
# Run this in PowerShell from the repo root

Write-Host "🚀 Setting up Beehive Autonomous Stack..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Initialize Husky
Write-Host "`n🔒 Setting up Husky pre-commit hooks..." -ForegroundColor Yellow
npm run prepare

# Step 3: Create test directories
Write-Host "`n📁 Creating test directories..." -ForegroundColor Yellow
if (-not (Test-Path "test")) { New-Item -ItemType Directory -Path "test" }
if (-not (Test-Path "test\components")) { New-Item -ItemType Directory -Path "test\components" }
if (-not (Test-Path "e2e")) { New-Item -ItemType Directory -Path "e2e" }
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }

# Step 4: Create .env.example if it doesn't exist
Write-Host "`n⚙️  Creating .env.example..." -ForegroundColor Yellow
$envExample = @"
# OpenAI ChatGPT Business API Key
OPENAI_API_KEY=sk-proj-your-key-here

# Email Configuration
REPORT_EMAIL=your-email@gmail.com
REPORT_PASS=your-app-password
EMAIL_SERVICE=gmail

# Netlify (Optional)
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
DEPLOY_URL=https://your-site.netlify.app

# Features
STORE_SUMMARIES=true
ENABLE_WEBHOOK_PROCESSING=true
"@

$envExample | Out-File -FilePath ".env.example" -Encoding UTF8

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Copy .env.example to .env and fill in your credentials"
Write-Host "  2. Get OpenAI API key: https://platform.openai.com/api-keys"
Write-Host "  3. Get Gmail app password: Gmail → Security → 2-Step → App passwords"
Write-Host "  4. Add secrets to GitHub: Settings → Secrets and variables → Actions"
Write-Host "`n🔑 Required GitHub Secrets:"
Write-Host "  - OPENAI_API_KEY"
Write-Host "  - REPORT_EMAIL"
Write-Host "  - REPORT_PASS"
Write-Host "  - NETLIFY_AUTH_TOKEN (optional)"
Write-Host "  - NETLIFY_SITE_ID (optional)"
Write-Host "`n🧪 Test the automation:"
Write-Host "  npm test                          # Run unit tests"
Write-Host "  npm run e2e                       # Run E2E tests"
Write-Host "  npx ts-node scripts/email-report.ts      # Test email"
Write-Host "  npx ts-node scripts/chatgpt-relay.ts     # Test ChatGPT"
Write-Host "`n📚 Documentation:"
Write-Host "  See PHASE9_AUTONOMOUS.md for complete setup guide"
Write-Host ""

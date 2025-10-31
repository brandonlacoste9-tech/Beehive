# AdGenXAI Complete File Creator
# Run this in Windows PowerShell 5.1+

Write-Host "🚀 Creating AdGenXAI enhancement files..." -ForegroundColor Cyan

# Navigate to repo root
cd $PSScriptRoot

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
    "content\posts",
    "scripts"
)
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    }
}

# Create data\users.json
Write-Host "`n📄 Creating data files..." -ForegroundColor Yellow
if (!(Test-Path "data\users.json")) {
    "[]" | Out-File -FilePath "data\users.json" -Encoding UTF8
    Write-Host "  ✓ Created data\users.json" -ForegroundColor Green
}

# Create public\manifest.webmanifest
if (!(Test-Path "public\manifest.webmanifest")) {
    @"
{
  "name": "AdGenXAI",
  "short_name": "AdGenXAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7FAFF",
  "theme_color": "#7C4DFF",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
"@ | Out-File -FilePath "public\manifest.webmanifest" -Encoding UTF8
    Write-Host "  ✓ Created public\manifest.webmanifest" -ForegroundColor Green
}

Write-Host "`n✅ Directories and data files created!" -ForegroundColor Green
Write-Host "`nNext: Copy API route files from IMPLEMENTATION_GUIDE.md" -ForegroundColor Cyan
Write-Host "Then run: npm install coinbase-commerce-node gray-matter marked @stripe/react-stripe-js" -ForegroundColor Yellow

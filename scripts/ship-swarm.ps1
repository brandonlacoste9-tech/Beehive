# scripts/ship-swarm.ps1
# Windows PowerShell version of ship-swarm

param(
  [string]$ApiUrl = "https://your-site.netlify.app/.netlify/functions/bee-ship",
  [string]$Platforms = "instagram"
)

$seeds = @(
  "promo-summer-sale",
  "promo-limited-fomo",
  "event-product-launch",
  "feature-showcase-ai",
  "testimonial-social-proof"
)

Write-Host "🐝 Shipping bee swarm to $Platforms..." -ForegroundColor Yellow

foreach ($seed in $seeds) {
  Write-Host "  → Deploying: $seed" -ForegroundColor Cyan
  
  $body = @{
    seed = $seed
    platforms = @($Platforms)
  } | ConvertTo-Json
  
  try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json"
    if ($response.ok) {
      Write-Host "    ✓ Success" -ForegroundColor Green
    } else {
      Write-Host "    ✗ Error: $($response.error)" -ForegroundColor Red
    }
  } catch {
    Write-Host "    ✗ Failed: $_" -ForegroundColor Red
  }
  
  Start-Sleep -Seconds 2
}

Write-Host "`n✓ Swarm deployment complete" -ForegroundColor Green
